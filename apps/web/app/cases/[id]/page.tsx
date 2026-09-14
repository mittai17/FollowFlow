'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCase, getCaseRequirements, getCasePromises, getCaseEvents, getApprovals, decideApproval, type Case, type Requirement, type Promise_, type Event_, type Approval } from '@/lib/api';
import { Card, StatusBadge, RiskBadge, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, formatDateTime, getRelativeTime, getEventIcon } from '@/lib/utils';
import { ChevronLeft, CheckCircle, Circle, Clock, AlertTriangle, ArrowRight, User } from 'lucide-react';

function RequirementRow({ req }: { req: Requirement }) {
  const done = req.status === 'verified' || req.status === 'received';
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${done ? 'bg-emerald-50' : 'bg-[#F7F8FA]'}`}>
      {done ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-[#98A2B3] flex-shrink-0" />}
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? 'text-emerald-700' : 'text-[#111827]'}`}>{req.name}</p>
        {req.description && <p className="text-xs text-[#667085]">{req.description}</p>}
      </div>
      <StatusBadge status={req.status} />
    </div>
  );
}

function PromiseCard({ p }: { p: Promise_ }) {
  const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status === 'waiting';
  return (
    <div className="p-3 rounded-xl border border-[#E4E7EC] bg-white">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[#667085]" />
          <span className="text-xs font-semibold text-[#111827]">{p.person_name || 'Unknown'}</span>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <p className="text-sm text-[#111827] mb-1.5">"{p.commitment}"</p>
      {p.deadline && (
        <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-[#667085]'}`}>
          {isOverdue ? '⚠️ Overdue — ' : '⏰ Due '}
          {formatDate(p.deadline)}
        </p>
      )}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-[#98A2B3]">
        <span>Confidence: {Math.round(p.confidence * 100)}%</span>
        {p.follow_up_count > 0 && <span>· {p.follow_up_count} follow-up(s) sent</span>}
      </div>
    </div>
  );
}

function ApprovalCard({ a, onDecide }: { a: Approval; onDecide: () => void }) {
  const [loading, setLoading] = useState(false);
  const [decided, setDecided] = useState(false);

  async function decide(option: string) {
    setLoading(true);
    try { await decideApproval(a.id, option); setDecided(true); onDecide(); } catch {}
    setLoading(false);
  }

  if (decided) return (
    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
      <p className="text-sm font-medium text-emerald-700">✅ Decision recorded — Agent resuming</p>
    </div>
  );

  return (
    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-900">Human Decision Required</span>
        <span className="ml-auto text-xs text-amber-700">Confidence: {Math.round(a.confidence * 100)}%</span>
      </div>
      <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-xs font-semibold text-red-700 mb-1">WHY I STOPPED</p>
        <p className="text-sm text-red-900">{a.reason}</p>
      </div>
      <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
        <p className="text-xs font-semibold text-indigo-700 mb-1">MY RECOMMENDATION</p>
        <p className="text-sm text-indigo-900">{a.recommendation}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {a.options.map((opt, i) => (
          <button key={i} onClick={() => decide(opt)} disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-[#E4E7EC] text-[#111827] hover:bg-[#F7F8FA]'} disabled:opacity-50`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [promises, setPromises] = useState<Promise_[]>([]);
  const [events, setEvents] = useState<Event_[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [c, r, p, e, a] = await Promise.all([
        getCase(id), getCaseRequirements(id), getCasePromises(id),
        getCaseEvents(id), getApprovals('pending'),
      ]);
      setCaseData(c); setRequirements(r); setPromises(p);
      setEvents(e); setApprovals(a.filter(ap => ap.case_id === id));
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!caseData) return <div className="p-8"><EmptyState icon="❓" title="Case not found" description="This case may have been deleted" /></div>;

  const doneCount = requirements.filter(r => r.status === 'verified' || r.status === 'received').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/cases" className="mt-1 p-2 rounded-xl hover:bg-[#E4E7EC] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[#667085]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {caseData.case_number && <span className="text-xs font-mono text-[#98A2B3]">{caseData.case_number}</span>}
            <StatusBadge status={caseData.status} />
            <RiskBadge risk={caseData.risk} />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">{caseData.title}</h1>
          {caseData.description && <p className="text-sm text-[#667085] mt-0.5">{caseData.description}</p>}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-xs text-[#667085] mb-1">Progress</p>
          <p className="text-3xl font-bold text-indigo-600">{caseData.progress}%</p>
          <ProgressBar value={caseData.progress} className="mt-2" />
        </Card>
        <Card className="text-center">
          <p className="text-xs text-[#667085] mb-1">Deadline</p>
          <p className="text-lg font-bold text-[#111827]">{formatDate(caseData.deadline)}</p>
          <p className="text-xs text-[#98A2B3]">{getRelativeTime(caseData.deadline)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-[#667085] mb-1">Requirements</p>
          <p className="text-3xl font-bold text-emerald-600">{doneCount}<span className="text-base text-[#98A2B3]">/{requirements.length}</span></p>
          <p className="text-xs text-[#98A2B3]">verified</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-[#667085] mb-1">Promises</p>
          <p className="text-3xl font-bold text-purple-600">{promises.length}</p>
          <p className="text-xs text-[#98A2B3]">tracked</p>
        </Card>
      </div>

      {/* Approvals Alert */}
      {approvals.length > 0 && (
        <div className="mb-6 space-y-3">
          {approvals.map(a => <ApprovalCard key={a.id} a={a} onDecide={load} />)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Requirements */}
        <Card>
          <h2 className="font-semibold text-[#111827] text-sm mb-3">Requirements ({doneCount}/{requirements.length})</h2>
          {requirements.length === 0 ? (
            <EmptyState icon="📝" title="No requirements" description="Run the demo to see requirements" />
          ) : (
            <div className="space-y-2">{requirements.map(r => <RequirementRow key={r.id} req={r} />)}</div>
          )}
        </Card>

        {/* Promises */}
        <Card>
          <h2 className="font-semibold text-[#111827] text-sm mb-3">Tracked Promises ({promises.length})</h2>
          {promises.length === 0 ? (
            <EmptyState icon="🤝" title="No promises tracked" description="Agent will detect commitments automatically" />
          ) : (
            <div className="space-y-2">{promises.map(p => <PromiseCard key={p.id} p={p} />)}</div>
          )}
        </Card>

        {/* Activity Timeline */}
        <Card className="col-span-2">
          <h2 className="font-semibold text-[#111827] text-sm mb-4">Activity Timeline</h2>
          {events.length === 0 ? (
            <EmptyState icon="📜" title="No activity yet" description="Events will appear here as the agent works" />
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[#E4E7EC]" />
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e.id} className="flex items-start gap-4 pl-0">
                    <div className="w-10 h-10 rounded-full bg-[#F7F8FA] border-2 border-[#E4E7EC] flex items-center justify-center text-base flex-shrink-0 z-10">
                      {getEventIcon(e.event_type)}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[#111827]">{e.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${e.actor_type === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {e.actor_type === 'agent' ? 'AGENT' : 'USER'}
                        </span>
                      </div>
                      {e.description && <p className="text-xs text-[#667085]">{e.description}</p>}
                      <p className="text-[10px] text-[#98A2B3] mt-0.5">{formatDateTime(e.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
