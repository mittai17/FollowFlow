"""
Risk calculator for deadline/document risk assessment
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


def calculate_risk(
    deadline: Optional[datetime],
    total_requirements: int,
    completed_requirements: int,
    avg_response_days: float = 2.3,
    pending_promises: int = 0,
) -> dict:
    """
    Calculate risk level and return structured risk assessment.
    Returns: {"level": "low|medium|high|critical", "score": 0-100, "reason": str}
    """
    if not deadline or total_requirements == 0:
        return {"level": "low", "score": 10, "reason": "No deadline set"}

    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    days_remaining = (deadline - now).total_seconds() / 86400
    remaining_requirements = total_requirements - completed_requirements
    days_needed = remaining_requirements * avg_response_days

    score = 0

    # Overdue
    if days_remaining < 0:
        return {
            "level": "critical",
            "score": 100,
            "reason": f"Overdue by {abs(int(days_remaining))} days",
        }

    # Time pressure
    if days_remaining < days_needed:
        deficit = days_needed - days_remaining
        score += min(60, int(deficit / days_needed * 60))

    # Completion ratio
    completion_ratio = completed_requirements / total_requirements
    if completion_ratio < 0.3:
        score += 30
    elif completion_ratio < 0.6:
        score += 20
    elif completion_ratio < 0.8:
        score += 10

    # Pending promises factor
    if pending_promises > 0:
        score += min(20, pending_promises * 5)

    # Days remaining factor
    if days_remaining <= 1:
        score = max(score, 80)
    elif days_remaining <= 3:
        score = max(score, 60)
    elif days_remaining <= 7:
        score = max(score, 30)

    score = min(100, score)

    if score >= 75:
        level = "critical"
    elif score >= 50:
        level = "high"
    elif score >= 25:
        level = "medium"
    else:
        level = "low"

    reason = (
        f"{remaining_requirements} of {total_requirements} requirements pending, "
        f"{int(days_remaining)} days remaining"
    )

    return {"level": level, "score": score, "reason": reason}


def calculate_progress(total: int, completed: int) -> int:
    if total == 0:
        return 0
    return int((completed / total) * 100)
