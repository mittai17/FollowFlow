'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCases, type Case } from '@/lib/api';
import { StatusBadge, RiskBadge, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { Plus, Search, ArrowRight } from 'lucide-react';

const TABS = ['all', 'active', 'waiting', 'at_risk', 'completed'] as const;
const TAB_LABELS: Record<string, string> = { all: 'All', active: 'Active', waiting: 'Waiting', at_risk: 'At Risk', completed: 'Completed' };

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { getCases().then(setCases).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = cases
    .filter(c => tab === 'all' || c.status === tab || (tab === 'at_risk' && (c.risk === 'high' || c.risk === 'critical')))
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Cases</h1>
          <p className="text-sm text-[#667085] mt-0.5">{cases.length} total workflow cases</p>
        </div>
        <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New via Demo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-white text-[#111827] shadow-sm' : 'text-[#667085] hover:text-[#111827]'}`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A2B3]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E7EC] rounded-xl text-sm text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#E4E7EC] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📋" title="No cases found" description={search ? 'Try adjusting your search' : 'Run the demo to create cases'} />
        ) : (
          <table className="w-full">
            <thead className="border-b border-[#E4E7EC] bg-[#F7F8FA]">
              <tr>
                {['Case', 'Progress', 'Status', 'Risk', 'Deadline', 'Updated', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#667085] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-[#111827]">{c.title}</p>
                    {c.case_number && <p className="text-xs text-[#98A2B3]">{c.case_number}</p>}
                  </td>
                  <td className="px-4 py-3.5 w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={c.progress} className="flex-1" />
                      <span className="text-xs text-[#667085] w-8">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3.5"><RiskBadge risk={c.risk} /></td>
                  <td className="px-4 py-3.5 text-sm text-[#667085]">{formatDate(c.deadline)}</td>
                  <td className="px-4 py-3.5 text-xs text-[#98A2B3]">{getRelativeTime(c.updated_at)}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/cases/${c.id}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
