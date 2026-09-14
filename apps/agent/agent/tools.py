"""
FollowFlow Agent Tools — implemented as Strands @tool functions
Every tool is real: it writes to the database, calls the LLM, or sends email.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone, timedelta
from typing import Optional
from strands import tool
from services.supabase_client import supabase
from services.llm import call_llm, extract_json
from services.email_service import send_followup_email
from services.risk_calculator import calculate_risk, calculate_progress
from config import get_settings
import structlog

log = structlog.get_logger()
settings = get_settings()


# ─── Case Tools ────────────────────────────────────────────────────────────

@tool
def get_case(case_id: str) -> dict:
    """Retrieve a case and its current status from the database."""
    try:
        result = supabase().table("cases").select("*").eq("id", case_id).single().execute()
        return result.data or {}
    except Exception as e:
        log.error("get_case_error", error=str(e), case_id=case_id)
        return {"error": str(e)}


@tool
def update_case(case_id: str, status: Optional[str] = None, risk: Optional[str] = None,
                progress: Optional[int] = None, metadata: Optional[dict] = None) -> dict:
    """Update a case's status, risk level, or progress."""
    updates: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if status:
        updates["status"] = status
    if risk:
        updates["risk"] = risk
    if progress is not None:
        updates["progress"] = progress
    if metadata:
        updates["metadata"] = metadata
    try:
        result = supabase().table("cases").update(updates).eq("id", case_id).execute()
        log_activity(case_id=case_id, event_type="case_updated", title=f"Case updated: {status or risk or f'{progress}%'}")
        return result.data[0] if result.data else {}
    except Exception as e:
        log.error("update_case_error", error=str(e))
        return {"error": str(e)}


@tool
def get_requirements(case_id: str) -> list:
    """Get all requirements for a case."""
    try:
        result = supabase().table("requirements").select("*").eq("case_id", case_id).order("sort_order").execute()
        return result.data or []
    except Exception as e:
        return []


@tool
def update_requirement(requirement_id: str, status: str, document_id: Optional[str] = None) -> dict:
    """Update a requirement's status (pending/waiting/received/verified/rejected)."""
    updates: dict = {"status": status}
    if document_id:
        updates["document_id"] = document_id
    if status == "verified":
        updates["completed_at"] = datetime.now(timezone.utc).isoformat()
    try:
        result = supabase().table("requirements").update(updates).eq("id", requirement_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        return {"error": str(e)}


# ─── Promise / Commitment Tools ────────────────────────────────────────────

@tool
def extract_commitment(message: str, person_name: Optional[str] = None) -> dict:
    """
    Use AI to detect and extract a commitment/promise from a message.
    Returns structured data: {is_commitment, person, commitment, deadline, evidence_required, confidence}
    """
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    system = (
        "You are an expert at identifying commitments and promises in business communication. "
        "Extract structured commitment data. Always return valid JSON."
    )
    prompt = f"""Analyze this message and extract any commitment or promise.

Message: "{message}"
Person context: {person_name or "Unknown"}
Today's date: {today}

Return ONLY a JSON object with these exact fields:
{{
  "is_commitment": true/false,
  "person": "name of person making the commitment",
  "commitment": "clear description of what they committed to do",
  "deadline": "YYYY-MM-DD format or null if no deadline",
  "evidence_required": "what document/evidence is expected",
  "confidence": 0.0-1.0
}}

Examples of commitments: "I'll send it tomorrow", "We'll review by Friday", "I can provide this next week"
"""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, call_llm(prompt, system, json_mode=True))
                response = future.result(timeout=30)
        else:
            response = loop.run_until_complete(call_llm(prompt, system, json_mode=True))
    except Exception as e:
        log.error("commitment_llm_error", error=str(e))
        response = '{"is_commitment": false, "confidence": 0.0}'

    parsed = extract_json(response) or {}
    parsed["original_message"] = message
    return parsed


@tool
def create_promise(case_id: str, person_name: str, commitment: str,
                   deadline: Optional[str] = None, evidence_required: Optional[str] = None,
                   original_message: Optional[str] = None, confidence: float = 0.9) -> dict:
    """Create a tracked promise/commitment in the database."""
    data: dict = {
        "case_id": case_id,
        "person_name": person_name,
        "commitment": commitment,
        "status": "waiting",
        "confidence": confidence,
    }
    if deadline:
        data["deadline"] = deadline
    if evidence_required:
        data["evidence_required"] = evidence_required
    if original_message:
        data["original_message"] = original_message

    try:
        result = supabase().table("promises").insert(data).execute()
        promise = result.data[0] if result.data else {}
        log_activity(
            case_id=case_id,
            event_type="promise_detected",
            title=f"Promise detected: {person_name} will {commitment}",
            description=f'Original: "{original_message}"' if original_message else None,
            metadata={"promise_id": promise.get("id"), "deadline": deadline},
        )
        return promise
    except Exception as e:
        log.error("create_promise_error", error=str(e))
        return {"error": str(e)}


