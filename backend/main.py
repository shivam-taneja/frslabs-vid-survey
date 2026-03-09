from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.exceptions import register_exception_handlers
from db.database import engine, Base
from modules.survey.router import router as survey_router
from modules.submission.router import router as submission_router

import modules.survey.models
import modules.submission.models


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Video Survey API", lifespan=lifespan)


# CORS is intentionally kept for local development (frontend/backend on different ports).
# In production, Nginx proxies both under the same origin so these headers are never sent.
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
