"""Promises API routes"""
from fastapi import APIRouter
from models.schemas import PromiseCreate, PromiseUpdate, CommitmentExtract
from services.supabase_client import supabase
from agent.tools import extract_commitment as _extract_commitment
from datetime import datetime, timezone

router = APIRouter(prefix="/api/promises", tags=["promises"])


@router.get("")
async def list_promises(status: str = None, case_id: str = None, limit: int = 100):
    q = supabase().table("promises").select("*").order("created_at", desc=True).limit(limit)
    if status:
        q = q.eq("status", status)
    if case_id:
        q = q.eq("case_id", case_id)
    return q.execute().data or []


@router.post("/extract")
async def extract_commitment_endpoint(body: CommitmentExtract):
    """Extract a commitment from a text message using AI."""
    import asyncio
    result = _extract_commitment(body.message, body.person_name)
    return result


@router.post("")
async def create_promise(body: PromiseCreate):
    data = {
        "case_id": body.case_id,
        "person_name": body.person_name,
        "commitment": body.commitment,
        "status": "waiting",
        "confidence": body.confidence,
    }
    if body.original_message:
        data["original_message"] = body.original_message
    if body.deadline:
        data["deadline"] = body.deadline.isoformat()
    if body.evidence_required:
        data["evidence_required"] = body.evidence_required

    result = supabase().table("promises").insert(data).execute()
    promise = result.data[0] if result.data else {}

    # Log event
    supabase().table("events").insert({
        "case_id": body.case_id,
        "event_type": "promise_created",
        "actor": "user",
        "actor_type": "user",
        "title": f"Promise created: {body.person_name} — {body.commitment}",
    }).execute()

    return promise


@router.patch("/{promise_id}")
async def update_promise(promise_id: str, body: PromiseUpdate):
    updates = body.model_dump(exclude_none=True)
    if "deadline" in updates and updates["deadline"]:
        updates["deadline"] = updates["deadline"].isoformat()
    if "last_follow_up_at" in updates and updates["last_follow_up_at"]:
        updates["last_follow_up_at"] = updates["last_follow_up_at"].isoformat()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = supabase().table("promises").update(updates).eq("id", promise_id).execute()
    return result.data[0] if result.data else {}


@router.get("/{promise_id}")
async def get_promise(promise_id: str):
    result = supabase().table("promises").select("*").eq("id", promise_id).single().execute()
    return result.data or {}
