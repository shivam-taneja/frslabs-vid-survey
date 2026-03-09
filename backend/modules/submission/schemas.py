from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class AnswerPayload(BaseModel):
    question_id: str
    answer: Literal["yes", "no", "skipped"]
    face_detected: bool
    face_score: int


class SaveAnswersPayload(BaseModel):
    answers: List[AnswerPayload]


class AnswerOut(BaseModel):
    id: str
    submission_id: str
    question_id: str
    question_text: Optional[str] = None
    answer: str
    face_detected: bool
    face_score: int
    face_image_path: Optional[str] = None


class SubmissionOut(BaseModel):
    id: str
    survey_id: str
    ip_address: Optional[str]
    browser: Optional[str]
    device: Optional[str]
    os: Optional[str]
    location: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    overall_score: Optional[float]
