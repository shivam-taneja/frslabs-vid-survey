from fastapi import FastAPI
from core.exceptions import register_exception_handlers
from modules.survey.router import router as survey_router
from modules.submission.router import router as submission_router

app = FastAPI(title="Video Survey API")

# Register global error handlers
register_exception_handlers(app)

app.include_router(survey_router)
app.include_router(submission_router)
