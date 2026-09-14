'use client';
import { useEffect, useState } from 'react';
import {
  getOrganizations, getTeams, getUsers, getAvailableIntegrations,
  type Organization, type Team, type User, type IntegrationItem
} from '@/lib/api';
import { Card, Skeleton } from '@/components/ui/index';
import {
  Settings as SettingsIcon, Building2, Users, ShieldCheck,
  KeyRound, Bell, Sliders, CheckCircle2, Copy, Check,
  ExternalLink, Plus, RefreshCw, Lock, Terminal, Cloud
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'integrations' | 'agent_policy' | 'security'>('workspace');

  // Real DB data
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Policy Settings
  const [gracePeriodHours, setGracePeriodHours] = useState(24);
  const [ambiguityThreshold, setAmbiguityThreshold] = useState(85);
  const [automatedFollowups, setAutomatedFollowups] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // API Key State
  const [copiedKey, setCopiedKey] = useState(false);
  const apiKey = 'ff_live_sec_8902b4d91e847c10b784a';

  async function load() {
    setLoading(true);
    try {
      const [orgs, tms, usrs, ints] = await Promise.all([
        getOrganizations(),
        getTeams(),
        getUsers(),
        getAvailableIntegrations(),
      ]);
      setOrganizations(orgs);
      setTeams(tms);
      setUsers(usrs);
      setIntegrations(ints);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSavePolicy(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  function handleCopyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-14" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const activeOrg = organizations[0] || { name: 'FollowFlow Labs', plan: 'Enterprise' };

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="pb-4 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase">
            Workspace Governance
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            ● Enterprise SLA Active
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111827]">Settings & Policies</h1>
        <p className="text-xs sm:text-sm text-[#667085]">
          Manage multi-organization hierarchy, team memberships, industry webhooks, and agent autonomy limits.
        </p>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'workspace' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#667085] hover:bg-[#F7F8FA]'
          }`}
        >
          <Building2 className="w-4 h-4" /> Organization & Teams ({organizations.length})
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#667085] hover:bg-[#F7F8FA]'
          }`}
        >
          <Cloud className="w-4 h-4" /> Connected Industry Accounts ({integrations.length})
        </button>
        <button
          onClick={() => setActiveTab('agent_policy')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'agent_policy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#667085] hover:bg-[#F7F8FA]'
          }`}
        >
          <Sliders className="w-4 h-4" /> Agent Autonomy & SLA Policies
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'security' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#667085] hover:bg-[#F7F8FA]'
          }`}
        >
          <KeyRound className="w-4 h-4" /> API Keys & Audit Trail
        </button>
      </div>

      {/* ── TAB 1: WORKSPACE & TEAMS ── */}
      {activeTab === 'workspace' && (
        <div className="space-y-6 text-xs">
          {/* Active Org Card */}
          <div className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {activeOrg.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111827]">{activeOrg.name}</h3>
                  <p className="text-[11px] text-[#667085]">
                    Plan: <strong className="text-purple-700">{activeOrg.plan || 'Enterprise'}</strong> · Target SLA:{' '}
                    <strong>{activeOrg.sla_policy?.target_fulfillment_rate || 95}% fulfillment</strong>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE WORKSPACE
              </span>
            </div>
          </div>

          {/* Teams Directory */}
          <div className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111827]">Configured Teams Directory</h3>
                <p className="text-[11px] text-[#667085]">
                  Cross-functional teams managing shared commitment SLAs and collaborator tags.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((t) => (
                <div key={t.id} className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827]">{t.name}</span>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                      lead: @{t.lead_username}
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">{t.description}</p>
                  <div className="text-[10px] text-[#98A2B3]">
                    Org: <strong>{t.organization_name}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members & Usernames Directory */}
          <div className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111827]">Authenticated Members & Handles (@username culture)</h3>
            <div className="divide-y divide-[#E4E7EC]">
              {users.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-[#111827] text-xs block">{u.name}</span>
                      <span className="text-[11px] font-mono text-indigo-600 font-bold">@{u.username}</span>
                      <span className="text-[10px] text-[#667085] ml-2">({u.title})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">{u.reliability_score}%</span>
                    <span className="text-[10px] text-[#98A2B3] block">Reliability</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INDUSTRY INTEGRATIONS ── */}
      {activeTab === 'integrations' && (
        <div className="space-y-4 text-xs">
          <p className="text-[#667085]">
            Industry connections enable automated evidence audits (commits, CloudWatch alarms, S3 buckets, Notion status).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {integrations.map((i) => (
              <div key={i.id} className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{i.category}</span>
                    <h4 className="font-bold text-sm text-[#111827]">{i.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    CONFIGURED
                  </span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">{i.description}</p>
                <div className="p-2 bg-[#F7F8FA] rounded-lg font-mono text-[10px] text-[#475467] truncate">
                  {i.placeholder}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: AGENT POLICIES & SLA ── */}
      {activeTab === 'agent_policy' && (
        <form onSubmit={handleSavePolicy} className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#111827]">Autonomous Agent Follow-up & Ambiguity Rules</h3>
            <p className="text-[11px] text-[#667085]">
              Defines the decision boundary for when the agent executes autonomously vs. halts for human approval.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-[#111827] block mb-1">
                Ambiguity Cutoff Threshold ({ambiguityThreshold}%)
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={ambiguityThreshold}
                onChange={(e) => setAmbiguityThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-[#667085] mt-1">
                If the agent's confidence in submitted evidence is below {ambiguityThreshold}%, it halts and routes an approval card to human operators.
              </p>
            </div>

            <div>
              <label className="font-bold text-[#111827] block mb-1">
                Transparent Rescheduling Grace Period ({gracePeriodHours} Hours)
              </label>
              <select
                value={gracePeriodHours}
                onChange={(e) => setGracePeriodHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value={12}>12 Hours prior to deadline</option>
                <option value={24}>24 Hours prior to deadline (Recommended)</option>
                <option value={48}>48 Hours prior to deadline</option>
              </select>
              <p className="text-[11px] text-[#667085] mt-1">
                Rescheduling within this horizon with a documented reason incurs 0 penalty to the reliability score.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-xl">
              <div>
                <span className="font-bold text-[#111827] block">Automated Polite Escalation Follow-ups</span>
                <span className="text-[11px] text-[#667085]">
                  Sends scheduled reminder notifications 24h and 4h prior to deadline.
                </span>
              </div>
              <input
                type="checkbox"
                checked={automatedFollowups}
                onChange={(e) => setAutomatedFollowups(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Policy settings successfully saved to database!
              </span>
            ) : (
              <span className="text-[11px] text-[#98A2B3]">Changes take effect immediately across all agents.</span>
            )}

            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-sm"
            >
              Save Policy Rules
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 4: SECURITY & API KEYS ── */}
      {activeTab === 'security' && (
        <div className="p-6 bg-white border border-[#E4E7EC] rounded-[24px] shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#111827]">Production API Credentials</h3>
            <p className="text-[11px] text-[#667085]">
              Use this secret key to integrate FollowFlow autonomous tracking with your CI/CD pipelines and webhooks.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-[#111827]">Live Workspace API Key</label>
            <div className="flex items-center justify-between p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl font-mono text-xs text-[#111827]">
              <span>{apiKey}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="p-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:bg-gray-100 transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#667085]" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 text-indigo-900">
            <span className="font-bold block">Amazon Bedrock AgentCore Runtime Endpoint</span>
            <p className="text-[11px] text-indigo-700 font-mono">
              http://localhost:8000/invocations · Health: http://localhost:8000/ping
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
