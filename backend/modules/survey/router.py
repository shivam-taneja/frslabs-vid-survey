from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from db.database import get_db
from core.interceptors import ApiResponseRoute
from .schemas import CreateSurveyPayload, AddQuestionsPayload, SurveyOut
from .service import SurveyService

router = APIRouter(
    prefix="/api/surveys", tags=["Surveys"], route_class=ApiResponseRoute
)


def get_service(db: Session = Depends(get_db)) -> SurveyService:
    return SurveyService(db)


@router.get("")
async def list_surveys(service: SurveyService = Depends(get_service)):
    return service.list_surveys()


@router.post("")
async def create_survey(
    payload: CreateSurveyPayload, service: SurveyService = Depends(get_service)
):
    return service.create_survey(payload)


@router.post("/{id}/questions")
async def add_questions(
    id: str,
    payload: AddQuestionsPayload,
    service: SurveyService = Depends(get_service),
):
    return service.add_questions(id, payload)


@router.get("/{id}")
async def get_survey(id: str, service: SurveyService = Depends(get_service)):
    return service.get_survey(id)


@router.post("/{id}/publish")
async def publish_survey(id: str, service: SurveyService = Depends(get_service)):
    return service.publish_survey(id)


@router.post("/{id}/start")
async def start_submission(
    id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    from modules.submission.service import SubmissionService

    service = SubmissionService(db)
    return await service.start_submission(id, request)
