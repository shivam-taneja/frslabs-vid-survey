from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class QuestionPayload(BaseModel):
    question_text: str


class AddQuestionsPayload(BaseModel):
    questions: List[QuestionPayload]


class CreateSurveyPayload(BaseModel):
    title: str


class QuestionOut(BaseModel):
    id: str
    survey_id: str
    question_text: str
    order: int

    class Config:
        from_attributes = True


class SurveyOut(BaseModel):
    id: str
    title: str
    is_active: bool
    created_at: datetime
    questions: List[QuestionOut] = []

    class Config:
        from_attributes = True
