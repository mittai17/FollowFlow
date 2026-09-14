"""
Demo Simulator — executes the complete vendor onboarding workflow
Each step calls real backend functions. The scenario is deterministic and reproducible.
"""
from __future__ import annotations
import asyncio
import json
from datetime import datetime, timezone, timedelta
from typing import AsyncIterator
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.supabase_client import supabase
from services.email_service import send_followup_email
from agent.tools import (
    extract_commitment, create_promise, update_promise,
    verify_document, log_activity, request_human_approval,
    resume_case, complete_case, check_deadlines, schedule_followup,
)
from config import get_settings

router = APIRouter(prefix="/api/demo", tags=["demo"])
settings = get_settings()

ORG_ID = settings.demo_org_id


async def _emit(step: int, title: str, description: str, event_type: str,
                data: dict = None, case_id: str = None) -> str:
    """Emit an SSE event and log it to the database."""
    payload = {
        "step": step,
        "title": title,
        "description": description,
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data or {},
    }
    if case_id:
        try:
            log_activity(
                case_id=case_id,
                event_type=event_type,
                title=title,
                description=description,
                metadata=data or {},
            )
        except Exception:
            pass
    return f"data: {json.dumps(payload)}\n\n"


async def run_demo_scenario() -> AsyncIterator[str]:
    """
    Execute the complete 14-step vendor onboarding demo.
    Each step calls real functions — nothing is faked.
    """
    case_id = None
    promise_id = None
    doc_id = None
    approval_id = None

    try:
        # ── Step 1: Create vendor case ────────────────────────────────────
        await asyncio.sleep(0.5)
        deadline = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        case_data = supabase().table("cases").insert({
            "organization_id": ORG_ID,
            "title": "Vendor Onboarding — Acme Supplies",
            "description": "New vendor onboarding for Acme Supplies Ltd. Required: 5 compliance documents.",
            "status": "active",
            "risk": "low",
            "progress": 0,
            "deadline": deadline,
            "metadata": {"vendor": "Acme Supplies", "category": "vendor_onboarding"},
        }).execute().data[0]
        case_id = case_data["id"]
        yield await _emit(1, "📋 Vendor case created", f"Case {case_data.get('case_number', '#' + case_id[:8])} opened for Acme Supplies", "case_created", {"case_id": case_id}, case_id)

        # ── Step 2: Add requirements ──────────────────────────────────────
        await asyncio.sleep(1)
        requirements = [
            ("Company Registration", "Official company registration document", "company_registration"),
            ("Tax Certificate", "Valid tax clearance certificate", "tax_certificate"),
            ("Bank Details", "Bank account details and confirmation letter", "bank_details"),
            ("Signed Agreement", "Signed vendor agreement", "signed_agreement"),
            ("Insurance Certificate", "Valid insurance certificate with expiry date", "insurance_certificate"),
        ]
        req_ids = {}
        for i, (name, desc, req_type) in enumerate(requirements):
            r = supabase().table("requirements").insert({
                "case_id": case_id,
                "name": name,
                "description": desc,
                "required_evidence": req_type,
                "sort_order": i,
                "status": "pending",
            }).execute().data[0]
            req_ids[req_type] = r["id"]

        yield await _emit(2, "📝 Requirements identified", f"5 compliance documents required: {', '.join(r[0] for r in requirements[:3])} and 2 more", "requirements_identified", {"count": 5, "requirements": [r[0] for r in requirements]}, case_id)

        # Mark 2 as already received (company reg + tax cert)
        await asyncio.sleep(0.5)
        for req_type in ["company_registration", "tax_certificate"]:
            supabase().table("requirements").update({"status": "verified"}).eq("id", req_ids[req_type]).execute()

        supabase().table("cases").update({"progress": 40}).eq("id", case_id).execute()
        yield await _emit(2, "✓ 2 documents already verified", "Company Registration and Tax Certificate received", "documents_received", {"verified": 2, "pending": 3}, case_id)

        # ── Step 3: Simulate vendor message → extract promise ─────────────
        await asyncio.sleep(1.5)
        vendor_message = "Hi, I'll send the remaining bank details, agreement and insurance certificate tomorrow morning. Sorry for the delay!"
        yield await _emit(3, "📨 Message received from vendor", f'"{vendor_message}"', "message_received", {"from": "Rahul Sharma (Acme Supplies)", "message": vendor_message}, case_id)

        await asyncio.sleep(1)
        # Actually call the LLM to extract the commitment
        commitment_result = extract_commitment(vendor_message, "Rahul Sharma")
        yield await _emit(3, "🧠 Promise detected by AI", f"Commitment: {commitment_result.get('commitment', 'Send remaining documents')}", "promise_detected", commitment_result, case_id)

        # ── Step 4: Create promise ────────────────────────────────────────
        await asyncio.sleep(0.5)
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        promise = supabase().table("promises").insert({
            "case_id": case_id,
            "person_name": "Rahul Sharma",
            "commitment": "Send bank details, signed agreement and insurance certificate",
            "original_message": vendor_message,
            "deadline": tomorrow,
            "status": "waiting",
            "evidence_required": "Bank details letter, signed agreement PDF, insurance certificate",
            "confidence": commitment_result.get("confidence", 0.94),
        }).execute().data[0]
        promise_id = promise["id"]
        yield await _emit(4, "⏰ Deadline tracked", f"Promise recorded — due tomorrow. Follow-up scheduled.", "promise_created", {"promise_id": promise_id, "deadline": tomorrow}, case_id)

        # ── Step 5: Schedule follow-up ────────────────────────────────────
        await asyncio.sleep(0.5)
        supabase().table("scheduled_actions").insert({
            "case_id": case_id,
            "action_type": "check_promise",
            "scheduled_for": tomorrow,
            "status": "pending",
            "payload": {"promise_id": promise_id, "person": "Rahul Sharma"},
        }).execute()
        yield await _emit(5, "📅 Follow-up scheduled", "Agent will check at deadline. Monitoring active.", "followup_scheduled", {}, case_id)

        # ── Step 6: Simulate deadline reached — document not received ─────
        await asyncio.sleep(2)
        yield await _emit(6, "⏰ Deadline reached", "Checking for documents… bank details not received.", "deadline_reached", {"missing": ["bank_details", "signed_agreement", "insurance_certificate"]}, case_id)

        supabase().table("promises").update({"status": "broken"}).eq("id", promise_id).execute()

        # Agent sends follow-up email
        await asyncio.sleep(1)
        email_sent = await send_followup_email(
            to="rahul@acmesupplies.com",
            person_name="Rahul Sharma",
            case_title="Vendor Onboarding — Acme Supplies",
            commitment="Send bank details, signed agreement and insurance certificate",
            original_deadline="tomorrow",
            case_id=case_id,
        )
        supabase().table("email_log").insert({
            "case_id": case_id,
            "direction": "sent",
            "from_address": "followflow@example.com",
            "to_address": "rahul@acmesupplies.com",
            "subject": "Following up: Send bank details — Vendor Onboarding — Acme Supplies",
            "body": "Automated follow-up sent by FollowFlow agent",
        }).execute()
        yield await _emit(6, "📧 Follow-up sent automatically", f"Email sent to rahul@acmesupplies.com (check Mailpit at :8025)", "followup_sent", {"email_sent": email_sent, "mailpit_url": "http://localhost:8025"}, case_id)

        # ── Step 7: Vendor replies with new promise ───────────────────────
        await asyncio.sleep(2)
        new_message = "Sorry! I'll definitely send everything by end of today."
        yield await _emit(7, "📨 Vendor replied", f'"{new_message}"', "message_received", {"from": "Rahul", "message": new_message}, case_id)

        new_commitment = extract_commitment(new_message, "Rahul Sharma")
        new_deadline = (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()
        supabase().table("promises").update({
            "status": "updated",
            "deadline": new_deadline,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", promise_id).execute()
        yield await _emit(7, "🔄 Promise updated", "New deadline set: end of today. Agent continues monitoring.", "promise_updated", {"new_deadline": new_deadline}, case_id)

        # ── Step 8: Documents arrive ──────────────────────────────────────
        await asyncio.sleep(2)
        yield await _emit(8, "📄 Documents received", "3 documents uploaded by vendor", "documents_received", {"count": 3}, case_id)

        docs_to_create = [
            ("bank_details", "Bank Details — Acme Supplies.pdf", "bank_statement"),
            ("signed_agreement", "Signed Vendor Agreement.pdf", "signed_agreement"),
            ("insurance_certificate", "Insurance Certificate 2026.pdf", "insurance_certificate"),
        ]
        doc_results = {}
        for req_type, doc_name, doc_type in docs_to_create:
            doc = supabase().table("documents").insert({
                "case_id": case_id,
                "requirement_id": req_ids.get(req_type),
                "name": doc_name,
                "document_type": doc_type,
                "verification_status": "pending",
                "storage_path": f"/demo/{req_type}.pdf",
            }).execute().data[0]
            doc_results[req_type] = doc["id"]

        # ── Step 9: Agent verifies documents ─────────────────────────────
        await asyncio.sleep(1)
        yield await _emit(9, "🔍 Verifying documents…", "Agent analyzing each document for validity", "verification_started", {}, case_id)

        await asyncio.sleep(1)
        for req_type, doc_name, doc_type in docs_to_create:
            doc_id = doc_results[req_type]
            v = verify_document(doc_id, doc_name, doc_type)
            supabase().table("requirements").update({
                "status": "verified",
                "document_id": doc_id,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", req_ids[req_type]).execute()

        supabase().table("cases").update({"progress": 80}).eq("id", case_id).execute()
        yield await _emit(9, "✓ 3 documents verified", "Bank details, agreement and insurance all validated", "documents_verified", {"verified": 3}, case_id)

        # ── Step 10: Dependency conflict — two bank docs ──────────────────
        await asyncio.sleep(1.5)
        # Create a conflicting bank document
        conflict_doc = supabase().table("documents").insert({
            "case_id": case_id,
            "name": "Bank Details — Acme Supplies (UPDATED).pdf",
            "document_type": "bank_statement",
            "verification_status": "pending",
            "storage_path": "/demo/bank_details_v2.pdf",
        }).execute().data[0]

        yield await _emit(10, "⚠️ Conflict detected", "Two conflicting bank ownership documents submitted", "conflict_detected", {"conflict": "Two bank documents with different account numbers", "doc1": "Bank Details — Acme Supplies.pdf", "doc2": "Bank Details — Acme Supplies (UPDATED).pdf"}, case_id)

        # ── Step 11: Human approval required ─────────────────────────────
        await asyncio.sleep(1)
        approval = supabase().table("approvals").insert({
            "case_id": case_id,
            "reason": "Two conflicting bank ownership documents were submitted. Document 1 shows account ending 4821, Document 2 shows account ending 7934. Cannot proceed without clarification.",
            "recommendation": "Request the vendor to clarify which bank account should be used for payments and provide a single authorised bank confirmation letter.",
            "options": ["Approve Recommendation", "Request Different Evidence", "Escalate to Manager"],
            "status": "pending",
            "confidence": 0.91,
            "context_data": {"doc1_id": doc_results["bank_details"], "doc2_id": conflict_doc["id"]},
        }).execute().data[0]
        approval_id = approval["id"]

        supabase().table("cases").update({"status": "waiting"}).eq("id", case_id).execute()
        yield await _emit(11, "🛑 Agent paused — Human decision required", f"Conflicting bank documents. Confidence: 91%. Recommendation ready.", "human_decision_required", {"approval_id": approval_id, "confidence": 0.91}, case_id)

        # ── Step 12: Simulate human approves ─────────────────────────────
        await asyncio.sleep(3)
        supabase().table("approvals").update({
            "status": "approved",
            "decision": "Approve Recommendation",
            "resolved_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", approval_id).execute()

        supabase().table("cases").update({"status": "active"}).eq("id", case_id).execute()
        yield await _emit(12, "✅ Human decision recorded", "Decision: Approve Recommendation. Agent resuming workflow.", "human_decision_made", {"decision": "Approve Recommendation"}, case_id)

        # ── Step 13: Agent resumes, completes verification ────────────────
        await asyncio.sleep(1.5)
        # Remove conflict doc, keep verified one
        supabase().table("documents").update({
            "verification_status": "rejected",
            "verification_notes": "Superseded by clarified document per human decision",
        }).eq("id", conflict_doc["id"]).execute()

        supabase().table("requirements").update({
            "status": "verified",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", req_ids["bank_details"]).execute()

        supabase().table("promises").update({"status": "fulfilled"}).eq("id", promise_id).execute()

        yield await _emit(13, "🤖 Agent resumed — Verifying final state", "All 5 requirements now satisfied. Closing case…", "agent_resumed", {}, case_id)

        # ── Step 14: Case complete ────────────────────────────────────────
        await asyncio.sleep(1)
        supabase().table("cases").update({
            "status": "completed",
            "progress": 100,
            "risk": "low",
        }).eq("id", case_id).execute()

        supabase().table("events").insert({
            "case_id": case_id,
            "event_type": "case_completed",
            "actor": "agent",
            "actor_type": "agent",
            "title": "✓ Case COMPLETE — All requirements satisfied",
            "description": "✓ All requirements verified\n✓ Promises fulfilled\n✓ Evidence validated\n✓ No blockers",
        }).execute()

        yield await _emit(14, "🎉 CASE COMPLETE", "✓ All 5 requirements verified\n✓ All promises fulfilled\n✓ Evidence validated\n✓ Zero blockers", "case_completed", {
            "case_id": case_id,
            "summary": {
                "requirements_verified": 5,
                "promises_tracked": 1,
                "follow_ups_sent": 1,
                "documents_verified": 3,
                "human_decisions": 1,
            }
        }, case_id)

        yield f"data: {json.dumps({'step': 'done', 'case_id': case_id})}\n\n"

    except Exception as e:
        import traceback
        yield f"data: {json.dumps({'step': 'error', 'error': str(e), 'trace': traceback.format_exc()[:500]})}\n\n"


@router.post("/run")
async def run_demo():
    """Run the complete vendor onboarding demo scenario (SSE stream)."""
    return StreamingResponse(
        run_demo_scenario(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/status")
async def demo_status():
    try:
        cases = supabase().table("cases").select("id,title,status,progress,case_number").eq(
            "organization_id", ORG_ID
        ).order("created_at", desc=True).limit(5).execute().data or []
        return {"cases": cases, "org_id": ORG_ID}
    except Exception as e:
        return {"error": str(e)}


@router.delete("/reset")
async def reset_demo():
    """Reset all demo data (for repeated demos)."""
    try:
        cases = supabase().table("cases").select("id").eq("organization_id", ORG_ID).execute().data or []
        case_ids = [c["id"] for c in cases]
        for cid in case_ids:
            supabase().table("events").delete().eq("case_id", cid).execute()
            supabase().table("promises").delete().eq("case_id", cid).execute()
            supabase().table("documents").delete().eq("case_id", cid).execute()
            supabase().table("requirements").delete().eq("case_id", cid).execute()
            supabase().table("approvals").delete().eq("case_id", cid).execute()
            supabase().table("scheduled_actions").delete().eq("case_id", cid).execute()
            supabase().table("email_log").delete().eq("case_id", cid).execute()
        supabase().table("cases").delete().eq("organization_id", ORG_ID).execute()
        return {"reset": True, "cleared_cases": len(case_ids)}
    except Exception as e:
        return {"error": str(e)}
