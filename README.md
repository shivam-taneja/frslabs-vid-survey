# VidSurvey

A privacy-first video survey platform. Users complete a 5-question Yes/No survey while their camera records short video segments per question. Face detection runs client-side per question, generating a visibility score and face snapshot. No personal identifiers are collected.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Face Detection | MediaPipe |
| Containerization | Docker + docker-compose |

## Repo Structure

```
vidsuvey/
  frontend/          # Next.js app
  backend/           # FastAPI app
  docker-compose.yml
  README.md
```


## Data Flow (User Survey)

1. User opens `/survey/{survey_id}`
2. Camera permission requested
3. For each of 5 questions:
   - Video recording starts
   - Face detection runs live via MediaPipe
   - User answers Yes/No
   - Recording stops, face snapshot captured
   - Frontend sends answer + face score + snapshot + video segment to backend
4. After Q5, submission marked complete
5. Completion screen shown