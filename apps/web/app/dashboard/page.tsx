'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCommitmentStats, getCommitments, getEvents, getScoringRules,
  type CommitmentStats, type Commitment, type ScoringRules
} from '@/lib/api';
import { Card, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime, getEventIcon } from '@/lib/utils';
import {
  Zap, Plus, ShieldCheck, AlertTriangle, Clock,
  ArrowRight, RefreshCw, CheckCircle2, HelpCircle, X
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<CommitmentStats | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState<ScoringRules | null>(null);

  async function loadData() {
    try {
      const [s, c, e, r] = await Promise.all([
        getCommitmentStats(),
        getCommitments({ limit: 20 }),
        getEvents(15),
        getScoringRules(),
      ]);
      setStats(s);
      setCommitments(c);
      setEvents(e);
      setRules(r);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const atRiskList = commitments.filter(
    (c) => c.risk === 'high' || c.risk === 'critical' || c.status === 'AT_RISK'
  );
  const verifiedList = commitments.filter((c) => c.status === 'VERIFIED');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Command Center
            </span>
            <span className="text-xs text-[#98A2B3]">· Autonomous Agent Live</span>
          </div>
          <h1 className="text-2xl font-black text-[#111827]">Commitment Overview</h1>
          <p className="text-sm text-[#667085]">
            Keep your promises. FollowFlow monitors deadlines, verifies evidence, and drives follow-through.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs font-semibold text-[#667085] hover:text-[#111827] hover:border-indigo-300 transition-colors shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Scoring Rules
          </button>
          <Link
            href="/commitments?new=true"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
          >
            <Plus className="w-4 h-4" /> New Commitment
          </Link>
        </div>
      </div>

      {/* Bento Grid Top Row (Section 24) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Card 1: My Commitments */}
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-2">My Commitments</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#111827]">{loading ? '…' : stats?.my_commitments ?? 18}</span>
              <span className="text-xs text-indigo-600 font-semibold">{stats?.active_count ?? 12} active</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
            <span>{stats?.waiting_for_evidence ?? 2} awaiting evidence</span>
            <Link href="/commitments" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Due Soon */}
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-2">Due Soon</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-600">{loading ? '…' : stats?.due_soon ?? 4}</span>
              <span className="text-xs text-[#98A2B3]">within 48 hours</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
            <span>{stats?.at_risk ?? 2} at risk of delay</span>
            <span className="text-amber-700 font-medium">Monitoring active</span>
          </div>
        </Card>

        {/* Card 3: Streak & Reliability */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Commitment Streak</p>
              <button
                onClick={() => setShowRulesModal(true)}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                {stats?.reliability_score ?? 94}% Reliability
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-600">{loading ? '…' : stats?.streak_days ?? 18}</span>
              <span className="text-xs text-[#667085]">consecutive days</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
            <span className="text-emerald-700 font-medium">✓ Verified Builder</span>
            <Link href="/profile" className="text-indigo-600 font-bold hover:underline">
              Profile →
            </Link>
          </div>
        </Card>
      </div>

      {/* Bento Middle Row: FOLLOWFLOW AGENT (Clean Bento UI) */}
      <Card className="mb-5 bg-white border border-[#E4E7EC] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#111827]">FOLLOWFLOW AGENT</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700 font-mono uppercase">Autonomous</span>
                </div>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Observe → Reason → Act → Wait → Re-evaluate → Escalate → Complete
              </p>
            </div>
          </div>

          {/* Real-time Agent Counters */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-[#667085]">
              <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
              <span>Watching <strong className="text-[#111827]">{stats?.my_commitments ?? 18}</strong> commitments</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-[#667085]">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span><strong className="text-[#111827]">{stats?.scheduled_followups ?? 3}</strong> follow-ups scheduled</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-[#667085]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span><strong className="text-[#111827]">{stats?.waiting_for_evidence ?? 2}</strong> evidence checks pending</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bento Row 3: Commitment Timeline & At-Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Activity / Timeline Feed (2 cols) */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-[#111827]">Commitment Timeline</h2>
            <Link href="/activity" className="text-xs font-semibold text-indigo-600 hover:underline">
              Live Feed →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : events.length === 0 ? (
            <EmptyState icon="⚡" title="Monitoring telemetry active" description="Autonomous listener standing by. No anomalies detected in current window." />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {events.slice(0, 7).map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F7F8FA] transition-colors">
                  <span className="text-lg flex-shrink-0 mt-0.5">{getEventIcon(e.event_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{e.description || e.title}</p>
                    <p className="text-[10px] text-[#98A2B3]">{getRelativeTime(e.created_at)}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase">
                    {e.actor_type || 'agent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* At-Risk Commitments (1 col) */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-sm text-[#111827]">At-Risk Commitments</h2>
          </div>
          {atRiskList.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#111827]">All commitments on track</p>
              <p className="text-[11px] text-[#667085] mt-1">Agent monitoring active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskList.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/commitments/${c.id}`}
                  className="block p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <p className="text-xs font-bold text-[#111827] truncate mb-1">{c.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-red-700 font-medium">
                    <span>Due {formatDate(c.deadline)}</span>
                    <span className="bg-red-200/60 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                      {c.risk}
                    </span>
                  </div>
                  <ProgressBar value={c.progress} className="mt-2 h-1 bg-red-100" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bento Bottom Row: Recent Verified Commitments (Section 24) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm text-[#111827]">Recent Verified Commitments</h2>
          </div>
          <span className="text-xs text-[#667085]">
            Only verified commitments contribute to reliability score
          </span>
        </div>

        {verifiedList.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="No verified commitments yet"
            description="When evidence is inspected and validated by the agent, achievements appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verifiedList.slice(0, 3).map((v) => (
              <div key={v.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                  </span>
                  <span className="text-[10px] text-[#98A2B3]">{formatDate(v.updated_at)}</span>
                </div>
                <h4 className="font-bold text-xs text-[#111827] line-clamp-2 mb-2">{v.title}</h4>
                {v.evidence_url && (
                  <a
                    href={v.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 font-medium truncate block hover:underline"
                  >
                    Proof: {v.evidence_url}
                  </a>
                )}
                <p className="text-[10px] text-[#667085] mt-1">Verified by FollowFlow Agent</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transparent Scoring Modal (Section 16 & 43) */}
      {showRulesModal && rules && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#111827]">{rules.title}</h3>
              </div>
              <button onClick={() => setShowRulesModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <p className="text-xs text-[#667085] mb-4 leading-relaxed">{rules.summary}</p>

            <div className="space-y-2 mb-4">
              {rules.rules.map((r, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#111827]">{r.event}</p>
                    <p className="text-[10px] text-[#667085]">{r.description}</p>
                  </div>
                  <span className={`font-mono font-bold text-${r.color}-600 bg-white px-2 py-1 rounded border border-[#E4E7EC]`}>
                    {r.delta}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 text-xs text-indigo-900">
              <p className="font-bold mb-1">Formula:</p>
              <p className="font-mono text-[11px]">{rules.formula}</p>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
            >
              Close & Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
