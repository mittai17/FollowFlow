'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getProfile, getScoringRules, getUsers,
  type ProfileData, type ScoringRules, type User
} from '@/lib/api';
import { Card, Skeleton, ProgressBar } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck, CheckCircle2, Award, Flame, Calendar,
  HelpCircle, ExternalLink, X, Lock, Copy, Check,
  Share2, Shield, Layers, Building2, Terminal, CheckSquare
} from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('u') || 'rahulk';

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'commitments' | 'reputation'>('badges');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Selected Badge Modal State (AWS Builder / Credly proof inspector)
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Scoring Rules modal
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<ScoringRules | null>(null);

  async function load(username: string) {
    setLoading(true);
    try {
      const [p, r, usersList] = await Promise.all([
        getProfile(username),
        getScoringRules(),
        getUsers(),
      ]);
      setData(p);
      setRules(r);
      setAllUsers(usersList);
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(usernameParam);
  }, [usernameParam]);

  function copyVerificationHash(hash: string) {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data) return null;

  const { user, score, badges, recent_verified, active_commitments } = data;

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* ── TOP IDENTITY CARD ── */}
      <div className="bg-white rounded-[24px] border border-[#E4E7EC] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#111827]">{user.name}</h1>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  @{user.username || 'rahulk'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Cryptographically Verified
                </span>
              </div>
              <p className="text-xs text-[#475467] font-medium">{user.title}</p>
              <p className="text-xs text-[#667085] leading-relaxed max-w-xl">{user.bio}</p>
            </div>
          </div>

          {/* Right Column: Score Summary & Persona Switcher */}
          <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
            <div className="text-left md:text-right bg-[#F7F8FA] px-5 py-3 rounded-2xl border border-[#E4E7EC] w-full md:w-auto">
              <div className="flex items-center md:justify-end gap-1.5 mb-0.5">
                <span className="text-3xl font-black text-indigo-600">{score.reliability_score}%</span>
              </div>
              <span className="text-xs font-bold text-[#111827] block">Reliability Score</span>
              <button
                onClick={() => setShowRules(true)}
                className="text-[10px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <HelpCircle className="w-3 h-3" /> Scoring breakdown
              </button>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-[#667085]">
              <span className="text-[11px] font-semibold">Inspect user:</span>
              <select
                value={user.username || 'rahulk'}
                onChange={(e) => {
                  window.history.pushState({}, '', `/profile?u=${e.target.value}`);
                  load(e.target.value);
                }}
                className="bg-white border border-[#E4E7EC] rounded-lg text-xs font-mono font-semibold py-1 px-2 text-[#111827] focus:outline-none"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.username}>
                    @{u.username} ({u.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Breakdown Performance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E4E7EC] text-xs">
          <div>
            <span className="text-[#98A2B3] block">Total Commitments</span>
            <span className="font-bold text-base text-[#111827]">{score.total_count}</span>
            <span className="text-[10px] text-[#667085] block">{score.fulfilled_count} fulfilled</span>
          </div>
          <div>
            <span className="text-[#98A2B3] block">Verified With Proof</span>
            <span className="font-bold text-base text-emerald-600">{score.verified_count}</span>
            <span className="text-[10px] text-[#667085] block">{score.verified_rate}% evidence rate</span>
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

      {/* ── SECTION TABS (AWS Builder Badges Style) ── */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('badges')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all flex items-center gap-1.5',
            activeTab === 'badges'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[#667085] hover:bg-[#F7F8FA]'
          )}
        >
          <Award className="w-4 h-4" /> Verified Badges ({badges.length})
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all flex items-center gap-1.5',
            activeTab === 'commitments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[#667085] hover:bg-[#F7F8FA]'
          )}
        >
          <CheckSquare className="w-4 h-4" /> Public Verification Ledger ({recent_verified.length})
        </button>
        <button
          onClick={() => setActiveTab('reputation')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all flex items-center gap-1.5',
            activeTab === 'reputation'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[#667085] hover:bg-[#F7F8FA]'
          )}
        >
          <Shield className="w-4 h-4" /> Governance & Issuer Proof
        </button>
      </div>

      {/* ── TAB CONTENT: VERIFIED BADGES ── */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#667085]">
              Each badge represents cryptographically verified execution issued by AWS Bedrock AgentCore & Strands.
            </p>
            <span className="text-[10px] text-[#98A2B3] font-mono">CREDLY & AWS BUILDER COMPLIANT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b: any, idx: number) => (
              <div
                key={b.id || idx}
                onClick={() => setSelectedBadge(b)}
                className="p-5 rounded-[20px] bg-white border border-[#E4E7EC] hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider">
                        {b.category || 'Autonomous Verification'}
                      </span>
                      <h4 className="font-bold text-sm text-[#111827]">{b.label}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">{b.description}</p>

                {b.skills && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {b.skills.slice(0, 3).map((skill: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-medium bg-[#F7F8FA] border border-[#E4E7EC] text-[#475467] px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {b.skills.length > 3 && (
                      <span className="text-[10px] text-[#98A2B3]">+{b.skills.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-[#98A2B3] font-mono">
                  <span>ID: {b.verification_id || 'AWS-FF-01'}</span>
                  <span className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5">
                    Inspect Proof <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: RECENT VERIFIED LEDGER ── */}
      {activeTab === 'commitments' && (
        <div className="space-y-3">
          <p className="text-xs text-[#667085]">
            Immutable execution record audited by FollowFlow Autonomous Agent loop.
          </p>

          <div className="space-y-2">
            {recent_verified.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ VERIFIED ON-TIME
                    </span>
                    <span className="text-[10px] text-[#98A2B3]">{formatDate(v.updated_at)}</span>
                  </div>
                  <h4 className="font-bold text-[#111827] text-sm">{v.title}</h4>
                  {v.evidence_url && (
                    <a
                      href={v.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-md"
                    >
                      <ExternalLink className="w-3 h-3" /> {v.evidence_url}
                    </a>
                  )}
                </div>

                <Link
                  href={`/commitments/${v.id}`}
                  className="px-3 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] text-[#111827] rounded-lg font-semibold hover:bg-gray-100"
                >
                  Inspect Audit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: GOVERNANCE & ISSUER ── */}
      {activeTab === 'reputation' && (
        <div className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] space-y-4 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-[#111827]">Autonomous Verification Protocol Governance</h3>
          </div>
          <p className="text-[#667085] leading-relaxed">
            FollowFlow operates on a zero-subjectivity protocol. Badges and reliability scores are issued only after automated evidence validation against production integrations (GitHub repository commits, AWS CloudWatch 0-alarm health logs, S3 delivery objects, Notion requirement sign-offs).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E4E7EC] space-y-1">
              <span className="font-bold text-[#111827] block">Runtime Engine</span>
              <span className="text-[#667085]">Amazon Bedrock AgentCore Runtime & Strands Agents SDK v1.55.1</span>
            </div>
            <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E4E7EC] space-y-1">
              <span className="font-bold text-[#111827] block">Consensus Audit</span>
              <span className="text-[#667085]">Immutable append-only events ledger with human approval fallbacks.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── BADGE VERIFICATION PROOF MODAL (AWS Builder Badges Style) ── */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-[#111827]">Verified Credential Details</h3>
              </div>
              <button onClick={() => setSelectedBadge(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#98A2B3] block">Badge Title</span>
                <span className="text-base font-black text-[#111827]">{selectedBadge.label}</span>
              </div>

              <div>
                <span className="text-[#98A2B3] block">Issuing Authority</span>
                <span className="font-bold text-[#111827]">{selectedBadge.issuer}</span>
              </div>

              <div>
                <span className="text-[#98A2B3] block">Verification ID</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedBadge.verification_id}
                </span>
              </div>

              <div>
                <span className="text-[#98A2B3] block">Evidence Cryptographic Hash</span>
                <div className="flex items-center justify-between bg-[#F7F8FA] border border-[#E4E7EC] p-2 rounded-lg font-mono text-[11px] text-[#111827] mt-1 truncate">
                  <span className="truncate mr-2">{selectedBadge.evidence_hash}</span>
                  <button
                    type="button"
                    onClick={() => copyVerificationHash(selectedBadge.evidence_hash)}
                    className="p-1 rounded bg-white border border-[#E4E7EC] hover:bg-gray-50 flex-shrink-0"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#667085]" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[#98A2B3] block">Audit Description</span>
                <p className="text-[#475467] leading-relaxed pt-0.5">{selectedBadge.description}</p>
              </div>

              {selectedBadge.skills && (
                <div>
                  <span className="text-[#98A2B3] block mb-1">Validated Competencies</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBadge.skills.map((s: string, idx: number) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCORING RULES MODAL ── */}
      {showRules && rules && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <h3 className="font-black text-sm text-[#111827]">{rules.title}</h3>
              <button onClick={() => setShowRules(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">{rules.summary}</p>
            <div className="space-y-2 text-xs">
              {rules.rules.map((r, idx) => (
                <div key={idx} className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#111827] block">{r.event}</span>
                    <span className="text-[11px] text-[#667085]">{r.description}</span>
                  </div>
                  <span className="font-bold text-indigo-600 font-mono text-xs">{r.delta}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-80" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
