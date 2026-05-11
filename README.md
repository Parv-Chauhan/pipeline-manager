# Pipeline Manager — ETL Monitoring Dashboard

A full-stack data pipeline management platform built with Django, React, and AWS-ready architecture.

## Live Demo
> Dashboard: http://localhost:5173 | API: http://localhost:8000/api/

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Python, Django, Django REST Framework |
| ETL Engine | Python, pandas, Celery, Redis |
| Frontend | React 18, Recharts, Axios |
| Database | PostgreSQL (SQLite for dev) |
| Cloud | AWS S3, EC2, Lambda, IAM, Route 53 |
| DevOps | Docker, docker-compose, GitHub Actions CI/CD |
| Auth | SAML, Auth0 (Okta-compatible) |

## Features
- Create and manage ETL pipelines with different data sources (CSV, S3, API, Database)
- Trigger pipeline runs and monitor status in real time
- Full ETL logs — Extract, Transform, Load steps visible per run
- React dashboard with Recharts bar charts for run history
- REST API with Django REST Framework + Swagger docs
- Background job execution (threading / Celery-ready)
- Role-based access control (admin / viewer)

## Project Structure
pipeline-manager/
├── core/              # Django settings and URLs
├── pipelines/         # ETL models, views, serializers, ETL engine
│   ├── models.py      # Pipeline + PipelineRun models
│   ├── views.py       # REST API ViewSets
│   ├── serializers.py # DRF serializers
│   └── etl.py         # ETL engine (Extract → Transform → Load)
├── frontend/          # React dashboard
│   └── src/
│       ├── App.jsx    # Main dashboard component
│       └── api.js     # Axios API calls
└── manage.py
## Quick Start

### Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pipelines/ | List all pipelines |
| POST | /api/pipelines/ | Create a pipeline |
| POST | /api/pipelines/{id}/trigger/ | Trigger ETL run |
| GET | /api/runs/ | List all runs |
| GET | /api/runs/?pipeline={id} | Runs for a pipeline |

## Screenshots
> Dashboard with 4 active pipelines, run history chart, and ETL logs