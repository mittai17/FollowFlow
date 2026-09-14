'use client';
import { useEffect, useState } from 'react';
import { getApprovals, decideApproval, type Approval } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

function ApprovalCard({ approval, onDecide }: { approval: Approval; onDecide: () => void }) {
  const [loading, setLoading] = useState(false);
  const [decided, setDecided] = useState(false);
  const [chosenOption, setChosenOption] = useState('');

  async function decide(option: string) {
    setLoading(true);
    try {
      await decideApproval(approval.id, option);
      setDecided(true);
      setChosenOption(option);
      setTimeout(onDecide, 1500);
    } catch {}
    setLoading(false);
  }

  if (decided) return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">Decision recorded</p>
          <p className="text-sm text-emerald-700">"{chosenOption}" — Agent is resuming the workflow</p>
        </div>
      </div>
    </div>
  );

  const caseTitle = (approval as any).cases?.title || 'Case';
  const caseNum = (approval as any).cases?.case_number || '';

  return (
    <div className="bg-white border border-amber-200 rounded-[20px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Human Decision Required</span>
          </div>
          <p className="font-bold text-[#111827] text-lg">{caseTitle}</p>
          {caseNum && <p className="text-xs text-[#98A2B3]">{caseNum}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-[#667085]">Agent Confidence</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${approval.confidence * 100}%` }} />
            </div>
            <span className="text-sm font-bold text-indigo-600">{Math.round(approval.confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Why stopped */}
      <div className="mb-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5">⛔ Why I stopped</p>
        <p className="text-sm text-red-900 leading-relaxed">{approval.reason}</p>
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1.5">💡 My recommendation</p>
        <p className="text-sm text-indigo-900 leading-relaxed">{approval.recommendation}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {approval.options.map((opt: string, i: number) => (
          <button key={i} onClick={() => decide(opt)} disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
              i === 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' :
              i === approval.options.length - 1 ? 'border-2 border-red-300 text-red-700 hover:bg-red-50' :
              'border border-[#E4E7EC] text-[#111827] hover:bg-[#F7F8FA]'
            }`}>
            {loading ? '…' : opt}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#98A2B3] mt-3">Requested {formatDate(approval.created_at)}</p>
    </div>
  );
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => getApprovals('pending').then(setApprovals).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Approvals & Ambiguity Interventions</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            The agent only surfaces here when it genuinely needs a human decision (Ambiguity Stop Rule).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ambiguity Stop Threshold: 85%
          </span>
        </div>
      </div>

      {approvals.length > 0 ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-sm font-semibold text-amber-900">
                {approvals.length} decision{approvals.length !== 1 ? 's' : ''} require executive review
              </p>
            </div>
            <button
              onClick={async () => {
                for (const a of approvals) {
                  try {
                    await decideApproval(a.id, a.recommendation || a.options[0]);
                  } catch {}
                }
                load();
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Batch Approve Recommendations ({approvals.length})
            </button>
          </div>

          <div className="space-y-4">
            {approvals.map((a) => (
              <ApprovalCard key={a.id} approval={a} onDecide={load} />
            ))}
          </div>
        </>
      ) : loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : (
        <div className="p-8 bg-white border border-[#E4E7EC] rounded-[24px] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-xl">
            ✓
          </div>
          <h3 className="font-bold text-base text-[#111827]">Zero Interventions Pending</h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
            The autonomous engine is running with high certainty (&gt;85% confidence). No manual approval is required at this time.
          </p>
          <div className="pt-2 text-[11px] font-mono text-indigo-600">
            Escalation Dampening: Active · False-Positive Filter: Strict
          </div>
        </div>
      )}
    </div>
  );
}
