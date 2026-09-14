"""
FollowFlow Agent API — FastAPI application entry point
Autonomous AI operations agent for tracking commitments and keeping workflows moving.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import get_settings
from api.cases import router as cases_router
from api.promises import router as promises_router
from api.routes import docs_router, approvals_router, events_router, agent_router
from api.demo import router as demo_router
import structlog

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("followflow_starting", model=settings.ollama_model, provider=settings.strands_model_provider)
    # Seed demo org if not exists
    try:
        from services.supabase_client import supabase
        existing = supabase().table("organizations").select("id").eq("id", settings.demo_org_id).execute()
        if not existing.data:
            supabase().table("organizations").insert({
                "id": settings.demo_org_id,
                "name": "FollowFlow Demo Org",
            }).execute()
            log.info("demo_org_created")
    except Exception as e:
        log.warning("seed_error", error=str(e))
    yield
    log.info("followflow_shutdown")


app = FastAPI(
    title="FollowFlow Agent API",
    description="Autonomous AI operations agent — tracks commitments, verifies evidence, keeps work moving",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
origins += ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(cases_router)
app.include_router(promises_router)
app.include_router(docs_router)
app.include_router(approvals_router)
app.include_router(events_router)
app.include_router(agent_router)
app.include_router(demo_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "FollowFlow Agent API",
        "version": "1.0.0",
        "model": settings.ollama_model,
        "provider": settings.strands_model_provider,
    }


@app.get("/")
async def root():
    return {
        "message": "FollowFlow Agent API",
        "docs": "/docs",
        "health": "/health",
        "hackathon": "AWS Agents for Humans — Professional Agents Track",
    }
