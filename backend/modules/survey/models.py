from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import relationship
from db.database import Base
import uuid


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship(
        "SurveyQuestion",
        back_populates="survey",
        order_by="SurveyQuestion.order",
        cascade="all, delete-orphan",
    )
    submissions = relationship("SurveySubmission", back_populates="survey")


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_id = Column(String, ForeignKey("surveys.id"), nullable=False)
    question_text = Column(String, nullable=False)
    order = Column(Integer, nullable=False)

    survey = relationship("Survey", back_populates="questions")
    answers = relationship("SurveyAnswer", back_populates="question")
