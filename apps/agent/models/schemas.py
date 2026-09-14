"""
Pydantic schemas for FollowFlow API
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────

class CaseStatus(str, Enum):
    active = "active"
    waiting = "waiting"
    at_risk = "at_risk"
    blocked = "blocked"
    completed = "completed"
    cancelled = "cancelled"

class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class RequirementStatus(str, Enum):
    pending = "pending"
    waiting = "waiting"
    received = "received"
    verified = "verified"
    rejected = "rejected"

class PromiseStatus(str, Enum):
    waiting = "waiting"
    fulfilled = "fulfilled"
    broken = "broken"
    updated = "updated"
    cancelled = "cancelled"

class DocumentVerification(str, Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    expired = "expired"

class ApprovalStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    escalated = "escalated"


# ── Cases ──────────────────────────────────────────────────────────────────

class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    deadline: Optional[datetime] = None
    organization_id: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    risk: Optional[RiskLevel] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    deadline: Optional[datetime] = None

class CaseOut(BaseModel):
    id: str
    case_number: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    risk: str
    progress: int = 0
    deadline: Optional[datetime] = None
    owner_id: Optional[str] = None
    organization_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    metadata: dict = {}

    class Config:
        from_attributes = True


# ── Requirements ───────────────────────────────────────────────────────────

class RequirementCreate(BaseModel):
    name: str
    description: Optional[str] = None
    required_evidence: Optional[str] = None
    sort_order: int = 0

class RequirementUpdate(BaseModel):
    status: Optional[RequirementStatus] = None
    document_id: Optional[str] = None
    completed_at: Optional[datetime] = None

class RequirementOut(BaseModel):
    id: str
    case_id: str
    name: str
    description: Optional[str] = None
    status: str
    required_evidence: Optional[str] = None
    document_id: Optional[str] = None
    sort_order: int = 0
    completed_at: Optional[datetime] = None
    created_at: datetime


# ── Promises ───────────────────────────────────────────────────────────────

class CommitmentExtract(BaseModel):
    message: str
    case_id: Optional[str] = None
    person_name: Optional[str] = None

class CommitmentResult(BaseModel):
    is_commitment: bool
    person: Optional[str] = None
    commitment: Optional[str] = None
    deadline: Optional[str] = None  # ISO date string
    evidence_required: Optional[str] = None
    confidence: float = 0.0
    original_message: str = ""

class PromiseCreate(BaseModel):
    case_id: str
    person_name: str
    commitment: str
    original_message: Optional[str] = None
    deadline: Optional[datetime] = None
    evidence_required: Optional[str] = None
    confidence: float = 0.9

class PromiseUpdate(BaseModel):
    status: Optional[PromiseStatus] = None
    deadline: Optional[datetime] = None
    evidence_document_id: Optional[str] = None
    follow_up_count: Optional[int] = None
    last_follow_up_at: Optional[datetime] = None

class PromiseOut(BaseModel):
    id: str
    case_id: str
    person_name: Optional[str] = None
    commitment: str
    original_message: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str
    evidence_required: Optional[str] = None
    evidence_document_id: Optional[str] = None
    confidence: float = 0.9
    follow_up_count: int = 0
    last_follow_up_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ── Documents ──────────────────────────────────────────────────────────────

class DocumentCreate(BaseModel):
    case_id: str
    requirement_id: Optional[str] = None
    name: str
    document_type: Optional[str] = None
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None

class DocumentOut(BaseModel):
    id: str
    case_id: str
    requirement_id: Optional[str] = None
    name: str
    document_type: Optional[str] = None
    storage_path: Optional[str] = None
    verification_status: str
    verification_notes: Optional[str] = None
    expiration_date: Optional[str] = None
    uploaded_at: datetime
    verified_at: Optional[datetime] = None
    metadata: dict = {}


# ── Approvals ──────────────────────────────────────────────────────────────

class ApprovalCreate(BaseModel):
    case_id: str
    reason: str
    recommendation: str
    options: List[str] = []
    confidence: float = 0.9
    context_data: dict = {}

class ApprovalDecide(BaseModel):
    decision: str
    decided_by: Optional[str] = None

class ApprovalOut(BaseModel):
    id: str
    case_id: str
    reason: str
    recommendation: str
    options: List[Any] = []
    status: str
    confidence: float
    decision: Optional[str] = None
    decided_by: Optional[str] = None
    context_data: dict = {}
    created_at: datetime
    resolved_at: Optional[datetime] = None


# ── Events ─────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    case_id: Optional[str] = None
    event_type: str
    actor: str = "agent"
    actor_type: str = "agent"
    title: str
    description: Optional[str] = None
    metadata: dict = {}

class EventOut(BaseModel):
    id: str
    case_id: Optional[str] = None
    event_type: str
    actor: str
    actor_type: str
    title: str
    description: Optional[str] = None
    metadata: dict = {}
    created_at: datetime


# ── Agent Status ───────────────────────────────────────────────────────────

class AgentStatus(BaseModel):
    status: str = "online"
    current_case: Optional[str] = None
    current_action: Optional[str] = None
    queue_size: int = 0
    scheduled_count: int = 0
    last_action_at: Optional[datetime] = None
    tools: List[str] = []


# ── Demo ───────────────────────────────────────────────────────────────────

class DemoStep(BaseModel):
    step: int
    title: str
    description: str
    event_type: str
    timestamp: datetime
    data: dict = {}


# ── Dashboard Stats ────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    active_cases: int = 0
    waiting_cases: int = 0
    at_risk_cases: int = 0
    blocked_cases: int = 0
    completed_today: int = 0
    promises_tracked: int = 0
    pending_approvals: int = 0
    documents_verified: int = 0
