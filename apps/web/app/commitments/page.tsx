'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCommitments, createCommitment, detectCommitmentAI,
  type Commitment, type CreateCommitmentInput, type DetectedCommitmentResponse
} from '@/lib/api';
import { Card, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime, cn } from '@/lib/utils';
import {
  Plus, Search, Sparkles, Brain, ShieldCheck, Lock, Globe,
  Users, CheckCircle2, AlertTriangle, ArrowRight, X, Calendar, FileText
} from 'lucide-react';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'private', label: 'Private' },
  { key: 'shared', label: 'Shared' },
  { key: 'public', label: 'Public' },
  { key: 'active', label: 'Active' },
  { key: 'verified', label: 'Verified' },
  { key: 'at_risk', label: 'At Risk' },
  { key: 'missed', label: 'Missed' },
];

function CommitmentsContent() {
  const searchParams = useSearchParams();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Creation modal state
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai'>('ai');
  const [aiText, setAiText] = useState('I will publish my open-source AI project on GitHub by Friday and verify with repository URL.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDetection, setAiDetection] = useState<DetectedCommitmentResponse | null>(null);

  // Manual form state
  const [formData, setFormData] = useState<CreateCommitmentInput>({
    title: '',
    description: '',
    deadline: '',
    visibility: 'private',
    evidence_type: 'github_repo',
    evidence_url: '',
  });

  async function load() {
    setLoading(true);
    try {
      const data = await getCommitments();
      setCommitments(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (searchParams.get('new') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const filtered = commitments.filter((c) => {
    if (tab === 'private' && c.visibility !== 'private') return false;
    if (tab === 'shared' && c.visibility !== 'shared') return false;
    if (tab === 'public' && c.visibility !== 'public') return false;
    if (tab === 'active' && !['ACTIVE', 'UPCOMING', 'DUE_SOON', 'DUE_TODAY', 'WAITING_FOR_EVIDENCE'].includes(c.status)) return false;
    if (tab === 'verified' && c.status !== 'VERIFIED') return false;
    if (tab === 'at_risk' && c.risk !== 'high' && c.risk !== 'critical' && c.status !== 'AT_RISK') return false;
    if (tab === 'missed' && c.status !== 'MISSED') return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  async function handleAIDetect() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const res = await detectCommitmentAI(aiText);
      setAiDetection(res);
    } catch {}
    setAiLoading(false);
  }

  async function handleConfirmDetected() {
    if (!aiDetection || !aiDetection.commitments || aiDetection.commitments.length === 0) return;
    const first = aiDetection.commitments[0];
    try {
      await createCommitment({
        title: first.title,
        description: `Detected from: "${aiText}"`,
        deadline: first.deadline && !isNaN(Date.parse(first.deadline)) ? first.deadline : undefined,
        visibility: first.visibility || 'private',
        evidence_type: first.evidence_type || 'url',
      });
      setShowModal(false);
      setAiDetection(null);
      load();
    } catch {}
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      await createCommitment(formData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        visibility: 'private',
        evidence_type: 'github_repo',
        evidence_url: '',
      });
      load();
    } catch {}
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">My Commitments</h1>
          <p className="text-sm text-[#667085]">
            Structured workflows backed by autonomous deadline tracking and evidence verification.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setAiDetection(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Make a Commitment
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex bg-white border border-[#E4E7EC] rounded-xl p-1 overflow-x-auto w-full md:w-auto">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                tab === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#667085] hover:text-[#111827]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commitments…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Commitments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No commitments found"
          description={search ? 'Try clearing your search query' : 'Create a commitment manually or let the AI extract one.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isVerified = c.status === 'VERIFIED';
            const isAtRisk = c.risk === 'high' || c.risk === 'critical' || c.status === 'AT_RISK';

            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-[20px] border p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-200',
                  isVerified ? 'border-emerald-200 bg-emerald-50/20' : isAtRisk ? 'border-red-200 bg-red-50/20' : 'border-[#E4E7EC]'
                )}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAtRisk
                          ? 'bg-red-100 text-red-800'
                          : c.status === 'RESCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-800'
                      )}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-[#667085]">
                      {c.visibility === 'public' ? (
                        <Globe className="w-3 h-3 text-cyan-600" />
                      ) : c.visibility === 'shared' ? (
                        <Users className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <Lock className="w-3 h-3 text-[#98A2B3]" />
                      )}
                      <span className="capitalize">{c.visibility}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-[#111827] line-clamp-2 mb-1.5">{c.title}</h3>
                  {c.description && <p className="text-xs text-[#667085] line-clamp-2 mb-3">{c.description}</p>}
                </div>

                {/* Bottom Metadata & Progress */}
                <div className="mt-3 pt-3 border-t border-[#E4E7EC] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#667085]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#98A2B3]" />
                      {c.deadline ? formatDate(c.deadline) : 'No due date'}
                    </span>
                    <span className="font-medium text-[#111827]">{c.progress}%</span>
                  </div>

                  <ProgressBar value={c.progress} className="h-1" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#98A2B3] truncate max-w-[150px]">
                      {c.evidence_type ? `Proof: ${c.evidence_type}` : 'No evidence set'}
                    </span>
                    <Link
                      href={`/commitments/${c.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      Detail <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal (Sections 6, 32, 33) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-[#111827]">Make a Commitment</h3>
                <p className="text-xs text-[#667085]">Tracked, monitored, and verified by FollowFlow Agent.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            {/* Toggle Creation Method */}
            <div className="flex bg-[#F7F8FA] border border-[#E4E7EC] p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setCreationMethod('ai')}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                  creationMethod === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#667085]'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" /> Method B — AI Natural Language
              </button>
              <button
                type="button"
                onClick={() => setCreationMethod('manual')}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                  creationMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#667085]'
                )}
              >
                <FileText className="w-3.5 h-3.5" /> Method A — Manual Form
              </button>
            </div>

            {creationMethod === 'ai' ? (
              /* Method B: AI Natural Language Detection (Section 6 & 33) */
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#111827] block mb-1.5">
                    Paste what you or someone else promised:
                  </label>
                  <textarea
                    rows={3}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder="e.g. I will publish the repository by Friday and submit the hackathon demo link."
                    className="w-full p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAIDetect}
                  disabled={aiLoading}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Brain className="w-4 h-4" />
                  {aiLoading ? 'Agent Extracting Commitment…' : 'Extract Commitment with Agent'}
                </button>

                {aiDetection && aiDetection.commitments && aiDetection.commitments.length > 0 && (
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> I detected a commitment
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600">
                        {Math.round(aiDetection.confidence * 100)}% Confidence
                      </span>
                    </div>

                    {aiDetection.commitments.map((com, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100 text-xs space-y-1">
                        <p className="font-bold text-[#111827]">{com.title}</p>
                        <p className="text-[#667085]">
                          <strong>By:</strong> {com.deadline || 'Next milestone'} · <strong>Proof:</strong>{' '}
                          {com.evidence_required || 'Link/document'}
                        </p>
                      </div>
                    ))}

                    {aiDetection.dependency && (
                      <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded border border-purple-100">
                        🔗 <strong>Dependency:</strong> {aiDetection.dependency}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmDetected}
                        className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                      >
                        Create Commitment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            title: aiDetection.commitments[0].title,
                            description: `Detected from: "${aiText}"`,
                            deadline: '',
                            visibility: 'private',
                            evidence_type: aiDetection.commitments[0].evidence_type || 'url',
                            evidence_url: '',
                          });
                          setCreationMethod('manual');
                        }}
                        className="px-3 py-2 bg-white border border-[#E4E7EC] text-xs font-semibold rounded-lg hover:bg-gray-50"
                      >
                        Edit in Form
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Method A: Manual Form (Section 6 & 32) */
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#111827] block mb-1">
                    What are you committing to? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Publish open-source AI agent project"
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111827] block mb-1">Description / Context</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide additional details or requirements"
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#111827] block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111827] block mb-1">Proof / Evidence Type</label>
                    <select
                      value={formData.evidence_type}
                      onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="github_repo">GitHub Repository</option>
                      <option value="document">PDF / Document</option>
                      <option value="url">Public URL / Post</option>
                      <option value="signed_pdf">Signed Agreement</option>
                      <option value="screenshot">Screenshot / Proof</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111827] block mb-1">
                    Visibility (Privacy Model — Section 17)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'private', label: 'Private', desc: 'Only you', icon: Lock },
                      { id: 'shared', label: 'Shared', desc: 'Invited team', icon: Users },
                      { id: 'public', label: 'Public', desc: 'Feed & profile', icon: Globe },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, visibility: m.id })}
                        className={cn(
                          'p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all',
                          formData.visibility === m.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                            : 'border-[#E4E7EC] bg-white text-[#667085]'
                        )}
                      >
                        <m.icon className="w-3.5 h-3.5 mb-1 text-indigo-600" />
                        <span className="font-bold text-xs">{m.label}</span>
                        <span className="text-[10px] text-[#98A2B3]">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors"
                  >
                    Create Commitment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommitmentsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading commitments…</div>}>
      <CommitmentsContent />
    </Suspense>
  );
}
