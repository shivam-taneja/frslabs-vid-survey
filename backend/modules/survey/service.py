from sqlalchemy.orm import Session, joinedload
from .models import Survey, SurveyQuestion
from .schemas import CreateSurveyPayload, AddQuestionsPayload, UpdateSurveyPayload
from modules.submission.models import SurveySubmission
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

    def update_survey(self, survey_id: str, payload: UpdateSurveyPayload) -> Survey:
        survey = self._get_survey(survey_id)
        if survey.is_active:
            raise HTTPException(
                status_code=400, detail="Cannot modify a published survey"
            )
        # Only update fields that were actually provided
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(survey, field, value)
        self.db.commit()
        self.db.refresh(survey)
        return survey

    def delete_survey(self, survey_id: str) -> dict:
        survey = self._get_survey(survey_id)

        if survey.is_active:
            raise HTTPException(
                status_code=400, detail="Cannot delete a published survey"
            )

        submission_exists = (
            self.db.query(SurveySubmission.id)
            .filter(SurveySubmission.survey_id == survey_id)
            .first()
        )

        if submission_exists:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete survey with existing submissions",
            )

        self.db.delete(survey)
        self.db.commit()
        return {"deleted": True}

    def toggle_publish(self, survey_id: str) -> Survey:
        survey = self._get_survey(survey_id)

        # Publishing
        if not survey.is_active:
            if len(survey.questions) != 5:
                raise HTTPException(
                    status_code=400,
                    detail=f"Survey must have exactly 5 questions (has {len(survey.questions)})",
                )

        # Unpublishing
        else:
            submission_exists = (
                self.db.query(SurveySubmission.id)
                .filter(SurveySubmission.survey_id == survey_id)
                .first()
            )

            if submission_exists:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot unpublish survey with existing submissions",
                )

        survey.is_active = not survey.is_active

        self.db.commit()
        self.db.refresh(survey)

        return survey

    def add_questions(
        self, survey_id: str, payload: AddQuestionsPayload
    ) -> list[SurveyQuestion]:
        survey = self._get_survey(survey_id)
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

    def list_surveys(self) -> list[Survey]:
        return self.db.query(Survey).order_by(Survey.created_at.desc()).all()

    # Private helper — used internally so get_survey can stay public-facing with joinedload
    def _get_survey(self, survey_id: str) -> Survey:
        survey = self.db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        return survey
