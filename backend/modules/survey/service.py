from sqlalchemy.orm import Session, joinedload
from .models import Survey, SurveyQuestion
from .schemas import CreateSurveyPayload, AddQuestionsPayload
from fastapi import HTTPException


class SurveyService:
    def __init__(self, db: Session):
        self.db = db

    def create_survey(self, payload: CreateSurveyPayload) -> Survey:
        survey = Survey(title=payload.title)
        self.db.add(survey)
        self.db.commit()
        self.db.refresh(survey)
        return survey

    def add_questions(
        self, survey_id: str, payload: AddQuestionsPayload
    ) -> list[SurveyQuestion]:
        survey = self.db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        if survey.is_active:
            raise HTTPException(
                status_code=400, detail="Cannot modify a published survey"
            )

        # Replace existing questions
        self.db.query(SurveyQuestion).filter(
            SurveyQuestion.survey_id == survey_id
        ).delete()

        questions = [
            SurveyQuestion(
                survey_id=survey_id,
                question_text=q.question_text,
                order=i + 1,
            )
            for i, q in enumerate(payload.questions)
        ]
        self.db.add_all(questions)
        self.db.commit()
        return questions

    def get_survey(self, survey_id: str) -> Survey:
        survey = (
            self.db.query(Survey)
            .options(joinedload(Survey.questions))
            .filter(Survey.id == survey_id)
            .first()
        )
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        return survey

    def publish_survey(self, survey_id: str) -> Survey:
        survey = self.get_survey(survey_id)
        if len(survey.questions) != 5:
            raise HTTPException(
                status_code=400,
                detail=f"Survey must have exactly 5 questions (has {len(survey.questions)})",
            )
        survey.is_active = True
        self.db.commit()
        self.db.refresh(survey)
        return survey

    def list_surveys(self) -> list[Survey]:
        return self.db.query(Survey).order_by(Survey.created_at.desc()).all()
