'use client';
import { useEffect, useState } from 'react';
import { getPromises, type Promise_ } from '@/lib/api';
import { StatusBadge, EmptyState, Skeleton } from '@/components/ui/index';
import { formatDate, isOverdue } from '@/lib/utils';
import { User, MessageSquare } from 'lucide-react';

const TABS = ['all', 'waiting', 'fulfilled', 'broken', 'updated'] as const;
const TAB_LABELS: Record<string, string> = { all: 'All', waiting: 'Waiting', fulfilled: 'Fulfilled', broken: 'Missed', updated: 'Updated' };

export default function PromisesPage() {
  const [promises, setPromises] = useState<Promise_[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => { getPromises().then(setPromises).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = promises.filter(p => tab === 'all' || p.status === tab);
  const counts: Record<string, number> = {};
  TABS.forEach(t => { counts[t] = t === 'all' ? promises.length : promises.filter(p => p.status === t).length; });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Promises</h1>
        <p className="text-sm text-[#667085] mt-0.5">AI-detected commitments automatically tracked</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${tab === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-[#667085] border-[#E4E7EC] hover:border-indigo-300'}`}>
            {TAB_LABELS[t]}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? 'bg-indigo-500' : 'bg-[#F7F8FA]'}`}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🤝" title="No promises found" description="Run the demo to see AI-detected commitments" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(p => {
            const overdue = isOverdue(p.deadline) && p.status === 'waiting';
            return (
              <div key={p.id} className={`bg-white rounded-[20px] border p-4 ${overdue ? 'border-red-200' : p.status === 'fulfilled' ? 'border-emerald-200' : 'border-[#E4E7EC]'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">{p.person_name || 'Unknown'}</span>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex items-start gap-2 mb-3">
                  <MessageSquare className="w-3.5 h-3.5 text-[#98A2B3] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#111827] leading-relaxed">{p.commitment}</p>
                </div>

                {p.deadline && (
                  <div className={`text-xs font-medium mb-2 ${overdue ? 'text-red-600' : 'text-[#667085]'}`}>
                    {overdue ? '⚠️ Overdue — ' : '📅 Due '}{formatDate(p.deadline)}
                  </div>
                )}

                {p.evidence_required && (
                  <div className="text-xs text-[#667085] bg-[#F7F8FA] px-2 py-1 rounded-lg mb-2">
                    Evidence: {p.evidence_required}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#98A2B3]">
                  <span>Confidence: {Math.round(p.confidence * 100)}%</span>
                  {p.follow_up_count > 0 && <span>{p.follow_up_count} follow-up(s)</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
