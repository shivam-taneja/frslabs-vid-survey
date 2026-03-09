from fastapi import APIRouter
from core.interceptors import ApiResponseRoute
from .schemas import CreateSurveyPayload, AddQuestionsPayload

router = APIRouter(
    prefix="/api/surveys", tags=["Surveys"], route_class=ApiResponseRoute
)


@router.get("")
async def list_surveys():
    # Returning mock data for the dashboard list
    return [
        {
            "id": "survey_123",
            "title": "Initial User Onboarding Survey",
            "is_active": True,
            "created_at": "2026-03-09T10:00:00Z",
        }
    ]


@router.post("")
async def create_survey(payload: CreateSurveyPayload):
    return {
        "id": "survey_123",
        "title": payload.title,
        "is_active": False,
        "created_at": "2026-03-09T10:00:00Z",
    }


@router.post("/{id}/questions")
async def add_questions(id: str, payload: AddQuestionsPayload):
    return [
        {
            "id": f"q_{i+1}",
            "survey_id": id,
            "question_text": q.question_text,
            "order": i + 1,
        }
        for i, q in enumerate(payload.questions)
    ]


@router.get("/{id}")
async def get_survey(id: str):
    return {
        "id": id,
        "title": "Mock Video Survey",
        "is_active": True,
        "questions": [
            {
                "id": "q_1",
                "survey_id": id,
                "question_text": "Are you in a well-lit room?",
                "order": 1,
            },
            {
                "id": "q_2",
                "survey_id": id,
                "question_text": "Are you wearing glasses?",
                "order": 2,
            },
            {
                "id": "q_3",
                "survey_id": id,
                "question_text": "Is there background noise?",
                "order": 3,
            },
            {
                "id": "q_4",
                "survey_id": id,
                "question_text": "Can you see the camera clearly?",
                "order": 4,
            },
            {
                "id": "q_5",
                "survey_id": id,
                "question_text": "Are you ready to submit?",
                "order": 5,
            },
        ],
    }


@router.post("/{id}/publish")
async def publish_survey(id: str):
    return {"id": id, "title": "Mock Video Survey", "is_active": True}


@router.post("/{id}/start")
async def start_submission(id: str):
    return {"id": "sub_999", "survey_id": id, "started_at": "2026-03-09T10:05:00Z"}
