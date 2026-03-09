from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import StreamingResponse
import io
import zipfile

from core.interceptors import ApiResponseRoute
from .schemas import SaveAnswersPayload

router = APIRouter(
    prefix="/api/submissions", tags=["Submissions"], route_class=ApiResponseRoute
)


@router.post("/{id}/answers")
async def save_answers(id: str, payload: SaveAnswersPayload):
    return None


@router.post("/{id}/media")
async def upload_media(
    id: str,
    question_id: str = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
):
    print(f"Received file {file.filename} of type {type} for question {question_id}")
    return None


@router.post("/{id}/complete")
async def complete_submission(id: str):
    return {
        "id": id,
        "survey_id": "survey_123",
        "started_at": "2026-03-09T10:05:00Z",
        "completed_at": "2026-03-09T10:15:00Z",
        "overall_score": 88,
    }


@router.get("/{submission_id}/export")
async def export_submission(submission_id: str):
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        mock_metadata = '{"submission_id": "sub_999", "overall_score": 88}'
        zip_file.writestr("metadata.json", mock_metadata)
        zip_file.writestr("videos/full_session.mp4", b"Mock Video Content")
        zip_file.writestr("images/q1_face.png", b"Mock Image Content")

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={submission_id}.zip"},
    )
