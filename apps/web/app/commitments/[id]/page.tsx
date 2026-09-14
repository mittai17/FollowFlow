'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCommitmentDetail, updateCommitment, verifyCommitment, supportCommitment,
  type CommitmentDetail
} from '@/lib/api';
import { Card, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, formatDateTime, getRelativeTime, getEventIcon, cn } from '@/lib/utils';
import {
  ArrowLeft, ShieldCheck, Clock, CheckCircle2, AlertTriangle,
  Calendar, Globe, Lock, Users, Sparkles, Heart, RefreshCw, X, Link as LinkIcon
} from 'lucide-react';

export default function CommitmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CommitmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Evidence verification state
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Reschedule modal state (Section 14)
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Support state
  const [supported, setSupported] = useState(false);

  async function load() {
    try {
      const res = await getCommitmentDetail(id);
      setData(res);
      if (res.evidence_url) setEvidenceUrl(res.evidence_url);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!evidenceUrl.trim()) return;
    setVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await verifyCommitment(id, evidenceUrl);
      if (res.verified) {
        setVerificationFeedback('✓ Evidence successfully verified by FollowFlow Autonomous Agent! Reliability score updated.');
        load();
      }
    } catch (err: any) {
      setVerificationFeedback(`Verification error: ${err.message}`);
    }
    setVerifying(false);
  }

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeadline || !rescheduleReason) return;
    setRescheduling(true);
    try {
      await updateCommitment(id, {
        deadline: newDeadline,
        rescheduled_reason: rescheduleReason,
        status: 'RESCHEDULED',
      });
      setShowReschedule(false);
      load();
    } catch {}
    setRescheduling(false);
  }

  async function handleSupport() {
    try {
      await supportCommitment(id, 'Rahul Kumar');
      setSupported(true);
      load();
    } catch {}
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <EmptyState icon="❓" title="Commitment not found" description="This commitment does not exist or has been removed." />
      </div>
    );
  }

  const isVerified = data.status === 'VERIFIED';
  const isAtRisk = data.risk === 'high' || data.risk === 'critical';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <Link
        href="/commitments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Commitments
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-[24px] border border-[#E4E7EC] p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : isAtRisk
                    ? 'bg-red-100 text-red-800'
                    : data.status === 'RESCHEDULED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-indigo-100 text-indigo-800'
                )}
              >
                {data.status.replace(/_/g, ' ')}
              </span>

              <span className="flex items-center gap-1 text-xs text-[#667085] font-medium bg-[#F7F8FA] px-2 py-0.5 rounded">
                {data.visibility === 'public' ? (
                  <Globe className="w-3 h-3 text-cyan-600" />
                ) : data.visibility === 'shared' ? (
                  <Users className="w-3 h-3 text-indigo-600" />
                ) : (
                  <Lock className="w-3 h-3 text-[#98A2B3]" />
                )}
                <span className="capitalize">{data.visibility}</span>
              </span>

              {isAtRisk && (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risk: {data.risk}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-[#111827]">{data.title}</h1>
            {data.description && <p className="text-sm text-[#667085] leading-relaxed">{data.description}</p>}
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setShowReschedule(true)}
              className="px-3.5 py-2 border border-[#E4E7EC] text-[#111827] rounded-xl text-xs font-semibold hover:bg-[#F7F8FA] transition-colors"
            >
              Reschedule
            </button>
            {data.visibility === 'public' && (
              <button
                onClick={handleSupport}
                disabled={supported}
                className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Heart className={cn('w-3.5 h-3.5', supported && 'fill-indigo-600')} />
                {supported ? 'Supported' : `Support (${data.support_count})`}
              </button>
            )}
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#E4E7EC] text-xs">
          <div>
            <span className="text-[#98A2B3] block">Owner</span>
            <span className="font-bold text-[#111827]">{data.owner_name}</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Deadline</span>
            <span className="font-bold text-[#111827]">
              {data.deadline ? formatDate(data.deadline) : 'No due date'}
            </span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Evidence Expected</span>
            <span className="font-bold text-[#111827] capitalize">{data.evidence_type || 'URL/Document'}</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Progress</span>
            <span className="font-bold text-indigo-600">{data.progress}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Evidence & Dependencies (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Evidence Engine (Sections 12, 13, 37) */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-sm text-[#111827]">Evidence Engine & Verification</h2>
            </div>
            <p className="text-xs text-[#667085] mb-4">
              A commitment cannot be marked fulfilled by assertion alone. Submit repository URLs, deliverables, or documents for automated verification.
            </p>

            <form onSubmit={handleVerify} className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-bold text-[#111827] block mb-1">Evidence URL / Proof Artifact</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="flex-1 px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {verifying ? 'Verifying…' : 'Verify Proof'}
                  </button>
                </div>
              </div>
            </form>

            {verificationFeedback && (
              <div
                className={cn(
                  'p-3 rounded-xl text-xs mb-4',
                  verificationFeedback.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                )}
              >
                {verificationFeedback}
              </div>
            )}

            {/* Submitted Evidence Records */}
            {data.evidence && data.evidence.length > 0 && (
              <div className="space-y-2 border-t border-[#E4E7EC] pt-3">
                <p className="text-xs font-bold text-[#667085]">Verified Artifacts</p>
                {data.evidence.map((ev) => (
                  <div key={ev.id} className="p-3 bg-[#F7F8FA] border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <a href={ev.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline truncate max-w-sm">
                        {ev.url}
                      </a>
                    </div>
                    <span className="text-[10px] text-[#98A2B3]">{formatDate(ev.verified_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Dependency Engine (Sections 10 & 11) */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🔗</span>
              <h2 className="font-bold text-sm text-[#111827]">Promise Chain & Dependencies</h2>
            </div>
            <p className="text-xs text-[#667085] mb-4">
              Clean vertical chain illustrating pre-requisites and downstream commitments.
            </p>

            <div className="space-y-2 relative">
              <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 block">PREREQUISITE</span>
                  <span className="font-bold text-[#111827]">Draft Specification & Requirements</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                  ✓ SATISFIED
                </span>
              </div>

              <div className="flex justify-center text-[#98A2B3] text-sm">↓</div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 block">CURRENT COMMITMENT</span>
                  <span className="font-bold text-[#111827]">{data.title}</span>
                </div>
                <span className="text-indigo-700 bg-white px-2 py-0.5 rounded font-bold text-[10px] border border-indigo-200">
                  {data.status}
                </span>
              </div>

              <div className="flex justify-center text-[#98A2B3] text-sm">↓</div>

              <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl flex items-center justify-between text-xs opacity-75">
                <div>
                  <span className="text-[10px] font-bold text-[#667085] block">DOWNSTREAM DEPENDENCY</span>
                  <span className="font-bold text-[#111827]">Stakeholder Review & Final Acceptance</span>
                </div>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px]">
                  BLOCKED BY THIS
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Agent Activity Timeline (1 col) */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-[#111827]">Agent Activity</h2>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                AUDITED
              </span>
            </div>

            {data.agent_events && data.agent_events.length > 0 ? (
              <div className="space-y-3">
                {data.agent_events.map((ev) => (
                  <div key={ev.id} className="text-xs p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] space-y-0.5">
                    <p className="font-semibold text-[#111827]">{ev.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#98A2B3]">
                      <span className="uppercase font-bold text-indigo-600">{ev.event_type.replace(/_/g, ' ')}</span>
                      <span>{getRelativeTime(ev.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#667085]">No recorded events yet.</p>
            )}
          </Card>

          {/* Social Proof Box */}
          {data.visibility === 'public' && (
            <Card className="text-center">
              <h3 className="font-bold text-xs text-[#111827] mb-1">Community Trust</h3>
              <p className="text-xs text-[#667085] mb-3">
                This commitment is public. Once verified, it earns +1.0 points toward your profile.
              </p>
              <div className="p-3 bg-[#F7F8FA] rounded-xl text-xs font-semibold text-indigo-700">
                {data.support_count} members supporting this goal
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reschedule Modal (Section 14) */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#111827]">Reschedule Commitment</h3>
              <button onClick={() => setShowReschedule(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <p className="text-xs text-[#667085] mb-4">
              Transparent rescheduling before deadline expiration does not penalize your reliability score.
            </p>

            <form onSubmit={handleReschedule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#111827] block mb-1">New Target Date</label>
                <input
                  type="date"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] block mb-1">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Waiting for upstream API dependencies or customer feedback"
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  {rescheduling ? 'Updating…' : 'Confirm Reschedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="px-4 py-2.5 bg-white border border-[#E4E7EC] rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
