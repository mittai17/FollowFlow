'use client';
import { useEffect, useState } from 'react';
import { getEvents, type Event_ } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/ui/index';
import { formatDateTime, getEventIcon } from '@/lib/utils';

const FILTERS = ['all', 'agent', 'user', 'document', 'promise', 'email'] as const;

export default function ActivityPage() {
  const [events, setEvents] = useState<Event_[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => getEvents(100).then(setEvents).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); const t = setInterval(load, 6000); return () => clearInterval(t); }, []);

  const filtered = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'agent') return e.actor_type === 'agent';
    if (filter === 'user') return e.actor_type === 'user';
    if (filter === 'document') return e.event_type.includes('document') || e.event_type.includes('verification');
    if (filter === 'promise') return e.event_type.includes('promise') || e.event_type.includes('commitment');
    if (filter === 'email') return e.event_type.includes('email') || e.event_type.includes('followup');
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Activity</h1>
          <p className="text-sm text-[#667085] mt-0.5">Everything the agent and team has done — auto-refreshes every 6s</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">Live</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border capitalize ${filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-[#667085] border-[#E4E7EC] hover:border-indigo-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📜" title="No activity yet" description="Run the demo to generate agent activity" />
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.id} className="flex items-start gap-3 bg-white border border-[#E4E7EC] rounded-xl p-3.5 hover:border-indigo-200 transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#F7F8FA] flex items-center justify-center text-base flex-shrink-0">
                {getEventIcon(e.event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#111827]">{e.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${e.actor_type === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {e.actor_type?.toUpperCase() || 'AGENT'}
                  </span>
                </div>
                {e.description && <p className="text-xs text-[#667085] truncate">{e.description}</p>}
              </div>
              <span className="text-xs text-[#98A2B3] flex-shrink-0">{formatDateTime(e.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
