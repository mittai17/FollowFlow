"""
FollowFlow Strands Agent Core
Implements the autonomous Observe → Reason → Act → Wait → Re-evaluate → Complete loop
"""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Optional
from strands import Agent
from strands.models.ollama import OllamaModel
from config import get_settings
from agent.tools import (
    get_case, update_case, get_requirements, update_requirement,
    extract_commitment, create_promise, update_promise, verify_promise,
    list_documents, verify_document,
    send_email, schedule_followup, check_deadlines,
    get_dependencies,
    request_human_approval, resume_case,
    log_activity, complete_case,
)
from agent.prompts import SYSTEM_PROMPT
from services.supabase_client import supabase
import structlog

log = structlog.get_logger()
settings = get_settings()

# Agent state (in-memory for demo; production would use Redis)
_agent_state: dict = {
    "status": "online",
    "current_case": None,
    "current_action": None,
    "last_action_at": None,
    "queue": [],
    "scheduled_count": 0,
}

ALL_TOOLS = [
    get_case, update_case, get_requirements, update_requirement,
    extract_commitment, create_promise, update_promise, verify_promise,
    list_documents, verify_document,
    send_email, schedule_followup, check_deadlines,
    get_dependencies,
    request_human_approval, resume_case,
    log_activity, complete_case,
]

TOOL_NAMES = [
    "get_case", "update_case", "get_requirements", "update_requirement",
    "extract_commitment", "create_promise", "update_promise", "verify_promise",
    "list_documents", "verify_document",
    "send_email", "schedule_followup", "check_deadlines",
    "get_dependencies",
    "request_human_approval", "resume_case",
    "log_activity", "complete_case",
]


def _build_agent() -> Agent:
    """Build a Strands agent with the configured model and all tools."""
    if settings.strands_model_provider == "bedrock":
        try:
            from strands.models import BedrockModel
            model = BedrockModel(model_id=settings.bedrock_model_id)
        except Exception:
            model = OllamaModel(
                model_id=settings.ollama_model,
                host=settings.ollama_base_url,
            )
    else:
        model = OllamaModel(
            model_id=settings.ollama_model,
            host=settings.ollama_base_url,
        )
    return Agent(
        model=model,
        tools=ALL_TOOLS,
        system_prompt=SYSTEM_PROMPT,
    )


async def run_agent_for_case(case_id: str, task: str) -> dict:
    """
    Run the FollowFlow agent on a specific case with a given task.
    The agent will autonomously use tools to complete the task.
    """
    _agent_state["status"] = "working"
    _agent_state["current_case"] = case_id
    _agent_state["current_action"] = task
    _agent_state["last_action_at"] = datetime.now(timezone.utc).isoformat()

    try:
        # Get case context
        case = supabase().table("cases").select("*").eq("id", case_id).single().execute().data
        if not case:
            return {"error": "Case not found"}

        reqs = supabase().table("requirements").select("*").eq("case_id", case_id).execute().data or []
        promises = supabase().table("promises").select("*").eq("case_id", case_id).execute().data or []

        context = f"""
Case: {case.get('title')} ({case.get('case_number', '')})
Status: {case.get('status')}
Progress: {case.get('progress', 0)}%
Requirements ({len(reqs)} total):
{chr(10).join(f"  - {r['name']}: {r['status']}" for r in reqs)}
Active promises ({len([p for p in promises if p['status'] == 'waiting'])}):
{chr(10).join(f"  - {p['person_name']}: {p['commitment']} (due: {p.get('deadline', 'unknown')})" for p in promises if p['status'] == 'waiting')}

Task: {task}
"""
        agent = _build_agent()

        # Run in executor to avoid blocking the event loop
        def _run():
            return agent(context)

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)

        log_activity(
            case_id=case_id,
            event_type="agent_completed_task",
            title=f"Agent completed: {task[:60]}",
        )
        return {"success": True, "result": str(result)}

    except Exception as e:
        log.error("agent_run_error", error=str(e), case_id=case_id)
        return {"error": str(e)}
    finally:
        _agent_state["status"] = "online"
        _agent_state["current_case"] = None
        _agent_state["current_action"] = None


def get_agent_status() -> dict:
    scheduled = 0
    try:
        res = supabase().table("scheduled_actions").select("id", count="exact").eq("status", "pending").execute()
        scheduled = res.count or 0
    except Exception:
        pass

    return {
        "status": _agent_state["status"],
        "current_case": _agent_state["current_case"],
        "current_action": _agent_state["current_action"],
        "last_action_at": _agent_state["last_action_at"],
        "queue_size": len(_agent_state["queue"]),
        "scheduled_count": scheduled,
        "tools": TOOL_NAMES,
    }
