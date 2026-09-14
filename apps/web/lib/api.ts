const API = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:8000';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ── Commitments ─────────────────────────────────────────────────────────────
export const getCommitments = (params?: { visibility?: string; status?: string; risk?: string; search?: string }) => {
  const q = new URLSearchParams();
  if (params?.visibility) q.append('visibility', params.visibility);
  if (params?.status) q.append('status', params.status);
  if (params?.risk) q.append('risk', params.risk);
  if (params?.search) q.append('search', params.search);
  const qs = q.toString();
  return req<Commitment[]>(`/api/commitments${qs ? `?${qs}` : ''}`);
};

export const getCommitmentStats = () => req<CommitmentStats>('/api/commitments/stats');
export const getCommitmentDetail = (id: string) => req<CommitmentDetail>(`/api/commitments/${id}`);
export const createCommitment = (data: CreateCommitmentInput) =>
  req<Commitment>('/api/commitments', { method: 'POST', body: JSON.stringify(data) });
export const updateCommitment = (id: string, data: Partial<Commitment>) =>
  req<Commitment>(`/api/commitments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const detectCommitmentAI = (text: string, personName?: string) =>
  req<DetectedCommitmentResponse>('/api/commitments/detect', {
    method: 'POST',
    body: JSON.stringify({ text, person_name: personName }),
  });
export const extractCommitment = detectCommitmentAI;
export const verifyCommitment = (id: string, evidenceUrl?: string) =>
  req<VerificationResult>(`/api/commitments/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ evidence_url: evidenceUrl }),
  });
export const supportCommitment = (id: string, supporterName?: string) =>
  req<{ supported: boolean }>(`/api/commitments/${id}/support`, {
    method: 'POST',
    body: JSON.stringify({ supporter_name: supporterName }),
  });

export const uploadCommitmentFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/api/commitments/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json() as Promise<{ url: string; file_name: string; file_size: string; file_type: string }>;
};

export const connectGitHubRepo = (repo: string) =>
  req<{
    connected: boolean;
    full_name: string;
    owner: string;
    name: string;
    url: string;
    stars: number;
    language: string;
    default_branch: string;
    description: string;
    is_public: boolean;
  }>('/api/commitments/github/connect', {
    method: 'POST',
    body: JSON.stringify({ repo }),
  });

export const guideCommitmentAI = (prompt: string, scope = 'individual', organization = 'FollowFlow Labs', role = 'Lead Engineer') =>
  req<{
    title: string;
    description: string;
    suggested_deadline: string;
    deadline_label: string;
    evidence_type: string;
    evidence_instructions: string;
    scope: string;
    organization_name: string;
    role: string;
    visibility: string;
    clarifying_questions: string[];
    dependencies: string[];
    confidence: number;
  }>('/api/commitments/ai/guide', {
    method: 'POST',
    body: JSON.stringify({ prompt, scope, organization, role }),
  });

// ── Social & Community ──────────────────────────────────────────────────────
export const getFeed = () => req<FeedItem[]>('/api/feed');
export const getChallenges = () => req<Challenge[]>('/api/challenges');
export const joinChallenge = (id: string, userName?: string) =>
  req<{ joined: boolean }>(`/api/challenges/${id}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_name: userName }),
  });
export const getProfile = (username = 'Rahul Kumar') =>
  req<ProfileData>(`/api/profile/${encodeURIComponent(username)}`);
export const getScoringRules = () => req<ScoringRules>('/api/scoring/rules');

// ── Legacy / Compatibility ──────────────────────────────────────────────────
export const getStats = () => req<any>('/api/cases/stats');
export const getCases = () => req<any[]>('/api/cases');
export const getCase = (id: string) => req<any>(`/api/cases/${id}`);
export const getCaseRequirements = (id: string) => req<any[]>(`/api/cases/${id}/requirements`);
export const getCasePromises = (id: string) => req<any[]>(`/api/cases/${id}/promises`);
export const getCaseEvents = (id: string) => req<any[]>(`/api/cases/${id}/events`);
export const getPromises = (status?: string) => req<any[]>(`/api/promises${status ? `?status=${status}` : ''}`);
export const getDocuments = () => req<any[]>('/api/documents');
export const getApprovals = (status = 'pending') => req<any[]>(`/api/approvals?status=${status}`);
export const decideApproval = (id: string, decision: string) =>
  req<{ success: boolean }>(`/api/approvals/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  });
