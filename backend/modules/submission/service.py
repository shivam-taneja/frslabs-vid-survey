import os
import json
import zipfile
import io
import httpx
from pathlib import Path
from fastapi import HTTPException, UploadFile, Request
from sqlalchemy.orm import Session
from user_agents import parse as ua_parse

from core.config import settings
from .models import SurveySubmission, SurveyAnswer, MediaFile
from .schemas import SaveAnswersPayload
from modules.survey.models import Survey, SurveyQuestion


class StorageService:
    """
    Thin abstraction over local filesystem.
    Swap this class alone to move to S3, GCS, etc.
    """

    def __init__(self, media_root: str = settings.MEDIA_ROOT):
        self.media_root = media_root

    def save(
        self, submission_id: str, filename: str, subfolder: str, data: bytes
    ) -> str:
        dir_path = Path(self.media_root) / submission_id / subfolder
        dir_path.mkdir(parents=True, exist_ok=True)
        file_path = dir_path / filename
        file_path.write_bytes(data)
        # Return relative path — store this in DB, not the absolute path
        return str(Path(submission_id) / subfolder / filename)

    def read(self, relative_path: str) -> bytes:
        full_path = Path(self.media_root) / relative_path
        if not full_path.exists():
            raise FileNotFoundError(f"Media not found: {relative_path}")
        return full_path.read_bytes()


async def resolve_location(ip: str) -> str:
    """IP → country/city string. Falls back to 'Unknown' gracefully."""
    if ip in ("127.0.0.1", "::1", "testclient"):
        return "Local"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                f"http://ip-api.com/json/{ip}?fields=country,city,status"
            )
            data = resp.json()
            if data.get("status") == "success":
                return f"{data.get('city', '')}, {data.get('country', '')}".strip(", ")
    except Exception:
        pass
    return "Unknown"


def parse_user_agent(ua_string: str) -> dict:
    ua = ua_parse(ua_string)
    device = "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "Desktop"
    return {
        "browser": ua.browser.family,
        "os": ua.os.family,
        "device": device,
    }


class SubmissionService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = StorageService()

    async def start_submission(
        self, survey_id: str, request: Request
    ) -> SurveySubmission:
        survey = (
            self.db.query(Survey)
            .filter(Survey.id == survey_id, Survey.is_active == True)
            .first()
        )
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found or inactive")

        # Capture metadata at start
        ip = (
            request.headers.get("X-Forwarded-For", request.client.host)
            .split(",")[0]
            .strip()
        )
        ua_string = request.headers.get("User-Agent", "")
        ua_data = parse_user_agent(ua_string)
        location = await resolve_location(ip)

        submission = SurveySubmission(
            survey_id=survey_id,
            ip_address=ip,
            browser=ua_data["browser"],
            device=ua_data["device"],
            os=ua_data["os"],
            location=location,
        )
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        return submission

    async def upload_media(
        self,
        submission_id: str,
        question_id: str,
        file_type: str,
        file: UploadFile,
    ) -> MediaFile:
        submission = self._get_submission(submission_id)

        content = await file.read()
        ext = Path(file.filename or "file").suffix or (
            ".webm" if file_type == "video" else ".png"
        )
        filename = f"{question_id}_{file_type}{ext}"
        subfolder = "videos" if file_type == "video" else "images"

        relative_path = self.storage.save(submission_id, filename, subfolder, content)

        # If it's an image, update the answer's face_image_path too
        if file_type == "image":
            answer = (
                self.db.query(SurveyAnswer)
                .filter(
                    SurveyAnswer.submission_id == submission_id,
                    SurveyAnswer.question_id == question_id,
                )
                .first()
            )
            if answer:
                answer.face_image_path = relative_path
                self.db.add(answer)

        media = MediaFile(
            submission_id=submission_id,
            question_id=question_id,
            type=file_type,
            path=relative_path,
        )
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def save_answers(
        self, submission_id: str, payload: SaveAnswersPayload
    ) -> list[SurveyAnswer]:
        self._get_submission(submission_id)

        answers = []
        for a in payload.answers:
            # Upsert: update if already exists (retry scenario)
            existing = (
                self.db.query(SurveyAnswer)
                .filter(
                    SurveyAnswer.submission_id == submission_id,
                    SurveyAnswer.question_id == a.question_id,
                )
                .first()
            )

            if existing:
                existing.answer = a.answer
                existing.face_detected = a.face_detected
                existing.face_score = a.face_score
                answers.append(existing)
            else:
                answer = SurveyAnswer(
                    submission_id=submission_id,
                    question_id=a.question_id,
                    answer=a.answer,
                    face_detected=a.face_detected,
                    face_score=a.face_score,
                )
                self.db.add(answer)
                answers.append(answer)

        self.db.commit()
        return answers

    async def complete_submission(
        self, submission_id: str, request: Request
    ) -> SurveySubmission:
        from datetime import datetime, timezone

        submission = self._get_submission(submission_id)

        # Refresh IP + location at completion (user may have switched networks)
        ip = (
            request.headers.get("X-Forwarded-For", request.client.host)
            .split(",")[0]
            .strip()
        )
        location = await resolve_location(ip)
        submission.ip_address = ip
        submission.location = location

        scores = [
            a.face_score
            for a in submission.answers
            if a.face_detected and a.face_score > 0
        ]
        submission.overall_score = (
            round(sum(scores) / len(scores), 2) if scores else 0.0
        )
        submission.completed_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(submission)
        return submission

    def export_submission(self, submission_id: str) -> io.BytesIO:
        submission = self._get_submission(submission_id)

        # Build metadata.json
        metadata = {
            "submission_id": submission.id,
            "survey_id": submission.survey_id,
            "started_at": (
                submission.started_at.isoformat() if submission.started_at else None
            ),
            "completed_at": (
                submission.completed_at.isoformat() if submission.completed_at else None
            ),
            "ip_address": submission.ip_address,
            "device": submission.device,
            "browser": submission.browser,
            "os": submission.os,
            "location": submission.location,
            "overall_score": submission.overall_score,
            "responses": [
                {
                    "question": (
                        a.question.question_text if a.question else a.question_id
                    ),
                    "answer": a.answer,
                    "face_detected": a.face_detected,
                    "score": a.face_score,
                    "face_image": a.face_image_path,
                }
                for a in sorted(
                    submission.answers,
                    key=lambda x: x.question.order if x.question else 0,
                )
            ],
        }

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("metadata.json", json.dumps(metadata, indent=2))

            # Add all media files
            for media in submission.media_files:
                try:
                    data = self.storage.read(media.path)
                    zip_path = (
                        f"videos/{Path(media.path).name}"
                        if media.type == "video"
                        else f"images/{Path(media.path).name}"
                    )
                    zf.writestr(zip_path, data)
                except FileNotFoundError:
                    pass  # Skip missing files gracefully

        zip_buffer.seek(0)
        return zip_buffer

    def _get_submission(self, submission_id: str) -> SurveySubmission:
        submission = (
            self.db.query(SurveySubmission)
            .filter(SurveySubmission.id == submission_id)
            .first()
        )
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        return submission
