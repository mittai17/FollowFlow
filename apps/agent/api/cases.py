"""Cases API routes"""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import CaseCreate, CaseUpdate, CaseOut, RequirementCreate
from services.supabase_client import supabase
from config import get_settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cases", tags=["cases"])
settings = get_settings()


@router.get("", response_model=list)
async def list_cases(status: str = None, risk: str = None, limit: int = 50):
    q = supabase().table("cases").select("*").order("updated_at", desc=True).limit(limit)
    if status:
        q = q.eq("status", status)
    if risk:
        q = q.eq("risk", risk)
    result = q.execute()
    return result.data or []


@router.post("", response_model=dict)
async def create_case(body: CaseCreate):
    org_id = body.organization_id
    if not org_id:
        org_res = supabase().table("organizations").select("id").limit(1).execute()
        org_id = org_res.data[0]["id"] if org_res.data else None

    data = {
        "title": body.title,
        "description": body.description,
        "organization_id": org_id,
        "owner_id": body.owner_id,
        "status": "active",
        "risk": "low",
        "progress": 0,
    }
    if body.deadline:
        data["deadline"] = body.deadline.isoformat()
    result = supabase().table("cases").insert(data).execute()
    case = result.data[0] if result.data else {}
    # Log creation event
    supabase().table("events").insert({
        "case_id": case.get("id"),
        "event_type": "case_created",
        "actor": "user",
        "actor_type": "user",
        "title": f"Case created: {body.title}",
    }).execute()
    return case


@router.get("/stats")
async def get_stats():
    from datetime import date
    today = date.today().isoformat()
    cases = supabase().table("cases").select("status, risk").execute().data or []
    promises = supabase().table("promises").select("id", count="exact").execute()
    approvals = supabase().table("approvals").select("id", count="exact").eq("status", "pending").execute()
    docs = supabase().table("documents").select("id", count="exact").eq("verification_status", "verified").execute()

    return {
        "active_cases": sum(1 for c in cases if c["status"] == "active"),
        "waiting_cases": sum(1 for c in cases if c["status"] == "waiting"),
        "at_risk_cases": sum(1 for c in cases if c["risk"] in ("high", "critical")),
        "blocked_cases": sum(1 for c in cases if c["status"] == "blocked"),
        "completed_today": sum(1 for c in cases if c["status"] == "completed"),
        "promises_tracked": promises.count or 0,
        "pending_approvals": approvals.count or 0,
        "documents_verified": docs.count or 0,
    }


@router.get("/{case_id}")
async def get_case(case_id: str):
    result = supabase().table("cases").select("*").eq("id", case_id).single().execute()
    if not result.data:
        raise HTTPException(404, "Case not found")
    return result.data


@router.patch("/{case_id}")
async def update_case(case_id: str, body: CaseUpdate):
    updates = body.model_dump(exclude_none=True)
    if "deadline" in updates and updates["deadline"]:
        updates["deadline"] = updates["deadline"].isoformat()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = supabase().table("cases").update(updates).eq("id", case_id).execute()
    return result.data[0] if result.data else {}


@router.get("/{case_id}/requirements")
async def get_requirements(case_id: str):
    result = supabase().table("requirements").select("*").eq("case_id", case_id).order("sort_order").execute()
    return result.data or []


@router.post("/{case_id}/requirements")
async def add_requirement(case_id: str, body: RequirementCreate):
    data = {
        "case_id": case_id,
        "name": body.name,
        "description": body.description,
        "required_evidence": body.required_evidence,
        "sort_order": body.sort_order,
        "status": "pending",
    }
    result = supabase().table("requirements").insert(data).execute()
    return result.data[0] if result.data else {}


@router.get("/{case_id}/promises")
async def get_case_promises(case_id: str):
    result = supabase().table("promises").select("*").eq("case_id", case_id).order("created_at", desc=True).execute()
    return result.data or []


@router.get("/{case_id}/events")
async def get_case_events(case_id: str, limit: int = 50):
    result = supabase().table("events").select("*").eq("case_id", case_id).order("created_at", desc=True).limit(limit).execute()
    return result.data or []


@router.get("/{case_id}/dependencies")
async def get_case_dependencies(case_id: str):
    result = supabase().table("dependencies").select("*").eq("case_id", case_id).execute()
    return result.data or []


@router.post("/{case_id}/dependencies")
async def add_dependency(case_id: str, source_id: str, target_id: str):
    data = {
        "case_id": case_id,
        "source_requirement_id": source_id,
        "target_requirement_id": target_id,
        "status": "pending",
    }
    result = supabase().table("dependencies").insert(data).execute()
    return result.data[0] if result.data else {}
