'use client';
import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCommitments, createCommitment, uploadCommitmentFile,
  connectIntegration, guideCommitmentAI,
  getOrganizations, createOrganization,
  getTeams, createTeam,
  getUsers,
  type Commitment, type CreateCommitmentInput,
  type Organization, type Team, type User,
  type IntegrationConnectResult
} from '@/lib/api';
import { getAuthUser } from '@/lib/auth';
import { Card, ProgressBar, Skeleton, EmptyState } from '@/components/ui/index';
import { formatDate, getRelativeTime, cn } from '@/lib/utils';
import {
  Plus, Search, Sparkles, Brain, ShieldCheck, Lock, Globe,
  Users, CheckCircle2, AlertTriangle, ArrowRight, X, Calendar,
  FileText, Github, UploadCloud, Paperclip, Building2, Briefcase,
  UserCheck, Check, ExternalLink, HelpCircle, RefreshCw,
  MessageSquare, Cloud, BookOpen, Share2, Layers, CheckSquare,
  ChevronDown, User as UserIcon
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

const INTEGRATION_OPTIONS = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    category: 'Code & Version Control',
    placeholder: 'owner/repo or https://github.com/owner/repo/pull/42',
    tip: 'Verifies merged PRs, commits, and branch protection',
    color: 'bg-gray-900 text-white',
  },
  {
    id: 'slack',
    name: 'Slack & Stack',
    icon: MessageSquare,
    category: 'Communications & Threads',
    placeholder: '#eng-releases or channel archive link',
    tip: 'Listens for broadcast confirmation and #FollowFlowDone bot receipts',
    color: 'bg-[#4A154B] text-white',
  },
  {
    id: 'notion',
    name: 'Notion PRD',
    icon: BookOpen,
    category: 'Product & Specifications',
    placeholder: 'https://notion.so/followflow/prd-v2',
    tip: 'Validates property status transition to "Approved" or "Done"',
    color: 'bg-neutral-800 text-white',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Professional',
    icon: Share2,
    category: 'Public Trust & Social',
    placeholder: 'https://linkedin.com/posts/username_announcement',
    tip: 'Verifies public milestone post with #FollowFlowVerified hashtag',
    color: 'bg-[#0A66C2] text-white',
  },
  {
    id: 'jira_linear',
    name: 'Jira & Linear',
    icon: CheckSquare,
    category: 'Sprint & Issue Tracker',
    placeholder: 'ENG-1042 or issue URL',
    tip: 'Validates ticket state transitioned to "Done" or "Closed"',
    color: 'bg-[#0052CC] text-white',
  },
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    icon: Cloud,
    category: 'Cloud Infrastructure & SRE',
    placeholder: 's3://followflow-artifacts/v2/ or CloudWatch Alarm ARN',
    tip: 'Verifies zero CloudWatch alarms and S3 deliverable delivery',
    color: 'bg-[#FF9900] text-black font-semibold',
  },
  {
    id: 'google_docs',
    name: 'Google Workspace & Docs',
    icon: FileText,
    category: 'Architecture RFCs',
    placeholder: 'https://docs.google.com/document/d/...',
    tip: 'Inspects finalized architecture design docs and comments',
    color: 'bg-[#4285F4] text-white',
  },
];

const ROLE_OPTIONS = [
  'Lead Autonomous Architect',
  'Senior Staff Product Manager',
  'Staff DevOps & SecOps Engineer',
  'Senior AI Research Scientist',
  'Chief Technology Officer',
  'Operations Lead',
  'Designer',
];

function CommitmentsContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');

  // Hierarchy Data
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Current Active User (Username Culture)
  const [currentUser, setCurrentUser] = useState<User>({
    id: '9874cb2a-8cad-4073-803b-5c41aed45158',
    name: 'Rahul Kumar',
    username: 'rahulk',
    email: 'rahul@followflow.ai',
    role: 'admin',
    title: 'Lead Autonomous Architect',
    reliability_score: 96.5,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);

  // Strands AI Copilot Toggle (as requested: inline assistant toggle, NOT separate page)
  const [copilotActive, setCopilotActive] = useState(true);
  const [copilotPrompt, setCopilotPrompt] = useState('Deploy AWS S3 zero-trust token rotation pipeline with CloudWatch health checks by Friday');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotAdvice, setCopilotAdvice] = useState<string | null>(null);
  const [autoHighlighted, setAutoHighlighted] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateCommitmentInput>({
    title: '',
    description: '',
    deadline: '',
    visibility: 'private',
    evidence_type: 'github_repo',
    evidence_url: '',
    owner_name: 'Rahul Kumar',
    owner_username: 'rahulk',
    scope: 'individual',
    organization_name: 'FollowFlow Labs',
    team_name: 'Core Platform Team',
    role: 'Lead Autonomous Architect',
    team_members: [],
    integration_provider: 'github',
    integration_meta: {},
    file_url: '',
    file_name: '',
    file_size: '',
  });

  const [teamMemberInput, setTeamMemberInput] = useState('');

  // Industry Integration State
  const [integrationProvider, setIntegrationProvider] = useState('github');
  const [integrationIdentifier, setIntegrationIdentifier] = useState('mittai17/followflow');
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [connectedIntegration, setConnectedIntegration] = useState<IntegrationConnectResult | null>(null);

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; url: string } | null>(null);

  // New Org / Team Input State
  const [newOrgName, setNewOrgName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [comms, orgs, tms, usrs] = await Promise.all([
        getCommitments(),
        getOrganizations(),
        getTeams(),
        getUsers(),
      ]);
      setCommitments(comms);
      setOrganizations(orgs);
      setTeams(tms);
      setAllUsers(usrs);

      if (usrs.length > 0) {
        const auth = getAuthUser();
        const found = (auth ? usrs.find((u) => u.username === auth.username || u.id === auth.id) : null)
          || usrs.find((u) => u.username === 'rahulk')
          || usrs[0];
        setCurrentUser(found);
        setFormData((prev) => ({
          ...prev,
          owner_name: found.name,
          owner_username: found.username,
          role: found.title || found.role || prev.role,
        }));
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === 'true') {
      setShowModal(true);
      const initialPrompt = searchParams.get('prompt');
      if (initialPrompt) {
        setCopilotPrompt(initialPrompt);
        setFormData((prev) => ({ ...prev, title: initialPrompt }));
      }
    }
  }, [searchParams]);

  // When selected organization changes in form, auto-pick default team
  useEffect(() => {
    const orgTeams = teams.filter((t) => t.organization_name === formData.organization_name);
    if (orgTeams.length > 0 && !orgTeams.some((t) => t.name === formData.team_name)) {
      setFormData((prev) => ({
        ...prev,
        team_name: orgTeams[0].name,
        team_id: orgTeams[0].id,
      }));
    }
  }, [formData.organization_name, teams]);

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
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, deadline: localIso }));
  }

  // Handle Industry App Connect
  async function handleConnectIntegration() {
    if (!integrationIdentifier.trim()) return;
    setIntegrationLoading(true);
    try {
      const result = await connectIntegration(integrationProvider, integrationIdentifier);
      setConnectedIntegration(result);
      setFormData((prev) => ({
        ...prev,
        integration_provider: integrationProvider,
        integration_meta: result,
        evidence_url: result.url || integrationIdentifier,
        evidence_type: result.provider,
      }));
    } catch (err: any) {
      alert(`Integration error: ${err.message}`);
    }
    setIntegrationLoading(false);
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

  // Strands AI Copilot Assistant Handler
  async function handleCopilotArchitect() {
    if (!copilotPrompt.trim()) return;
    setCopilotLoading(true);
    setCopilotAdvice(null);
    try {
      const bp = await guideCommitmentAI(
        copilotPrompt,
        formData.scope,
        formData.organization_name,
        formData.role,
        currentUser.username,
        integrationProvider
      );
      setCopilotAdvice(bp.copilot_advice || `Strands Architect optimized for ${bp.organization_name}.`);

      // Autofill form inputs directly
      let isoDeadline = formData.deadline;
      if (bp.suggested_deadline && bp.suggested_deadline.includes('-')) {
        isoDeadline = `${bp.suggested_deadline}T18:00`;
      }

      setFormData((prev) => ({
        ...prev,
        title: bp.title || prev.title,
        description: bp.description || prev.description,
        deadline: isoDeadline || prev.deadline,
        integration_provider: bp.integration_provider || prev.integration_provider,
        evidence_type: bp.evidence_type || prev.evidence_type,
        scope: (bp.scope as any) || prev.scope,
        role: bp.role || prev.role,
        visibility: bp.visibility || prev.visibility,
      }));

      if (bp.integration_provider) {
        setIntegrationProvider(bp.integration_provider);
      }
      setAutoHighlighted(true);
      setTimeout(() => setAutoHighlighted(false), 4000);
    } catch (err: any) {
      alert(`AI Copilot error: ${err.message}`);
    }
    setCopilotLoading(false);
  }

  // Add collaborator handle
  function addTeamMember(handle: string) {
    const clean = handle.startsWith('@') ? handle : `@${handle}`;
    const current = formData.team_members || [];
    if (!current.includes(clean)) {
      setFormData({ ...formData, team_members: [...current, clean] });
    }
  }

  function removeTeamMember(handle: string) {
    const current = formData.team_members || [];
    setFormData({ ...formData, team_members: current.filter((m) => m !== handle) });
  }

  // Create New Org
  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      const created = await createOrganization({ name: newOrgName.trim() });
      setOrganizations((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, organization_name: created.name }));
      setNewOrgName('');
      setShowNewOrgModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Create New Team
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const currentOrg = organizations.find((o) => o.name === formData.organization_name) || organizations[0];
    try {
      const created = await createTeam({
        organization_id: currentOrg.id,
        name: newTeamName.trim(),
        description: newTeamDesc.trim() || undefined,
        lead_username: currentUser.username,
      });
      setTeams((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, team_name: created.name, team_id: created.id }));
      setNewTeamName('');
      setNewTeamDesc('');
      setShowNewTeamModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Form Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      await createCommitment({
        ...formData,
        owner_name: currentUser.name,
        owner_username: currentUser.username,
      });
      setShowModal(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        visibility: 'private',
        evidence_type: 'github_repo',
        evidence_url: '',
        owner_name: currentUser.name,
        owner_username: currentUser.username,
        scope: 'individual',
        organization_name: 'FollowFlow Labs',
        team_name: 'Core Platform Team',
        role: currentUser.title || 'Lead Autonomous Architect',
        team_members: [],
        integration_provider: 'github',
        integration_meta: {},
        file_url: '',
        file_name: '',
        file_size: '',
      });
      setConnectedIntegration(null);
      setUploadedFile(null);
      loadData();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  }

  // Filter commitments
  const filtered = commitments.filter((c) => {
    if (tab === 'individual' && c.scope !== 'individual') return false;
    if (tab === 'team' && c.scope !== 'team') return false;
    if (tab === 'active' && !['ACTIVE', 'UPCOMING', 'DUE_SOON', 'DUE_TODAY'].includes(c.status)) return false;
    if (tab === 'verified' && c.status !== 'VERIFIED') return false;
    if (tab === 'at_risk' && c.risk !== 'high' && c.risk !== 'critical') return false;
    if (tab === 'public' && c.visibility !== 'public') return false;

    if (selectedOrgFilter !== 'all' && c.organization_name !== selectedOrgFilter) return false;

    if (search) {
      const s = search.toLowerCase();
      const matchTitle = (c.title || '').toLowerCase().includes(s);
      const matchDesc = (c.description || '').toLowerCase().includes(s);
      const matchOwner = (c.owner_name || '').toLowerCase().includes(s);
      const matchUser = (c.owner_username || '').toLowerCase().includes(s);
      const matchOrg = (c.organization_name || '').toLowerCase().includes(s);
      return matchTitle || matchDesc || matchOwner || matchUser || matchOrg;
    }
    return true;
  });

  const activeIntegrationMeta = INTEGRATION_OPTIONS.find((i) => i.id === integrationProvider) || INTEGRATION_OPTIONS[0];
  const currentOrgTeams = teams.filter((t) => t.organization_name === formData.organization_name);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER & PERSONA BANNER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Autonomous Commitment Network
            </span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              ● Strands SDK v1.55.1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827]">Tracked Commitments</h1>
          <p className="text-xs sm:text-sm text-[#667085]">
            Keep your promises. Multi-org governance, team SLAs, and automated industry evidence verification.
          </p>
        </div>

        {/* User Persona Switcher & Primary Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Username Persona */}
          <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] px-3 py-1.5 rounded-xl shadow-xs text-xs">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-[#111827] block">@{currentUser.username}</span>
              <span className="text-[10px] text-[#667085]">{currentUser.title}</span>
            </div>
            {/* Quick Switch Dropdown */}
            <select
              value={currentUser.username}
              onChange={(e) => {
                const found = allUsers.find((u) => u.username === e.target.value);
                if (found) {
                  setCurrentUser(found);
                  setFormData((prev) => ({
                    ...prev,
                    owner_name: found.name,
                    owner_username: found.username,
                    role: found.title || prev.role,
                  }));
                }
              }}
              className="ml-1 bg-[#F7F8FA] border border-[#E4E7EC] rounded text-[11px] font-semibold py-0.5 px-1 text-[#475467] focus:outline-none"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.username}>
                  @{u.username} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Commitment
          </button>
        </div>
      </div>

      {/* ── FILTER & ORGANIZATION CONTROLS ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-[20px] border border-[#E4E7EC] shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, @username, organization, or deliverable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Organization Filter Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#667085] font-semibold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Org:
          </span>
          <select
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
            className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#111827] focus:outline-none"
          >
            <option value="all">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name} ({org.team_count || 0} teams)
              </option>
            ))}
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                tab === t.key ? 'bg-indigo-600 text-white' : 'text-[#667085] hover:bg-[#F7F8FA]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── COMMITMENTS LIST ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No commitments matching your filter"
          description={search ? 'Try a different keyword or check organization selection' : 'Create an individual or team commitment.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isVerified = c.status === 'VERIFIED';
            const isTeam = c.scope === 'team';
            const integ = INTEGRATION_OPTIONS.find((i) => i.id === c.integration_provider) || INTEGRATION_OPTIONS[0];
            const IntegIcon = integ.icon;

            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-[20px] border p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-200',
                  isVerified ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#E4E7EC]'
                )}
              >
                <div>
                  {/* Top Scope, Org & Owner Handle */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1',
                          isTeam ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {isTeam ? <Users className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                        {c.scope || 'individual'}
                      </span>

                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium truncate max-w-[110px]">
                        {c.organization_name || 'FollowFlow'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Owner Handle & Role */}
                  <div className="flex items-center gap-1.5 text-xs text-[#667085] mb-2 font-mono">
                    <span className="font-bold text-indigo-700">@{c.owner_username || 'rahulk'}</span>
                    <span>·</span>
                    <span className="text-[11px] truncate">{c.role || 'Lead'}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-[#111827] line-clamp-2 mb-1">{c.title}</h3>
                  <p className="text-xs text-[#667085] line-clamp-2 mb-3 leading-relaxed">
                    {c.description || `${c.role || 'Contributor'} commitment at ${c.organization_name || 'FollowFlow'}`}
                  </p>

                  {/* Connected Integrations & Deliverables */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {c.integration_provider && (
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono', integ.color)}>
                        <IntegIcon className="w-3 h-3" />
                        {integ.name}
                      </span>
                    )}
                    {c.file_name && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">
                        <Paperclip className="w-3 h-3" /> {c.file_name}
                      </span>
                    )}
                    {c.team_members && c.team_members.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px]">
                        <Users className="w-3 h-3" /> {c.team_members.length} collaborators
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
                    <span className="text-[10px] text-[#667085] truncate max-w-[160px]">
                      {c.team_name || 'General Team'}
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

      {/* ── CREATE COMMITMENT MODAL WITH INLINE STRANDS COPILOT ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-3xl w-full p-6 shadow-2xl border border-[#E4E7EC] my-6 animate-in fade-in zoom-in-95 max-h-[94vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E7EC] mb-5 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-lg font-black text-[#111827]">Create a Tracked Commitment</h3>
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full text-xs">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase">Posting as:</span>
                    <select
                      value={currentUser.username}
                      onChange={(e) => {
                        const found = allUsers.find((u) => u.username === e.target.value);
                        if (found) {
                          setCurrentUser(found);
                          setFormData((prev) => ({
                            ...prev,
                            owner_name: found.name,
                            owner_username: found.username,
                            role: found.title || prev.role,
                          }));
                        }
                      }}
                      className="bg-transparent text-xs font-mono font-bold text-indigo-900 focus:outline-none cursor-pointer"
                    >
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.username}>
                          @{u.username} ({u.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-[#667085]">
                  Define deliverables, enterprise SLA, and automated industry app verification.
                </p>
              </div>

              {/* Top Controls: Copilot Assistant Toggle & Close */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Copilot Toggle Button */}
                <button
                  type="button"
                  onClick={() => setCopilotActive(!copilotActive)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border',
                    copilotActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-sm'
                      : 'bg-white text-[#667085] border-[#E4E7EC] hover:bg-[#F7F8FA]'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Strands AI Copilot: {copilotActive ? 'ON' : 'OFF'}</span>
                </button>

                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#667085]" />
                </button>
              </div>
            </div>

            {/* ── INLINE STRANDS AI COPILOT PANEL (When Toggled ON) ── */}
            {copilotActive && (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border border-indigo-200 shadow-xs space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#111827]">Strands Autonomous Commitment Architect</h4>
                      <p className="text-[10px] text-[#667085]">
                        Powered by Strands Agents SDK · Analyzes intent, selects integration, and autofills your contract.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                    Active Copilot
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    placeholder="e.g. Deploy zero-trust token rotation pipeline to AWS CloudWatch by Friday"
                    className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                  />
                  <button
                    type="button"
                    disabled={copilotLoading}
                    onClick={handleCopilotArchitect}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                  >
                    {copilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {copilotLoading ? 'Reasoning…' : '✨ Auto-Architect'}
                  </button>
                </div>

                {copilotAdvice && (
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">{copilotAdvice}</p>
                      <p className="text-[11px] text-[#667085]">
                        Form fields updated below. You can review, refine, or attach files.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STRUCTURED COMMITMENT FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Scope: Individual vs Team */}
              <div>
                <label className="font-bold text-[#111827] block mb-1.5">Commitment Scope & SLA Policy</label>
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
                    <UserCheck className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-[#111827]">Individual Scope</span>
                      <span className="text-[11px] text-[#667085]">
                        Contributes to your personal reliability score and builder streak.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, scope: 'team' })}
                    className={cn(
                      'p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all',
                      formData.scope === 'team'
                        ? 'border-purple-600 bg-purple-50/50 text-purple-900 shadow-xs'
                        : 'border-[#E4E7EC] bg-white text-[#667085]'
                    )}
                  >
                    <Users className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-[#111827]">Team Scope</span>
                      <span className="text-[11px] text-[#667085]">
                        Shared team SLA with collaborator tags and cross-functional visibility.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Organization, Team & Role Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Organization */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#111827] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Organization
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewOrgModal(true)}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      + New Org
                    </button>
                  </div>
                  <select
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#111827] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-600" /> Team
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewTeamModal(true)}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      + New Team
                    </button>
                  </div>
                  <select
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {currentOrgTeams.length === 0 ? (
                      <option value="General Platform">General Platform</option>
                    ) : (
                      currentOrgTeams.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Functional Role</label>
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

              {/* 3. Team Collaborators (when scope is 'team') */}
              {formData.scope === 'team' && (
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#111827] flex items-center gap-1 text-xs">
                      <Users className="w-3.5 h-3.5 text-purple-600" /> Team Collaborators (@username culture)
                    </label>
                    <span className="text-[10px] text-[#667085]">Click handles to add/remove</span>
                  </div>

                  {/* Active Users Handles Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {allUsers.map((u) => {
                      const handle = `@${u.username}`;
                      const isAdded = (formData.team_members || []).includes(handle);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => (isAdded ? removeTeamMember(handle) : addTeamMember(handle))}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all',
                            isAdded
                              ? 'bg-purple-600 text-white shadow-2xs font-bold'
                              : 'bg-white border border-purple-200 text-purple-800 hover:bg-purple-100'
                          )}
                        >
                          <span>{handle}</span>
                          {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Collaborator input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add another @username or collaborator email..."
                      value={teamMemberInput}
                      onChange={(e) => setTeamMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (teamMemberInput.trim()) {
                            addTeamMember(teamMemberInput.trim());
                            setTeamMemberInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-[#111827] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (teamMemberInput.trim()) {
                          addTeamMember(teamMemberInput.trim());
                          setTeamMemberInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Title & Description */}
              {autoHighlighted && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-800 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>✨ Strands Copilot auto-architected 5 fields — review highlighted fields below.</span>
                </div>
              )}

              <div>
                <label className="font-bold text-[#111827] block mb-1">Commitment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ship Zero-Trust Token Rotation Pipeline to AWS Bedrock"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-500 ${
                    autoHighlighted ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Description & Acceptance Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Describe scope, dependencies, acceptance criteria, and what the agent should audit..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all duration-500 ${
                    autoHighlighted ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : ''
                  }`}
                />
              </div>

              {/* 5. Date & Time Picker with Preset Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#111827] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Deadline & Horizon
                  </label>
                  <span className="text-[11px] text-[#667085]">Quick presets:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => applyDatePreset('today')}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-semibold text-[#475467] hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    Today 6 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('tomorrow')}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-semibold text-[#475467] hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    Tomorrow EOD
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('friday')}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-semibold text-[#475467] hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    This Friday
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('week')}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-semibold text-[#475467] hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    In 1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('month')}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] text-[11px] font-semibold text-[#475467] hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    In 30 Days
                  </button>
                </div>

                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-500 ${
                    autoHighlighted ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : ''
                  }`}
                />
                <p className="text-[10px] text-[#667085] mt-1.5 flex items-center gap-1">
                  <span>💡</span> Rescheduling &gt;24h before deadline with documented reason incurs 0 penalty to Reliability Score.
                </p>
              </div>

              {/* 6. Industry App Integrations Dropdown & Quick Connect */}
              <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E4E7EC] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    <label className="font-bold text-[#111827]">Industry App Integration & Evidence</label>
                  </div>
                  <span className="text-[10px] text-[#667085]">Auto-verified on completion</span>
                </div>

                {/* Provider Selector Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#475467] block mb-1">Select Industry App</label>
                    <select
                      value={integrationProvider}
                      onChange={(e) => {
                        const newP = e.target.value;
                        setIntegrationProvider(newP);
                        const matched = INTEGRATION_OPTIONS.find((i) => i.id === newP);
                        if (matched) {
                          setIntegrationIdentifier(matched.placeholder.split(' ')[0]);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] font-bold focus:outline-none"
                    >
                      {INTEGRATION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} ({opt.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#475467] block mb-1">
                      Identifier / Resource / URL
                    </label>
                    <input
                      type="text"
                      value={integrationIdentifier}
                      onChange={(e) => setIntegrationIdentifier(e.target.value)}
                      placeholder={activeIntegrationMeta.placeholder}
                      className="w-full px-3 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#667085]">{activeIntegrationMeta.tip}</p>
                  <button
                    type="button"
                    onClick={handleConnectIntegration}
                    disabled={integrationLoading || !integrationIdentifier.trim()}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {integrationLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                    {integrationLoading ? 'Validating…' : 'Connect & Validate'}
                  </button>
                </div>

                {/* Connected Integration Preview Pill */}
                {connectedIntegration && (
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-[#111827]">{connectedIntegration.title}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {connectedIntegration.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085]">
                      Evidence criteria: <strong>{connectedIntegration.evidence_criteria}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* 7. Deliverables & Document Upload Vault */}
              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Attached Deliverable / Spec Document (PDF / Spec Vault)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="px-3.5 py-2 border border-[#E4E7EC] bg-[#F7F8FA] text-[#111827] rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    {uploadingFile ? 'Uploading to vault…' : 'Upload Deliverable Artifact'}
                  </button>

                  {uploadedFile && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="font-semibold truncate max-w-xs">{uploadedFile.name}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">({uploadedFile.size})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 8. Visibility & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-[#E4E7EC] gap-3">
                <div className="flex items-center gap-3">
                  <label className="font-semibold text-[#111827]">Privacy:</label>
                  <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={() => setFormData({ ...formData, visibility: 'private' })}
                    />
                    <Lock className="w-3 h-3 text-[#98A2B3]" /> Private
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="shared"
                      checked={formData.visibility === 'shared'}
                      onChange={() => setFormData({ ...formData, visibility: 'shared' })}
                    />
                    <Users className="w-3 h-3 text-indigo-600" /> Team / Shared
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={() => setFormData({ ...formData, visibility: 'public' })}
                    />
                    <Globe className="w-3 h-3 text-cyan-600" /> Public
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-white border border-[#E4E7EC] rounded-xl text-xs font-semibold text-[#667085] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Commit & Track
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE ORGANIZATION MODAL ── */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-black text-sm text-[#111827] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" /> Create New Organization
              </h3>
              <button onClick={() => setShowNewOrgModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Autonomous Labs"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-900 border border-indigo-100">
                Creates an Enterprise SLA policy (95% fulfillment target, 24h grace period) with an automatic General Platform team.
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-sm"
                >
                  Create Organization
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 bg-white border border-[#E4E7EC] rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE TEAM MODAL ── */}
      {showNewTeamModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-black text-sm text-[#111827] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" /> Create Team in {formData.organization_name}
              </h3>
              <button onClick={() => setShowNewTeamModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-[#667085]" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRE & Cloud Infrastructure"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Team scope and mission..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 shadow-sm"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTeamModal(false)}
                  className="px-4 py-2 bg-white border border-[#E4E7EC] rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommitmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <CommitmentsContent />
    </Suspense>
  );
}
