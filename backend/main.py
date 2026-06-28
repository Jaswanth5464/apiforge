import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database.base import SessionLocal
from backend.database.init_db import create_tables, seed_database
from backend.api.routers import (
    collections,
    requests,
    environments,
    history,
    runner,
    health,
    tabs,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed DB. Shutdown: cleanup."""
    logger.info("Starting up Postman Clone API...")
    create_tables()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("Startup complete. Ready to serve requests.")
    yield
    logger.info("Shutting down Postman Clone API.")


app = FastAPI(
    title="Postman Clone API",
    description="Production-quality API Client Platform — backend proxy and persistence layer.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(collections.router, prefix=API_PREFIX)
app.include_router(requests.router, prefix=API_PREFIX)
app.include_router(environments.router, prefix=API_PREFIX)
app.include_router(history.router, prefix=API_PREFIX)
app.include_router(runner.router, prefix=API_PREFIX)
app.include_router(tabs.router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"message": "Postman Clone API is running. Visit /docs for API documentation."}
