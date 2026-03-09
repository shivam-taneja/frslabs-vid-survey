from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from db.database import get_db
from core.interceptors import ApiResponseRoute
from .schemas import CreateSurveyPayload, AddQuestionsPayload, UpdateSurveyPayload
from .service import SurveyService
from modules.submission.service import SubmissionService

router = APIRouter(
    prefix="/api/surveys", tags=["Surveys"], route_class=ApiResponseRoute
)


def get_survey_service(db: Session = Depends(get_db)) -> SurveyService:
    return SurveyService(db)


def get_submission_service(db: Session = Depends(get_db)) -> SubmissionService:
    return SubmissionService(db)


@router.get("")
async def list_surveys(service: SurveyService = Depends(get_survey_service)):
    return service.list_surveys()


@router.post("")
async def create_survey(
    payload: CreateSurveyPayload, service: SurveyService = Depends(get_survey_service)
):
    return service.create_survey(payload)


@router.get("/{id}")
async def get_survey(id: str, service: SurveyService = Depends(get_survey_service)):
    return service.get_survey(id)


@router.patch("/{id}")
async def update_survey(
    id: str,
    payload: UpdateSurveyPayload,
    service: SurveyService = Depends(get_survey_service),
):
    return service.update_survey(id, payload)


@router.delete("/{id}")
async def delete_survey(id: str, service: SurveyService = Depends(get_survey_service)):
    return service.delete_survey(id)


@router.post("/{id}/questions")
async def add_questions(
    id: str,
    payload: AddQuestionsPayload,
    service: SurveyService = Depends(get_survey_service),
):
    return service.add_questions(id, payload)


@router.get("/{id}/submissions")
async def list_submissions(
    id: str, service: SubmissionService = Depends(get_submission_service)
):
    return service.list_submissions_for_survey(id)


@router.patch("/{id}/toggle")
async def toggle_survey(
    id: str,
    service: SurveyService = Depends(get_survey_service),
):
    return service.toggle_publish(id)


@router.post("/{id}/start")
async def start_submission(
    id: str,
    request: Request,
    service: SubmissionService = Depends(get_submission_service),
):
    return await service.start_submission(id, request)
