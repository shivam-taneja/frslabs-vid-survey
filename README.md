# VidSurvey

A privacy-first video survey platform. Users complete a 5-question Yes/No survey while their camera records short video segments per question. Face detection runs client-side per question, generating a visibility score and face snapshot. No personal identifiers are collected.

## Demo

[Watch the demo](./demo.mp4)

## Architecture & Tech Stack

This project utilizes a containerized microservices architecture. An Nginx reverse proxy sits in front of the application, routing traffic securely to the frontend and backend on a single origin, completely eliminating CORS complexities.

The backend follows a domain-driven module pattern, where each feature module (`survey`, `submission`) owns its models, schemas, router, and service in isolation. This keeps concerns cleanly separated and makes the codebase easier to navigate.

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | Next.js (App Router), React Query, Axios |
| Backend        | FastAPI, Pydantic                        |
| ORM            | SQLAlchemy                               |
| Database       | PostgreSQL                               |
| Face Detection | MediaPipe                                |
| Infrastructure | Docker, Docker Compose, Nginx            |

## Running the Application

This project includes a Node.js wrapper script that verifies system dependencies before executing the Docker commands. **Python is not required on your host machine**, as the backend runs entirely within a containerized Python environment.

### Prerequisites

- Docker (and Docker Compose)
- Node.js (strictly for executing the dependency check and start scripts)

### Production Evaluation Build

To run the project, run the following command from the root directory:

```bash
npm run start
```

Once the build finishes and the containers are running, access the application here:

- **Survey Dashboard:** http://localhost/dashboard
- **API Swagger Documentation:** http://localhost/docs

### Teardown & Cleanup

To gracefully stop the containers and clean up the database volumes:

```bash
npm run clean
```

### Local Development Commands

If you wish to run the database via Docker but run the frontend/backend natively, start by copying the environment files, each folder has its own `.env.example`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then start the database container:

- **Start DB:** `npm run dev:start`
- **Stop DB:** `npm run dev:stop`
- **Clean DB:** `npm run dev:clean`

**Backend** (from `/backend`):

```bash
python -m venv env
source env/bin/activate        # Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend** (from `/frontend`):

This project uses [pnpm](https://pnpm.io/). If you don't have it installed:

```bash
npm install -g pnpm
```

Then:

```bash
pnpm install
pnpm dev
```

## Repo Structure

```
vidsurvey/
├── backend/
│   ├── core/               # App configuration and exception handlers
│   ├── db/                 # Database connection and session setup
│   ├── modules/            # Domain-driven feature modules
│   │   ├── submission/     # Submission logic (models, schemas, router, service)
│   │   └── survey/         # Survey logic (models, schemas, router, service)
│   ├── main.py             # FastAPI entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   └── providers/      # Query providers
│   ├── next.config.js
│   └── Dockerfile
├── nginx/
│   └── nginx.conf          # Reverse proxy routing rules
├── docker-compose.prod.yml
├── .env.example
├── package.json            # Root scripts for Docker management
└── README.md
```

## API Overview

Full interactive documentation is available at http://localhost/docs once the application is running. The API is organized into two routers:

| Method | Route                          | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | /api/surveys                   | List all surveys              |
| POST   | /api/surveys                   | Create a survey               |
| GET    | /api/surveys/{id}              | Get survey with questions     |
| PATCH  | /api/surveys/{id}              | Update survey title           |
| DELETE | /api/surveys/{id}              | Delete survey                 |
| POST   | /api/surveys/{id}/questions    | Add or replace questions      |
| PATCH  | /api/surveys/{id}/toggle       | Publish or unpublish survey   |
| POST   | /api/surveys/{id}/start        | Begin a submission session    |
| GET    | /api/surveys/{id}/submissions  | List submissions for a survey |
| GET    | /api/submissions/{id}          | Get submission details        |
| GET    | /api/submissions/{id}/answers  | Get answers for a submission  |
| POST   | /api/submissions/{id}/answers  | Save answers                  |
| POST   | /api/submissions/{id}/media    | Upload video or face image    |
| POST   | /api/submissions/{id}/complete | Mark submission as complete   |
| GET    | /api/submissions/{id}/export   | Download submission ZIP       |

## Data Flow (User Survey)

1. User opens `/survey/{survey_id}`.
2. Browser requests camera permissions.
3. For each of the 5 questions:
   - Video recording initializes.
   - Face detection runs live via MediaPipe.
   - User answers Yes/No.
   - Recording stops, capturing a face snapshot and generating a visibility score.
   - Frontend transmits the answer, face score, snapshot, and video segment to the backend.
4. After Question 5, the submission is marked complete.
5. A completion screen is displayed to the user.

## Trade-offs and Assumptions

**MediaPipe over face-api.js**

MediaPipe was chosen for its superior runtime performance and accuracy. face-api.js is built on top of TensorFlow.js and ships heavier model weights, which adds noticeable latency on lower-end devices. MediaPipe's face detection model is lighter, runs fully in-browser via WebAssembly, and consistently produces lower inference times per frame.

**30-second recording cap per question**

Recording is capped at 30 seconds per question. This is a deliberate decision to keep video segment sizes manageable and prevent MediaPipe from running indefinitely, which would otherwise cause memory and performance degradation on lower-end devices.

**Filesystem storage over AWS S3**

Video segments and face snapshots are stored on the server filesystem rather than a cloud object store. For the scope of this assignment, filesystem storage avoids the operational overhead of configuring S3 buckets, IAM roles, and signed URLs, and keeps the project fully self-contained with no external dependencies. In a production deployment, migrating to S3 (or equivalent) would be the correct next step, requiring only a change to the storage service layer.

**Nginx reverse proxy over CORS configuration**

Routing all traffic through a single Nginx origin eliminates the need for CORS headers in production entirely. With CORS, the browser enforces origin checks on every preflight request, and misconfiguration is a common source of subtle bugs. By proxying both the frontend and backend under the same `localhost` origin, the browser treats all requests as same-origin. CORS middleware is still enabled on the backend to support local development, where the frontend and backend run on different ports natively. The trade-off is the added infrastructure component, but the resulting production setup is simpler to reason about and closer to how a real deployment behind a load balancer would behave.

**Single toggle endpoint over separate publish/unpublish routes**

A single `PATCH /{id}/toggle` endpoint handles both publishing and unpublishing instead of two separate routes. The spec called for a dedicated `/publish` endpoint. Consolidating it reduces surface area and is simpler for the frontend to consume, at the cost of being slightly less explicit in intent.

## Known Limitations

- **No horizontal scaling:** Filesystem-based media storage means the backend cannot be scaled to multiple replicas without a shared volume or migration to object storage.
- **No authentication on admin routes:** Survey creation and publishing endpoints are currently unprotected. A real deployment would require API key or session-based auth for admin flows.
- **IP geolocation accuracy:** Location is derived from the client IP via a lookup service. This will be inaccurate for users behind VPNs or NAT, and will always return a local/private result in development.
- **IP geolocation rate limit:** ip-api.com's free tier is capped at 45 requests per minute. Under any meaningful load, location resolution will silently fall back to "Unknown".
- **No retry on geolocation:** Location is resolved once at survey start with no retry. If the external service is unavailable at that moment, location is permanently lost for that submission.
- **Export ZIP naming convention:** The exported ZIP uses internal stored filenames rather than the spec's prescribed format (`q1_face.png`, `q2_face.png`). The content is identical, only the naming differs.
- **Browser compatibility:** MediaPipe's WebAssembly runtime requires a modern browser. Older browsers without WebAssembly support will not be able to run face detection.
