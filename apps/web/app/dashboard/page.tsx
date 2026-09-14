'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStats, getCases, getEvents, getApprovals, type DashboardStats, type Case, type Event_ } from '@/lib/api';
import { Card, StatusBadge, RiskBadge, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { getRelativeTime, getEventIcon, formatDate } from '@/lib/utils';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, ArrowRight, Zap } from 'lucide-react';

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-medium text-[#667085] uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[#98A2B3]">{sub}</p>}
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [events, setEvents] = useState<Event_[]>([]);
  const [approvalCount, setApprovalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [s, c, e, a] = await Promise.all([
        getStats(), getCases(), getEvents(20), getApprovals('pending')
      ]);
      setStats(s); setCases(c); setEvents(e); setApprovalCount(a.length);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  const atRisk = cases.filter(c => c.risk === 'high' || c.risk === 'critical');
  const waiting = cases.filter(c => c.status === 'waiting');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Operations Dashboard</h1>
          <p className="text-sm text-[#667085] mt-0.5">FollowFlow is monitoring your workflows autonomously</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">Agent Online</span>
          </div>
          <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Zap className="w-3.5 h-3.5" /> Run Demo
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </>
        ) : (
          <>
            <StatCard label="Active Cases" value={stats?.active_cases ?? 0} sub="being tracked" color="text-indigo-600" />
            <StatCard label="Waiting" value={stats?.waiting_cases ?? 0} sub="on response" color="text-amber-600" />
            <StatCard label="At Risk" value={stats?.at_risk_cases ?? 0} sub="needs attention" color="text-red-600" />
            <StatCard label="Decisions Needed" value={approvalCount} sub="human required" color="text-purple-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Activity Feed - spans 2 cols */}
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#111827] text-sm">Agent Activity</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#667085]">
              <RefreshCw className="w-3 h-3" /> Live
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : events.length === 0 ? (
            <EmptyState icon="🤖" title="Agent is ready" description="Run the demo to see live activity" />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.slice(0, 10).map(e => (
                <div key={e.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F7F8FA] transition-colors">
                  <span className="text-lg mt-0.5 flex-shrink-0">{getEventIcon(e.event_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{e.title}</p>
                    {e.description && <p className="text-xs text-[#667085] truncate">{e.description}</p>}
                  </div>
                  <span className="text-[10px] text-[#98A2B3] flex-shrink-0">{getRelativeTime(e.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Stats Column */}
        <div className="space-y-4">
          <Card>
            <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-2">Promises Tracked</p>
            <p className="text-3xl font-bold text-indigo-600">{stats?.promises_tracked ?? 0}</p>
            <p className="text-xs text-[#98A2B3] mt-0.5">AI-detected commitments</p>
          </Card>
          <Card>
            <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-2">Docs Verified</p>
            <p className="text-3xl font-bold text-emerald-600">{stats?.documents_verified ?? 0}</p>
            <p className="text-xs text-[#98A2B3] mt-0.5">Evidence validated</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Needs Attention */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-[#111827] text-sm">Needs Attention</h2>
          </div>
          {atRisk.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">All cases on track</span>
            </div>
          ) : (
            <div className="space-y-2">
              {atRisk.slice(0, 4).map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F8FA] transition-colors">
                  <RiskBadge risk={c.risk} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{c.title}</p>
                    <ProgressBar value={c.progress} className="mt-1" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Waiting for Response */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-[#111827] text-sm">Waiting for Response</h2>
          </div>
          {waiting.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-[#667085]">
              <span className="text-sm">No cases waiting</span>
            </div>
          ) : (
            <div className="space-y-2">
              {waiting.slice(0, 4).map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F8FA] transition-colors">
                  <StatusBadge status={c.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{c.title}</p>
                    <p className="text-xs text-[#667085]">Due {formatDate(c.deadline)}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