export const getEvents = (limit = 50, actorType?: string) =>
  req<any[]>(`/api/events?limit=${limit}${actorType ? `&actor_type=${actorType}` : ''}`);
export const getAgentStatus = () => req<any>('/api/agent/status');
export const resetDemo = () => req<{ reset: boolean }>('/api/demo/reset', { method: 'DELETE' });

// ── SSE Demo Streamer ───────────────────────────────────────────────────────
export const streamDemo = (onEvent: (data: any) => void, onDone: () => void, speed = 'Normal') => {
  fetch(`${API}/api/demo/run?speed=${speed}`, { method: 'POST' }).then(async (res) => {
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
  }).catch(() => onDone());
};

// ── Types ───────────────────────────────────────────────────────────────────
export interface Commitment {
  id: string;
  owner_id?: string;
  owner_name: string;
  title: string;
  description?: string;
  deadline?: string;
  visibility: 'private' | 'shared' | 'public';
  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'UPCOMING'
    | 'DUE_SOON'
    | 'DUE_TODAY'
    | 'WAITING_FOR_EVIDENCE'
    | 'FULFILLED'
    | 'VERIFIED'
    | 'RESCHEDULED'
    | 'AT_RISK'
    | 'MISSED'
    | 'CANCELLED'
    | 'DISPUTED';
  risk: 'low' | 'medium' | 'high' | 'critical';
  evidence_type?: string;
  evidence_url?: string;
  score_weight: number;
  progress: number;
  rescheduled_reason?: string;
  created_at: string;
  updated_at: string;
  supports?: { count: number }[];
  scope?: 'individual' | 'team';
  organization_name?: string;
  role?: string;
  team_members?: string[];
  github_repo?: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
}

export interface CommitmentStats {
  my_commitments: number;
  active_count: number;
  due_soon: number;
  at_risk: number;
  waiting_for_evidence: number;
  verified_count: number;
  streak_days: number;
  reliability_score: number;
  pending_approvals: number;
  scheduled_followups: number;
  agent_status: string;
}

export interface CommitmentDetail extends Commitment {
  evidence: any[];
  agent_events: any[];
  supports: any[];
  support_count: number;
}

export interface CreateCommitmentInput {
  title: string;
  description?: string;
  deadline?: string;
  visibility: string;
  evidence_type?: string;
  evidence_url?: string;
  owner_name?: string;
  scope?: 'individual' | 'team';
  organization_name?: string;
  role?: string;
  team_members?: string[];
  github_repo?: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
}

export interface DetectedCommitmentResponse {
  is_commitment: boolean;
  commitments: {
    title: string;
    owner: string;
    deadline?: string;
    evidence_required?: string;
    evidence_type?: string;
    visibility: string;
    confidence: number;
  }[];
  dependency?: string;
  confidence: number;
}

export interface VerificationResult {
  verified: boolean;
  status: string;
  evidence: any;
  checks: Record<string, any>;
  score_updated: boolean;
}

export interface FeedItem extends Commitment {
  support_count: number;
  supporters: string[];
  verified_evidence?: any;
  is_verified: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  start_date: string;
  end_date: string;
  participant_count: number;
  completion_rate: number;
  top_streak: number;
  members: {
    id: string;
    user_name: string;
    progress: number;
    streak: number;
    status: string;
  }[];
}

export interface ProfileData {
  user: {
    name: string;
    title: string;
    avatar_url?: string;
    bio: string;
  };
  score: {
    reliability_score: number;
    total_count: number;
    fulfilled_count: number;
    missed_count: number;
    rescheduled_count: number;
    verified_count: number;
    on_time_rate: number;
    fulfillment_rate: number;
    verified_rate: number;
    consistency_rate: number;
    streak_days: number;
  };
  badges: {
    type: string;
    label: string;
    description: string;
  }[];
  recent_verified: Commitment[];
  active_commitments: Commitment[];
  verified_by: string;
}

export interface ScoringRules {
  title: string;
  summary: string;
  rules: {
    event: string;
    delta: string;
    description: string;
    color: string;
  }[];
  formula: string;
  safeguards: string[];
}
