'use client';
import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCommitments, createCommitment, uploadCommitmentFile,
  connectGitHubRepo, guideCommitmentAI,
  type Commitment, type CreateCommitmentInput
} from '@/lib/api';
import { Card, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime, cn } from '@/lib/utils';
import {
  Plus, Search, Sparkles, Brain, ShieldCheck, Lock, Globe,
  Users, CheckCircle2, AlertTriangle, ArrowRight, X, Calendar,
  FileText, Github, UploadCloud, Paperclip, Building2, Briefcase,
  UserCheck, Check, ExternalLink, HelpCircle, RefreshCw
} from 'lucide-react';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'individual', label: 'Individual' },
  { key: 'team', label: 'Team' },
  { key: 'active', label: 'Active' },
  { key: 'verified', label: 'Verified' },
  { key: 'at_risk', label: 'At Risk' },
  { key: 'public', label: 'Public' },
];

const ORG_OPTIONS = [
  'FollowFlow Labs',
  'Acme Systems Inc',
  'Starlight Autonomous AI',
];

const ROLE_OPTIONS = [
  'Lead Engineer',
  'Product Manager',
  'Operations Lead',
  'Security Auditor',
  'Designer',
  'Data Scientist',
];

function CommitmentsContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Method toggle: 'manual' or 'ai'
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai'>('manual');

  // Form State
  const [formData, setFormData] = useState<CreateCommitmentInput>({
    title: '',
    description: '',
    deadline: '',
    visibility: 'private',
    evidence_type: 'github_repo',
    evidence_url: '',
    owner_name: 'Rahul Kumar',
    scope: 'individual',
    organization_name: 'FollowFlow Labs',
    role: 'Lead Engineer',
    team_members: [],
    github_repo: '',
    file_url: '',
    file_name: '',
    file_size: '',
  });

  const [teamMemberInput, setTeamMemberInput] = useState('');

  // GitHub Connector State
  const [githubInput, setGithubInput] = useState('mittai17/followflow');
  const [githubLoading, setGithubLoading] = useState(false);
  const [connectedRepo, setConnectedRepo] = useState<any>(null);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; url: string } | null>(null);

  // AI Guided Creation State
  const [aiPrompt, setAiPrompt] = useState('Deploy our new authentication service with zero-trust token rotation and 100% test coverage.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBlueprint, setAiBlueprint] = useState<any>(null);

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

  // Date Preset Handlers
  function applyDatePreset(preset: 'today' | 'tomorrow' | 'friday' | 'week' | 'month') {
    const now = new Date();
    if (preset === 'today') {
      now.setHours(18, 0, 0, 0);
    } else if (preset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(18, 0, 0, 0);
    } else if (preset === 'friday') {
      const day = now.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      now.setDate(now.getDate() + diff);
      now.setHours(18, 0, 0, 0);
    } else if (preset === 'week') {
      now.setDate(now.getDate() + 7);
      now.setHours(18, 0, 0, 0);
    } else if (preset === 'month') {
      now.setDate(now.getDate() + 30);
      now.setHours(18, 0, 0, 0);
    }
    // Format to YYYY-MM-DDTHH:mm
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, deadline: localIso }));
  }

  // GitHub Connector Handler
  async function handleConnectGitHub() {
    if (!githubInput.trim()) return;
    setGithubLoading(true);
    try {
      const info = await connectGitHubRepo(githubInput);
      setConnectedRepo(info);
      setFormData((prev) => ({
        ...prev,
        github_repo: info.full_name,
        evidence_url: info.url,
        evidence_type: 'github_repo',
      }));
    } catch (err: any) {
      alert(`GitHub connection error: ${err.message}`);
    }
    setGithubLoading(false);
  }

  // File Upload Handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const res = await uploadCommitmentFile(file);
      setUploadedFile({ name: res.file_name, size: res.file_size, url: res.url });
      setFormData((prev) => ({
        ...prev,
        file_url: res.url,
        file_name: res.file_name,
        file_size: res.file_size,
        evidence_url: res.url,
        evidence_type: 'document',
      }));
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
    setUploadingFile(false);
  }

  // Add Team Member tag
  function addTeamMember() {
    if (!teamMemberInput.trim()) return;
    const current = formData.team_members || [];
    if (!current.includes(teamMemberInput.trim())) {
      setFormData({ ...formData, team_members: [...current, teamMemberInput.trim()] });
    }
    setTeamMemberInput('');
  }

  function removeTeamMember(name: string) {
    const current = formData.team_members || [];
    setFormData({ ...formData, team_members: current.filter((m) => m !== name) });
  }

  // AI Guided Creation Handler
  async function handleRunAIGuide() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const blueprint = await guideCommitmentAI(
        aiPrompt,
        formData.scope,
        formData.organization_name,
        formData.role
      );
      setAiBlueprint(blueprint);
    } catch {}
    setAiLoading(false);
  }

  function applyAIToForm(blueprint: any) {
    setFormData((prev) => ({
      ...prev,
      title: blueprint.title || prev.title,
      description: blueprint.description || prev.description,
      deadline: blueprint.suggested_deadline ? `${blueprint.suggested_deadline}T18:00` : prev.deadline,
      evidence_type: blueprint.evidence_type || prev.evidence_type,
      visibility: blueprint.visibility || prev.visibility,
    }));
    setCreationMethod('manual');
  }

  // Form Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      await createCommitment({
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      });
      setShowModal(false);
      setConnectedRepo(null);
      setUploadedFile(null);
      setAiBlueprint(null);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        visibility: 'private',
        evidence_type: 'github_repo',
        evidence_url: '',
        owner_name: 'Rahul Kumar',
        scope: 'individual',
        organization_name: 'FollowFlow Labs',
        role: 'Lead Engineer',
        team_members: [],
        github_repo: '',
        file_url: '',
        file_name: '',
        file_size: '',
      });
      load();
    } catch (err: any) {
      alert(`Error creating commitment: ${err.message}`);
    }
  }

  const filtered = commitments.filter((c) => {
    if (tab === 'individual' && c.scope === 'team') return false;
    if (tab === 'team' && c.scope !== 'team') return false;
    if (tab === 'active' && !['ACTIVE', 'UPCOMING', 'DUE_SOON', 'DUE_TODAY', 'WAITING_FOR_EVIDENCE'].includes(c.status)) return false;
    if (tab === 'verified' && c.status !== 'VERIFIED') return false;
    if (tab === 'at_risk' && c.risk !== 'high' && c.risk !== 'critical' && c.status !== 'AT_RISK') return false;
    if (tab === 'public' && c.visibility !== 'public') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.organization_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Workflows & SLAs
            </span>
            <span className="text-xs text-[#98A2B3]">· Individual & Team Accountability</span>
          </div>
          <h1 className="text-2xl font-black text-[#111827]">Commitment Management</h1>
          <p className="text-xs sm:text-sm text-[#667085]">
            Set structured deliverables with verifiable proof, assigned roles, and autonomous tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Make a Commitment
        </button>
      </div>

      {/* Filter Tabs & Search */}
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
            placeholder="Search commitments or orgs…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Commitment Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No commitments matching your filter"
          description={search ? 'Try a different search keyword' : 'Create an individual or team commitment.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isVerified = c.status === 'VERIFIED';
            const isTeam = c.scope === 'team';

            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-[20px] border p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-200',
                  isVerified ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#E4E7EC]'
                )}
              >
                <div>
                  {/* Top Scope & Role Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1',
                          isTeam ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {isTeam ? <Users className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                        {c.scope || 'individual'}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                        {c.organization_name || 'FollowFlow'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-[#111827] line-clamp-2 mb-1">{c.title}</h3>
                  <p className="text-xs text-[#667085] line-clamp-2 mb-3">
                    {c.description || `${c.role || 'Contributor'} commitment at ${c.organization_name || 'FollowFlow'}`}
                  </p>

                  {/* Attached Integrations (GitHub & Files) */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {c.github_repo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-mono">
                        <Github className="w-3 h-3" /> {c.github_repo}
                      </span>
                    )}
                    {c.file_name && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">
                        <Paperclip className="w-3 h-3" /> {c.file_name} ({c.file_size})
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="mt-2 pt-3 border-t border-[#E4E7EC] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#667085]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                      {c.deadline ? formatDate(c.deadline) : 'Ongoing'}
                    </span>
                    <span className="font-bold text-[#111827]">{c.progress}%</span>
                  </div>

                  <ProgressBar value={c.progress} className="h-1" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#667085]">
                      Role: <strong>{c.role || 'Lead'}</strong>
                    </span>
                    <Link
                      href={`/commitments/${c.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE COMMITMENT MODAL (Full Specifications) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl border border-[#E4E7EC] my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] mb-5">
              <div>
                <h3 className="text-lg font-black text-[#111827]">Create a Tracked Commitment</h3>
                <p className="text-xs text-[#667085]">Configure scope, organizational roles, deliverables, and proof.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#667085]" />
              </button>
            </div>

            {/* Creation Method Toggle */}
            <div className="grid grid-cols-2 bg-[#F7F8FA] border border-[#E4E7EC] p-1 rounded-xl mb-5 text-xs">
              <button
                type="button"
                onClick={() => setCreationMethod('manual')}
                className={cn(
                  'py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all',
                  creationMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#667085]'
                )}
              >
                <FileText className="w-3.5 h-3.5" /> Structured Form & Proof
              </button>
              <button
                type="button"
                onClick={() => setCreationMethod('ai')}
                className={cn(
                  'py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all',
                  creationMethod === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#667085]'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" /> Guided AI Assistant
              </button>
            </div>

            {creationMethod === 'manual' ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 1. Scope: Individual vs Team */}
                <div>
                  <label className="font-bold text-[#111827] block mb-1.5">Commitment Scope</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scope: 'individual' })}
                      className={cn(
                        'p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all',
                        formData.scope === 'individual'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                          : 'border-[#E4E7EC] bg-white text-[#667085]'
                      )}
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-xs">Individual Commitment</span>
                        <span className="text-[10px] text-[#667085] leading-tight block">
                          Personal follow-through, adds to personal reliability rating & streak.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scope: 'team' })}
                      className={cn(
                        'p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all',
                        formData.scope === 'team'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                          : 'border-[#E4E7EC] bg-white text-[#667085]'
                      )}
                    >
                      <Users className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-xs">Team Commitment</span>
                        <span className="text-[10px] text-[#667085] leading-tight block">
                          Collaborative deliverable with shared SLA across organization members.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Organization & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#111827] block mb-1">
                      Organization
                    </label>
                    <select
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {ORG_OPTIONS.map((org) => (
                        <option key={org} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#111827] block mb-1">
                      Your Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team Members Tagging (Visible if scope is Team) */}
                {formData.scope === 'team' && (
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                    <label className="font-bold text-purple-900 block">
                      Team Members / Collaborators
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={teamMemberInput}
                        onChange={(e) => setTeamMemberInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTeamMember();
                          }
                        }}
                        placeholder="Add member name (e.g. Ananya Sharma, Arjun Patel)"
                        className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>

                    {formData.team_members && formData.team_members.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.team_members.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 bg-white border border-purple-200 px-2 py-0.5 rounded-md text-[11px] text-purple-900 font-medium"
                          >
                            {m}
                            <button
                              type="button"
                              onClick={() => removeTeamMember(m)}
                              className="text-purple-400 hover:text-red-500 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Title & Description */}
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    What will be delivered? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Deploy zero-trust authentication service to staging cluster"
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#111827] block mb-1">Scope & Acceptance Criteria</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe specific milestones, deliverables, and requirements for the agent to monitor."
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                {/* 4. Date Picker with Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#111827]">Deadline & Schedule</label>
                    <span className="text-[10px] text-[#667085]">Quick presets:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      { key: 'today', label: 'Today 6 PM' },
                      { key: 'tomorrow', label: 'Tomorrow EOD' },
                      { key: 'friday', label: 'This Friday' },
                      { key: 'week', label: 'In 1 Week' },
                      { key: 'month', label: 'In 30 Days' },
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyDatePreset(p.key as any)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-[#4B5563] rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* 5. GitHub Repository Connector */}
                <div className="p-3.5 bg-gray-50 border border-[#E4E7EC] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                      <Github className="w-4 h-4" />
                      <span>Direct GitHub Repository Connector</span>
                    </div>
                    {connectedRepo && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Connected
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="owner/repo or full github.com link"
                      className="flex-1 px-3 py-1.5 bg-white border border-[#E4E7EC] rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleConnectGitHub}
                      disabled={githubLoading}
                      className="px-3.5 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black flex items-center gap-1.5"
                    >
                      {githubLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Github className="w-3 h-3" />}
                      {githubLoading ? 'Connecting…' : 'Connect Repo'}
                    </button>
                  </div>

                  {connectedRepo && (
                    <div className="p-2.5 bg-white border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#111827] font-mono">{connectedRepo.full_name}</strong>
                        <span className="text-[10px] text-[#667085] font-medium">★ {connectedRepo.stars}</span>
                      </div>
                      <p className="text-[11px] text-[#667085] truncate">{connectedRepo.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#98A2B3]">
                        <span>Language: {connectedRepo.language}</span>
                        <span>· Default branch: {connectedRepo.default_branch}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. File Upload Attachment */}
                <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      Attach Evidence Document / Artifact
                    </span>
                    {uploadedFile && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Uploaded ✓
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 rounded-xl p-3 text-center cursor-pointer hover:bg-white transition-colors"
                  >
                    <p className="text-xs text-indigo-700 font-semibold">
                      {uploadingFile ? 'Uploading to secure vault…' : 'Click to browse or drop PDF, specification, or screenshot'}
                    </p>
                    <p className="text-[10px] text-[#667085] mt-0.5">Supports documents up to 50MB</p>
                  </div>

                  {uploadedFile && (
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-indigo-100 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span className="truncate font-medium text-[#111827]">{uploadedFile.name}</span>
                        <span className="text-[10px] text-[#98A2B3] flex-shrink-0">({uploadedFile.size})</span>
                      </div>
                      <a
                        href={uploadedFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 font-bold hover:underline ml-2"
                      >
                        Inspect
                      </a>
                    </div>
                  )}
                </div>

                {/* 7. Visibility */}
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Visibility (Privacy Model — Section 17)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'private', label: 'Private', desc: 'Only you', icon: Lock },
                      { id: 'shared', label: 'Shared', desc: 'Team members', icon: Users },
                      { id: 'public', label: 'Public', desc: 'Community feed', icon: Globe },
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

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors"
                  >
                    Create & Activate Commitment
                  </button>
                </div>
              </form>
            ) : (
              /* Method B: Guided Conversational AI Creator (Section 6 & 33) */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Conversational AI Commitment Architect
                  </span>
                  <p className="text-[#667085] text-[11px] leading-relaxed">
                    Describe your goal in plain terms. FollowFlow Agent will ask necessary clarifying questions and produce a bulletproof, verifiable commitment blueprint.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    What is your target goal or promise?
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. We need to complete the Stripe payment gateway integration before Friday and verify with test invoices."
                    className="w-full p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunAIGuide}
                  disabled={aiLoading}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  {aiLoading ? 'Agent Structuring Commitment…' : 'Architect Commitment Blueprint'}
                </button>

                {/* AI Blueprint & Clarifying Questions */}
                {aiBlueprint && (
                  <div className="p-4 rounded-xl border border-indigo-200 bg-white space-y-3 animate-in fade-in shadow-sm">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <span className="font-bold text-indigo-950 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Proposed Commitment Blueprint
                      </span>
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                        {Math.round((aiBlueprint.confidence || 0.94) * 100)}% Confidence
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-[#98A2B3]">Title</p>
                      <p className="font-bold text-sm text-[#111827]">{aiBlueprint.title}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-[#98A2B3]">Deliverable Scope</p>
                      <p className="text-xs text-[#667085]">{aiBlueprint.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E4E7EC]">
                      <div>
                        <span className="text-[#98A2B3] block">Smart Deadline</span>
                        <span className="font-bold text-[#111827]">{aiBlueprint.deadline_label || aiBlueprint.suggested_deadline}</span>
                      </div>
                      <div>
                        <span className="text-[#98A2B3] block">Proof Criteria</span>
                        <span className="font-bold text-indigo-600 capitalize">{aiBlueprint.evidence_type}</span>
                      </div>
                    </div>

                    {/* Clarifying Questions from AI */}
                    {aiBlueprint.clarifying_questions && aiBlueprint.clarifying_questions.length > 0 && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                        <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Clarifying Question:
                        </p>
                        {aiBlueprint.clarifying_questions.map((q: string, i: number) => (
                          <p key={i} className="text-[11px] text-amber-800">
                            • {q}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyAIToForm(aiBlueprint)}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm"
                      >
                        Apply Blueprint to Form & Customize →
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