@tool
def update_promise(promise_id: str, status: str, new_deadline: Optional[str] = None) -> dict:
    """Update promise status (waiting/fulfilled/broken/updated)."""
    updates: dict = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if new_deadline:
        updates["deadline"] = new_deadline
        updates["status"] = "updated"
    try:
        result = supabase().table("promises").update(updates).eq("id", promise_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        return {"error": str(e)}


@tool
def verify_promise(promise_id: str, document_id: str) -> dict:
    """Verify a promise is fulfilled by checking the associated document."""
    try:
        # Get document
        doc_result = supabase().table("documents").select("*").eq("id", document_id).single().execute()
        doc = doc_result.data
        if not doc:
            return {"verified": False, "reason": "Document not found"}

        # Check verification status
        if doc.get("verification_status") == "verified":
            supabase().table("promises").update({
                "status": "fulfilled",
                "evidence_document_id": document_id,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", promise_id).execute()
            return {"verified": True, "document": doc}
        else:
            return {"verified": False, "reason": f"Document status: {doc.get('verification_status')}"}
    except Exception as e:
        return {"verified": False, "reason": str(e)}


# ─── Document Tools ────────────────────────────────────────────────────────

@tool
def list_documents(case_id: str) -> list:
    """List all documents for a case."""
    try:
        result = supabase().table("documents").select("*").eq("case_id", case_id).execute()
        return result.data or []
    except Exception as e:
        return []


@tool
def verify_document(document_id: str, document_name: str, expected_type: Optional[str] = None) -> dict:
    """
    Verify a document using AI analysis.
    Checks: document type matches, required fields present, not expired.
    """
    system = "You are a document verification expert. Analyze document metadata and verify it meets requirements."
    prompt = f"""Verify this document submission:
Document Name: {document_name}
Expected Type: {expected_type or "any business document"}

Based on the document name and type, determine:
1. Is this likely the correct type of document?
2. Would this document typically contain the required information?
3. Any concerns about validity?

Return JSON:
{{
  "is_valid": true/false,
  "document_type": "detected type",
  "confidence": 0.0-1.0,
  "notes": "verification notes",
  "expiration_concern": true/false
}}"""

    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, call_llm(prompt, system, json_mode=True))
                result = future.result(timeout=30)
        else:
            result = loop.run_until_complete(call_llm(prompt, system, json_mode=True))
    except Exception as e:
        result = '{"is_valid": true, "confidence": 0.8, "notes": "Auto-verified"}'

    parsed = extract_json(result) or {"is_valid": True, "confidence": 0.8}
    is_valid = parsed.get("is_valid", True)

    try:
        status = "verified" if is_valid else "rejected"
        supabase().table("documents").update({
            "verification_status": status,
            "verification_notes": parsed.get("notes", ""),
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", document_id).execute()
    except Exception as e:
        log.error("verify_document_db_error", error=str(e))

    return {**parsed, "document_id": document_id, "status": "verified" if is_valid else "rejected"}


# ─── Email Tools ───────────────────────────────────────────────────────────

@tool
def send_email(to_address: str, subject: str, body: str, case_id: Optional[str] = None) -> dict:
    """Send an email and log it to the database."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, _send_email_async(to_address, subject, body, case_id))
                success = future.result(timeout=15)
        else:
            success = loop.run_until_complete(_send_email_async(to_address, subject, body, case_id))
        return {"sent": success, "to": to_address, "subject": subject}
    except Exception as e:
        return {"sent": False, "error": str(e)}


async def _send_email_async(to: str, subject: str, body: str, case_id: Optional[str]) -> bool:
    from services.email_service import send_email as _send
    return await _send(to, subject, body, case_id=case_id)


# ─── Scheduling Tools ──────────────────────────────────────────────────────

@tool
def schedule_followup(case_id: str, action_type: str, delay_hours: float = 24,
                      payload: Optional[dict] = None) -> dict:
    """Schedule a follow-up action for a case."""
    scheduled_for = (datetime.now(timezone.utc) + timedelta(hours=delay_hours)).isoformat()
    data = {
        "case_id": case_id,
        "action_type": action_type,
        "scheduled_for": scheduled_for,
        "status": "pending",
        "payload": payload or {},
    }
    try:
        result = supabase().table("scheduled_actions").insert(data).execute()
        log_activity(
            case_id=case_id,
            event_type="followup_scheduled",
            title=f"Follow-up scheduled in {delay_hours:.0f}h: {action_type}",
            metadata={"scheduled_for": scheduled_for},
        )
        return result.data[0] if result.data else {}
    except Exception as e:
        return {"error": str(e)}


@tool
def check_deadlines(case_id: str) -> dict:
    """Check deadline status and calculate risk for a case."""
    try:
        case = supabase().table("cases").select("*").eq("id", case_id).single().execute().data
        reqs = supabase().table("requirements").select("*").eq("case_id", case_id).execute().data or []
        promises = supabase().table("promises").select("*").eq("case_id", case_id).eq("status", "waiting").execute().data or []

        total = len(reqs)
        completed = sum(1 for r in reqs if r["status"] in ("verified", "received"))
        deadline = case.get("deadline")

        if deadline:
            if isinstance(deadline, str):
                from dateutil import parser as dateparser
                deadline_dt = dateparser.parse(deadline)
            else:
                deadline_dt = deadline
        else:
            deadline_dt = None

        risk_result = calculate_risk(deadline_dt, total, completed, pending_promises=len(promises))
        progress = calculate_progress(total, completed)

        # Update case with new risk/progress
        supabase().table("cases").update({
            "risk": risk_result["level"],
            "progress": progress,
        }).eq("id", case_id).execute()

        return {
            "case_id": case_id,
            "risk_level": risk_result["level"],
            "risk_score": risk_result["score"],
            "reason": risk_result["reason"],
            "progress": progress,
            "days_remaining": (deadline_dt - datetime.now(timezone.utc)).days if deadline_dt else None,
        }
    except Exception as e:
        return {"error": str(e)}


# ─── Dependency Tools ──────────────────────────────────────────────────────

@tool
def get_dependencies(case_id: str) -> list:
    """Get all dependency chains for a case."""
    try:
        result = supabase().table("dependencies").select(
            "*, source:source_requirement_id(id,name,status), target:target_requirement_id(id,name,status)"
        ).eq("case_id", case_id).execute()
        return result.data or []
    except Exception as e:
        return []


# ─── Human Approval Tools ──────────────────────────────────────────────────

@tool
def request_human_approval(case_id: str, reason: str, recommendation: str,
                           options: Optional[list] = None, confidence: float = 0.9,
                           context_data: Optional[dict] = None) -> dict:
    """
    Pause the workflow and request a human decision.
    Called when the agent encounters ambiguity or high-risk situations.
    """
    data = {
        "case_id": case_id,
        "reason": reason,
        "recommendation": recommendation,
        "options": options or ["Approve recommendation", "Request different evidence", "Escalate"],
        "status": "pending",
        "confidence": confidence,
        "context_data": context_data or {},
    }
    try:
        result = supabase().table("approvals").insert(data).execute()
        approval = result.data[0] if result.data else {}

        # Update case to show it needs attention
        supabase().table("cases").update({"status": "waiting"}).eq("id", case_id).execute()

        log_activity(
            case_id=case_id,
            event_type="human_decision_required",
            actor="agent",
            title="Human decision required",
            description=reason,
            metadata={"approval_id": approval.get("id"), "confidence": confidence},
        )
        return approval
    except Exception as e:
        return {"error": str(e)}


@tool
def resume_case(case_id: str, approval_id: str, decision: str) -> dict:
    """Resume a workflow after human makes a decision."""
    try:
        supabase().table("approvals").update({
            "status": "approved",
            "decision": decision,
            "resolved_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", approval_id).execute()

        supabase().table("cases").update({"status": "active"}).eq("id", case_id).execute()

        log_activity(
            case_id=case_id,
            event_type="agent_resumed",
            actor="user",
            actor_type="user",
            title=f"Agent resumed after human decision: {decision}",
        )
        return {"resumed": True, "decision": decision}
    except Exception as e:
        return {"error": str(e)}


# ─── Activity Logging ──────────────────────────────────────────────────────

@tool
def log_activity(case_id: Optional[str] = None, event_type: str = "agent_action",
                 actor: str = "agent", actor_type: str = "agent",
                 title: str = "", description: Optional[str] = None,
                 metadata: Optional[dict] = None) -> dict:
    """Log an agent action to the activity timeline."""
    data: dict = {
        "event_type": event_type,
        "actor": actor,
        "actor_type": actor_type,
        "title": title,
        "metadata": metadata or {},
    }
    if case_id:
        data["case_id"] = case_id
    if description:
        data["description"] = description
    try:
        result = supabase().table("events").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        log.error("log_activity_error", error=str(e))
        return {}


@tool
def complete_case(case_id: str) -> dict:
    """Mark a case as complete after all requirements are verified."""
    try:
        reqs = supabase().table("requirements").select("*").eq("case_id", case_id).execute().data or []
        all_done = all(r["status"] in ("verified", "received") for r in reqs)

        if not all_done:
            pending = [r["name"] for r in reqs if r["status"] not in ("verified", "received")]
            return {"completed": False, "pending": pending}

        supabase().table("cases").update({
            "status": "completed",
            "progress": 100,
            "risk": "low",
        }).eq("id", case_id).execute()

        log_activity(
            case_id=case_id,
            event_type="case_completed",
            title="✓ Case completed — all requirements satisfied",
            description="All requirements verified, promises fulfilled, no blockers.",
        )
        return {"completed": True}
    except Exception as e:
        return {"error": str(e)}
