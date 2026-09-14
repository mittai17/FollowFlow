'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile, getScoringRules, type ProfileData, type ScoringRules } from '@/lib/api';
import { Card, Skeleton, ProgressBar } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck, CheckCircle2, Award, Flame, Calendar,
  HelpCircle, ExternalLink, X, Lock
} from 'lucide-react';

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<ScoringRules | null>(null);

  async function load() {
    try {
      const [p, r] = await Promise.all([getProfile('Rahul Kumar'), getScoringRules()]);
      setData(p);
      setRules(r);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-56" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  const { user, score, badges, recent_verified, active_commitments } = data;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header Profile Card (Sections 21, 36, 51) */}
      <div className="bg-white rounded-[24px] border border-[#E4E7EC] p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-100">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#111827]">{user.name}</h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Member
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">{user.title}</p>
              <p className="text-xs text-[#98A2B3] mt-1 max-w-md">{user.bio}</p>
            </div>
          </div>

          {/* Reliability Score Dial */}
          <div className="text-center md:text-right bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-center md:justify-end gap-1 mb-1">
              <span className="text-4xl font-black text-indigo-600">{score.reliability_score}%</span>
            </div>
            <p className="text-xs font-bold text-[#111827]">Commitment Reliability</p>
            <button
              onClick={() => setShowRules(true)}
              className="text-[10px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
            >
              <HelpCircle className="w-3 h-3" /> How is this calculated?
            </button>
          </div>
        </div>

        {/* Breakdown Stats (Section 15) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E4E7EC] text-xs">
          <div>
            <span className="text-[#98A2B3] block">Total Commitments</span>
            <span className="font-bold text-base text-[#111827]">{score.total_count}</span>
            <span className="text-[10px] text-[#667085] block">{score.fulfilled_count} fulfilled</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Verified With Proof</span>
            <span className="font-bold text-base text-emerald-600">{score.verified_count}</span>
            <span className="text-[10px] text-[#667085] block">{score.verified_rate}% rate</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Active Streak</span>
            <span className="font-bold text-base text-amber-600 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> {score.streak_days} days
            </span>
            <span className="text-[10px] text-[#667085] block">consecutive follow-through</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Consistency</span>
            <span className="font-bold text-base text-purple-600">{score.consistency_rate}%</span>
            <span className="text-[10px] text-[#667085] block">on-time execution</span>
          </div>
        </div>
      </div>

      {/* Badges Section (Section 22) */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">Earned Trust Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {badges.map((b, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E4E7EC] shadow-sm flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-xs text-[#111827]">{b.label}</p>
                <p className="text-[10px] text-[#667085] mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Verified Achievements (Section 13 & 51) */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-[#111827]">Recent Verified Achievements</h3>
          </div>
          <span className="text-[10px] text-[#98A2B3] font-mono">VERIFIED BY AGENT</span>
        </div>

        <div className="space-y-2">
          {recent_verified.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ✓ VERIFIED
                  </span>
                  <span className="text-[10px] text-[#98A2B3]">{formatDate(v.updated_at)}</span>
                </div>
                <h4 className="font-bold text-[#111827] text-sm">{v.title}</h4>
                {v.evidence_url && (
                  <a
                    href={v.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 font-medium hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Proof: {v.evidence_url} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                +1.0 Trust
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice Card (Section 17) */}
      <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E4E7EC] flex items-center gap-3 text-xs text-[#667085]">
        <Lock className="w-4 h-4 text-[#98A2B3] flex-shrink-0" />
        <span>
          Private commitments and unverified internal deliverables are strictly confidential and are never displayed on your public profile or community feed.
        </span>
      </div>

      {/* Transparent Scoring Modal */}
      {showRules && rules && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#111827]">{rules.title}</h3>
              <button onClick={() => setShowRules(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <p className="text-xs text-[#667085] mb-4">{rules.summary}</p>

            <div className="space-y-2 mb-4">
              {rules.rules.map((r, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#111827]">{r.event}</p>
                    <p className="text-[10px] text-[#667085]">{r.description}</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-[#E4E7EC]">
                    {r.delta}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
