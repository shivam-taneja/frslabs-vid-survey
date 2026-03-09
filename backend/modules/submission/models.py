from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    Float,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from db.database import Base
import uuid


class SurveySubmission(Base):
    __tablename__ = "survey_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_id = Column(String, ForeignKey("surveys.id"), nullable=False)
    ip_address = Column(String)
    browser = Column(String)
    device = Column(String)
    os = Column(String)
    location = Column(String)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    overall_score = Column(Float, nullable=True)

    survey = relationship("Survey", back_populates="submissions")
    answers = relationship("SurveyAnswer", back_populates="submission")
    media_files = relationship("MediaFile", back_populates="submission")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String, ForeignKey("survey_submissions.id"), nullable=False)
    question_id = Column(String, ForeignKey("survey_questions.id"), nullable=False)
    answer = Column(String, nullable=False)  # "yes" | "no" | "skipped"
    face_detected = Column(Boolean, default=False)
    face_score = Column(Integer, default=0)
    face_image_path = Column(String, nullable=True)

    submission = relationship("SurveySubmission", back_populates="answers")
    question = relationship("SurveyQuestion", back_populates="answers")


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String, ForeignKey("survey_submissions.id"), nullable=False)
    question_id = Column(String, nullable=True)
    type = Column(String, nullable=False)  # "video" | "image"
    path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submission = relationship("SurveySubmission", back_populates="media_files")
