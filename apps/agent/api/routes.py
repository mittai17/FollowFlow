"""Documents, Approvals, Events, Agent status API routes"""
from fastapi import APIRouter, HTTPException
from models.schemas import DocumentCreate, ApprovalDecide, EventCreate
from services.supabase_client import supabase
from agent.tools import verify_document as _verify_doc, log_activity
from datetime import datetime, timezone

# ── Documents ──────────────────────────────────────────────────────────────
docs_router = APIRouter(prefix="/api/documents", tags=["documents"])

@docs_router.get("")
async def list_documents(case_id: str = None, verification_status: str = None):
    q = supabase().table("documents").select("*").order("uploaded_at", desc=True)
    if case_id:
        q = q.eq("case_id", case_id)
    if verification_status:
        q = q.eq("verification_status", verification_status)
    return q.execute().data or []


@docs_router.post("")
async def create_document(body: DocumentCreate):
    data = {
        "case_id": body.case_id,
        "name": body.name,
        "document_type": body.document_type,
        "storage_path": body.storage_path,
        "mime_type": body.mime_type,
        "file_size": body.file_size,
        "verification_status": "pending",
    }
    if body.requirement_id:
        data["requirement_id"] = body.requirement_id
    result = supabase().table("documents").insert(data).execute()
    doc = result.data[0] if result.data else {}

    # Auto-verify using agent tool
    if doc.get("id"):
        _verify_doc(doc["id"], body.name, body.document_type)
        supabase().table("events").insert({
            "case_id": body.case_id,
            "event_type": "document_received",
            "actor": "user",
            "actor_type": "user",
            "title": f"Document received: {body.name}",
            "description": f"Type: {body.document_type or 'unknown'}",
        }).execute()

    return doc


@docs_router.post("/{doc_id}/verify")
async def verify_document(doc_id: str, expected_type: str = None):
    doc = supabase().table("documents").select("*").eq("id", doc_id).single().execute().data
    if not doc:
        raise HTTPException(404, "Document not found")
    result = _verify_doc(doc_id, doc["name"], expected_type)
    return result


# ── Approvals ──────────────────────────────────────────────────────────────
approvals_router = APIRouter(prefix="/api/approvals", tags=["approvals"])

@approvals_router.get("")
async def list_approvals(status: str = "pending"):
    q = supabase().table("approvals").select("*, cases(title, case_number)").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return q.execute().data or []


@approvals_router.post("/{approval_id}/decide")
async def decide_approval(approval_id: str, body: ApprovalDecide):
    from agent.tools import resume_case
    approval = supabase().table("approvals").select("*").eq("id", approval_id).single().execute().data
    if not approval:
        raise HTTPException(404, "Approval not found")

    supabase().table("approvals").update({
        "status": "approved",
        "decision": body.decision,
        "decided_by": body.decided_by,
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", approval_id).execute()

    case_id = approval["case_id"]
    resume_case(case_id, approval_id, body.decision)

    return {"success": True, "decision": body.decision, "case_id": case_id}


# ── Events ─────────────────────────────────────────────────────────────────
events_router = APIRouter(prefix="/api/events", tags=["events"])

@events_router.get("")
async def list_events(case_id: str = None, event_type: str = None,
                      actor_type: str = None, limit: int = 100):
    q = supabase().table("events").select("*").order("created_at", desc=True).limit(limit)
    if case_id:
        q = q.eq("case_id", case_id)
    if event_type:
        q = q.eq("event_type", event_type)
    if actor_type:
        q = q.eq("actor_type", actor_type)
    return q.execute().data or []


@events_router.post("")
async def create_event(body: EventCreate):
    data = body.model_dump(exclude_none=True)
    result = supabase().table("events").insert(data).execute()
    return result.data[0] if result.data else {}


# ── Agent status ───────────────────────────────────────────────────────────
agent_router = APIRouter(prefix="/api/agent", tags=["agent"])

@agent_router.get("/status")
async def agent_status():
    from agent.core import get_agent_status
    return get_agent_status()


@agent_router.post("/run")
async def run_agent(case_id: str, task: str = "Review case and take appropriate action"):
    from agent.core import run_agent_for_case
    import asyncio
    result = await run_agent_for_case(case_id, task)
    return result


@agent_router.post("/extract-commitment")
async def agent_extract(message: str, person_name: str = None):
    from agent.tools import extract_commitment
    return extract_commitment(message, person_name)
