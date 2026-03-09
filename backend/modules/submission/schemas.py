from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class AnswerPayload(BaseModel):
    question_id: str
    answer: str
    face_detected: bool
    face_score: int


class SaveAnswersPayload(BaseModel):
    answers: List[AnswerPayload]


class SubmissionOut(BaseModel):
    id: str
    survey_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None

    class Config:
        from_attributes = True
