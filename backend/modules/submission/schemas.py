from pydantic import BaseModel
from typing import List


class AnswerPayload(BaseModel):
    question_id: str
    answer: str
    face_detected: bool
    face_score: int


class SaveAnswersPayload(BaseModel):
    answers: List[AnswerPayload]
