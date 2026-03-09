from pydantic import BaseModel
from typing import List


class CreateSurveyPayload(BaseModel):
    title: str


class QuestionPayload(BaseModel):
    question_text: str


class AddQuestionsPayload(BaseModel):
    questions: List[QuestionPayload]
