'use client';
import { useEffect, useState } from 'react';
import { getDocuments, type Document_ } from '@/lib/api';
import { StatusBadge, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

function DocIcon({ type }: { type?: string }) {
  const t = (type || '').toLowerCase();
  if (t.includes('bank')) return <span className="text-xl">🏦</span>;
  if (t.includes('insurance')) return <span className="text-xl">🛡️</span>;
  if (t.includes('tax')) return <span className="text-xl">📊</span>;
  if (t.includes('agreement') || t.includes('contract')) return <span className="text-xl">📜</span>;
  if (t.includes('registration')) return <span className="text-xl">🏢</span>;
  return <FileText className="w-5 h-5 text-[#667085]" />;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document_[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDocuments().then(setDocs).catch(() => {}).finally(() => setLoading(false)); }, []);

  const verified = docs.filter(d => d.verification_status === 'verified').length;
  const pending = docs.filter(d => d.verification_status === 'pending').length;
  const rejected = docs.filter(d => d.verification_status === 'rejected').length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Documents</h1>
        <p className="text-sm text-[#667085] mt-0.5">Evidence submitted and verified by the agent</p>
      </div>

      {/* Summary */}
      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div><p className="text-2xl font-bold text-emerald-700">{verified}</p><p className="text-xs text-emerald-600">Verified</p></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            <div><p className="text-2xl font-bold text-amber-700">{pending}</p><p className="text-xs text-amber-600">Pending</p></div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div><p className="text-2xl font-bold text-red-700">{rejected}</p><p className="text-xs text-red-600">Rejected</p></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[20px] border border-[#E4E7EC] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : docs.length === 0 ? (
          <EmptyState icon="📄" title="No documents yet" description="Verified documents and proof artifacts will appear here as team commitments progress." />
        ) : (
          <table className="w-full">
            <thead className="border-b border-[#E4E7EC] bg-[#F7F8FA]">
              <tr>
                {['Document', 'Type', 'Verification', 'Notes', 'Uploaded', 'Verified'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#667085] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <DocIcon type={d.document_type} />
                      <span className="text-sm font-medium text-[#111827]">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#667085]">{d.document_type || '—'}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={d.verification_status} /></td>
                  <td className="px-4 py-3.5 text-xs text-[#667085] max-w-xs truncate">{d.verification_notes || '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-[#98A2B3]">{getRelativeTime(d.uploaded_at)}</td>
                  <td className="px-4 py-3.5 text-xs text-[#98A2B3]">{d.verified_at ? formatDate(d.verified_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
