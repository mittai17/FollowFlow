const API = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:8000';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Dashboard
export const getStats = () => req<DashboardStats>('/api/cases/stats');

// Cases
export const getCases = (status?: string) =>
  req<Case[]>(`/api/cases${status ? `?status=${status}` : ''}`);
export const getCase = (id: string) => req<Case>(`/api/cases/${id}`);
export const createCase = (data: CreateCaseInput) =>
  req<Case>('/api/cases', { method: 'POST', body: JSON.stringify(data) });
export const getCaseRequirements = (id: string) =>
  req<Requirement[]>(`/api/cases/${id}/requirements`);
export const getCasePromises = (id: string) =>
  req<Promise_[]>(`/api/cases/${id}/promises`);
export const getCaseEvents = (id: string) =>
  req<Event_[]>(`/api/cases/${id}/events`);

// Promises
export const getPromises = (status?: string) =>
  req<Promise_[]>(`/api/promises${status ? `?status=${status}` : ''}`);
export const extractCommitment = (message: string, personName?: string) =>
  req<CommitmentResult>('/api/promises/extract', {
    method: 'POST',
    body: JSON.stringify({ message, person_name: personName }),
  });

// Documents
export const getDocuments = (caseId?: string) =>
  req<Document_[]>(`/api/documents${caseId ? `?case_id=${caseId}` : ''}`);

// Approvals
export const getApprovals = (status = 'pending') =>
  req<Approval[]>(`/api/approvals?status=${status}`);
export const decideApproval = (id: string, decision: string) =>
  req<{ success: boolean }>(`/api/approvals/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  });

// Events
export const getEvents = (limit = 50, actorType?: string) =>
  req<Event_[]>(`/api/events?limit=${limit}${actorType ? `&actor_type=${actorType}` : ''}`);

// Agent
export const getAgentStatus = () => req<AgentStatus>('/api/agent/status');

// Demo
export const resetDemo = () =>
  req<{ reset: boolean }>('/api/demo/reset', { method: 'DELETE' });
export const getDemoStatus = () => req<{ cases: Case[] }>('/api/demo/status');

// SSE
export const streamDemo = (onEvent: (data: DemoStep) => void, onDone: () => void) => {
  const es = new EventSource(`${API}/api/demo/run`);
  // EventSource only supports GET; use fetch for POST SSE
  es.close();
  // Use fetch for POST SSE
  fetch(`${API}/api/demo/run`, { method: 'POST' }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone(); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const raw = line.replace(/^data: /, '').trim();
        if (!raw) continue;
        try { onEvent(JSON.parse(raw)); } catch {}
      }
    }
  });
};

// Types
export interface DashboardStats {
  active_cases: number;
  waiting_cases: number;
  at_risk_cases: number;
  blocked_cases: number;
  completed_today: number;
  promises_tracked: number;
  pending_approvals: number;
  documents_verified: number;
}

export interface Case {
  id: string;
  case_number?: string;
  title: string;
  description?: string;
  status: string;
  risk: string;
  progress: number;
  deadline?: string;
  owner_id?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface CreateCaseInput {
  title: string;
  description?: string;
  deadline?: string;
}

export interface Requirement {
  id: string;
  case_id: string;
  name: string;
  description?: string;
  status: string;
  required_evidence?: string;
  document_id?: string;
  sort_order: number;
  completed_at?: string;
  created_at: string;
}

export interface Promise_ {
  id: string;
  case_id: string;
  person_name?: string;
  commitment: string;
  original_message?: string;
  deadline?: string;
  status: string;
  evidence_required?: string;
  confidence: number;
  follow_up_count: number;
  last_follow_up_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Document_ {
  id: string;
  case_id: string;
  name: string;
  document_type?: string;
  verification_status: string;
  verification_notes?: string;
  storage_path?: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface Approval {
  id: string;
  case_id: string;
  reason: string;
  recommendation: string;
  options: string[];
  status: string;
  confidence: number;
  decision?: string;
  context_data?: Record<string, unknown>;
  created_at: string;
  resolved_at?: string;
  cases?: { title: string; case_number?: string };
}

export interface Event_ {
  id: string;
  case_id?: string;
  event_type: string;
  actor: string;
  actor_type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AgentStatus {
  status: string;
  current_case?: string;
  current_action?: string;
  last_action_at?: string;
  queue_size: number;
  scheduled_count: number;
  tools: string[];
}

export interface CommitmentResult {
  is_commitment: boolean;
  person?: string;
  commitment?: string;
  deadline?: string;
  evidence_required?: string;
  confidence: number;
  original_message?: string;
}

export interface DemoStep {
  step: number | string;
  title: string;
  description: string;
  event_type: string;
  timestamp: string;
  data: Record<string, unknown>;
  case_id?: string;
  error?: string;
}
