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
from api.commitments import router as commitments_router
from api.social import router as social_router
from api.organizations import router as organizations_router
from api.integrations import router as integrations_router
import structlog

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("followflow_starting", model=settings.ollama_model, provider=settings.strands_model_provider)
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
app.include_router(commitments_router)
app.include_router(social_router)
app.include_router(organizations_router)
app.include_router(integrations_router)

import os
from fastapi.staticfiles import StaticFiles
UPLOAD_DIR = "/home/mittai/Projects/aws-hack/apps/agent/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "FollowFlow Agent API",
        "version": "1.0.0",
        "model": settings.ollama_model,
        "provider": settings.strands_model_provider,
    }


# ─── Amazon Bedrock AgentCore Runtime Protocol Compliance ──────────────────
@app.get("/ping")
async def agentcore_ping():
    """AgentCore Runtime HTTP health check endpoint."""
    return {"status": "Healthy"}


@app.post("/invocations")
async def agentcore_invocations(payload: dict):
    """
    AgentCore Runtime HTTP invocation endpoint.
    Accepts task or case execution requests from AgentCore.
    """
    from agent.core import run_agent_for_case
    from services.supabase_client import supabase
    case_id = payload.get("case_id")
    if not case_id:
        # Retrieve the latest active or demo case if available
        cases = supabase().table("cases").select("id").order("updated_at", desc=True).limit(1).execute().data
        if cases:
            case_id = cases[0]["id"]
    
    task = payload.get("prompt") or payload.get("task") or "Review case and verify workflow"
    if case_id:
        result = await run_agent_for_case(case_id, task)
    else:
        result = {"message": f"Received task: {task}. No active cases found to process."}
    return {"output": result, "status": "completed"}


@app.get("/")
async def root():
    return {
        "message": "FollowFlow Agent API",
        "docs": "/docs",
        "health": "/health",
        "agentcore": "/ping",
        "hackathon": "AWS Agents for Humans — Professional Agents Track",
    }
