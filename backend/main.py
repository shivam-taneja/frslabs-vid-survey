from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.exceptions import register_exception_handlers
from modules.survey.router import router as survey_router
from modules.submission.router import router as submission_router

app = FastAPI(title="Video Survey API")

ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost(:\d+)?$",
]

app.add_middleware(
    CORSMiddleware,
    # Join the array into a single regex string so FastAPI can process it
    allow_origin_regex="|".join(ALLOWED_ORIGIN_REGEXES),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"],
)

# Register global error handlers
register_exception_handlers(app)

# Include routers
app.include_router(survey_router)
app.include_router(submission_router)
