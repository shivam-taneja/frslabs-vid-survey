from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.exceptions import register_exception_handlers
from core.config import settings
from db.database import engine, Base
from modules.survey.router import router as survey_router
from modules.submission.router import router as submission_router

import modules.survey.models
import modules.submission.models

app = FastAPI(title="Video Survey API")


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost(:\d+)?$",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="|".join(ALLOWED_ORIGIN_REGEXES),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"],
)

register_exception_handlers(app)

app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

app.include_router(survey_router)
app.include_router(submission_router)
