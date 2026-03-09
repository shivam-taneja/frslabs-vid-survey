from fastapi import APIRouter, Depends, File, UploadFile, Form, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.database import get_db
from core.interceptors import ApiResponseRoute
from .schemas import SaveAnswersPayload, SubmissionOut, AnswerOut
from .service import SubmissionService

router = APIRouter(
    prefix="/api/submissions",
    tags=["Submissions"],
    route_class=ApiResponseRoute,
)


def get_service(db: Session = Depends(get_db)) -> SubmissionService:
    return SubmissionService(db)


@router.get("/{id}", response_model=SubmissionOut)
async def get_submission(id: str, service: SubmissionService = Depends(get_service)):
    return service.get_submission(id)


@router.get("/{id}/answers", response_model=list[AnswerOut])
async def get_answers(id: str, service: SubmissionService = Depends(get_service)):
    return service.get_answers(id)


@router.post("/{id}/answers", response_model=list[AnswerOut])
async def save_answers(
    id: str,
    payload: SaveAnswersPayload,
    service: SubmissionService = Depends(get_service),
):
    return service.save_answers(id, payload)


@router.post("/{id}/media")
async def upload_media(
    id: str,
    question_id: str = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
    service: SubmissionService = Depends(get_service),
):
    return await service.upload_media(id, question_id, type, file)


@router.post("/{id}/complete", response_model=SubmissionOut)
async def complete_submission(
    id: str,
    request: Request,
    service: SubmissionService = Depends(get_service),
):
    return await service.complete_submission(id, request)


@router.get("/{submission_id}/export")
async def export_submission(
    submission_id: str,
    service: SubmissionService = Depends(get_service),
):
    zip_buffer = service.export_submission(submission_id)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={submission_id}.zip"},
    )
