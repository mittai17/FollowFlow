'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFeed, supportCommitment, type FeedItem } from '@/lib/api';
import { Card, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime } from '@/lib/utils';
import {
  Heart, ShieldCheck, CheckCircle2, Calendar, FileCheck,
  Compass, ArrowRight, User
} from 'lucide-react';

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportedMap, setSupportedMap] = useState<Record<string, boolean>>({});

  async function load() {
    try {
      const data = await getFeed();
      setFeed(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSupport(id: string) {
    if (supportedMap[id]) return;
    try {
      await supportCommitment(id, 'Rahul Kumar');
      setSupportedMap((prev) => ({ ...prev, [id]: true }));
      setFeed((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, support_count: (item.support_count || 0) + 1 } : item
        )
      );
    } catch {}
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Feed Header (Section 18 & 34) */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-2">
          <Compass className="w-3.5 h-3.5 text-cyan-600" />
          Community Commitment Feed
        </div>
        <h1 className="text-2xl font-black text-[#111827]">Accountability Without the Noise</h1>
        <p className="text-sm text-[#667085]">
          A high-signal network built around follow-through, verified execution, and mutual support.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState
          icon="🌐"
          title="No public commitments yet"
          description="Public commitments created by members will appear here."
        />
      ) : (
        <div className="space-y-4">
          {feed.map((item) => {
            const isVerified = item.status === 'VERIFIED';
            const isSupported = supportedMap[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-[20px] border border-[#E4E7EC] p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                {/* Header: User & Status Badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {item.owner_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{item.owner_name}</p>
                      <p className="text-[10px] text-[#98A2B3]">{getRelativeTime(item.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ✓ Commitment Fulfilled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Commitment Title */}
                <h3 className="text-base font-bold text-[#111827] mb-2 leading-snug">
                  "{item.title}"
                </h3>

                {item.description && (
                  <p className="text-xs text-[#667085] line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Evidence Requirement & Deadline Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-[#667085]">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>
                      Evidence:{' '}
                      <strong className="text-[#111827] capitalize">
                        {item.evidence_type || 'Public Proof Artifact'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#667085]">
                    <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                    <span>{item.deadline ? `Due ${formatDate(item.deadline)}` : 'Milestone-based'}</span>
                  </div>
                </div>

                {/* Footer: Support & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleSupport(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSupported
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-[#F7F8FA] text-[#667085] hover:text-indigo-600 hover:bg-indigo-50 border border-[#E4E7EC]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSupported ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    <span>{isSupported ? 'Supported' : 'Support'}</span>
                    <span className="text-[10px] text-[#98A2B3]">({item.support_count || 0})</span>
                  </button>

                  <Link
                    href={`/commitments/${item.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View Commitment <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
