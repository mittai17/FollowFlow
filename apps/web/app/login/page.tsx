'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Lock, ArrowRight, UserCheck, Search,
  Building2, Sparkles, CheckCircle2, Shield, Loader2,
  Key, Mail, ExternalLink, ChevronRight, Check
} from 'lucide-react';
import { getUsers, type User } from '@/lib/api';
import { getAuthUser, setAuthUser, clearAuthUser } from '@/lib/auth';
import FollowFlowLogo from '@/components/ui/Logo';

// Fallback directory users in case backend is loading
const FALLBACK_USERS: User[] = [
  {
    id: '9874cb2a-8cad-4073-803b-5c41aed45158',
    name: 'Rahul Kumar',
    username: 'rahulk',
    email: 'rahul@followflow.ai',
    role: 'admin',
    title: 'Lead Autonomous Architect',
    bio: 'Building autonomous commitment agents on AWS Bedrock & Strands SDK.',
    reliability_score: 96.5,
  },
  {
    id: 'bcb49848-e73d-47c5-912c-bf3cb7031358',
    name: 'Devon Clarke',
    username: 'devon_c',
    email: 'devon.clarke@followflow.ai',
    role: 'security',
    title: 'Director of Information Security & SOC2',
    bio: 'Enforcing cryptographic Ed25519 commit signing and zero-trust boundaries.',
    reliability_score: 99.6,
  },
  {
    id: '35ba9848-e73d-47c5-912c-bf3cb7031359',
    name: 'Sarah Chen',
    username: 'sarah_c',
    email: 'sarah.chen@followflow.ai',
    role: 'product',
    title: 'Head of Product & Platform UX',
    bio: 'Shaping the next generation of human-agent workflow interfaces.',
    reliability_score: 98.4,
  },
  {
    id: '45ba9848-e73d-47c5-912c-bf3cb7031360',
    name: 'Marcus Vance',
    username: 'marcus_v',
    email: 'marcus.v@followflow.ai',
    role: 'engineering',
    title: 'Principal Systems Architect',
    bio: 'Designing high-throughput distributed state machines on AWS Fargate.',
    reliability_score: 97.2,
  },
  {
    id: '55ba9848-e73d-47c5-912c-bf3cb7031361',
    name: 'Elena Rostova',
    username: 'elena_r',
    email: 'elena.r@followflow.ai',
    role: 'operations',
    title: 'VP of Global Operations & SRE',
    bio: 'Guaranteeing 99.99% multi-region agent orchestration uptime.',
    reliability_score: 99.1,
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [activeTab, setActiveTab] = useState<'directory' | 'email'>('directory');
  const [users, setUsers] = useState<User[]>(FALLBACK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [authenticatingUser, setAuthenticatingUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Email form state
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const existing = getAuthUser();
    if (existing) {
      setCurrentUser(existing);
    }

    // Fetch full 36 users directory
    setLoadingUsers(true);
    getUsers()
      .then((list) => {
        if (list && list.length > 0) {
          setUsers(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleSelectUser = (user: User) => {
    setAuthenticatingUser(user.id);
    setAuthUser(user);
    setCurrentUser(user);

    setTimeout(() => {
      router.push(redirectUrl);
    }, 450);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!workEmail.trim() || !workEmail.includes('@')) {
      setEmailError('Please enter a valid work email address.');
      return;
    }

    // Check if email matches existing directory user
    const matched = users.find(
      (u) => u.email.toLowerCase() === workEmail.trim().toLowerCase()
    );

    if (matched) {
      handleSelectUser(matched);
      return;
    }

    // If new work email, construct enterprise user
    const username = workEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const namePart = workEmail.split('@')[0].split(/[._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: namePart || 'Workspace Member',
      username: username || `user_${Date.now().toString().slice(-4)}`,
      email: workEmail.trim().toLowerCase(),
      role: 'member',
      title: 'Enterprise Contributor',
      reliability_score: 95.0,
    };

    handleSelectUser(newUser);
  };

  const handleSignOut = () => {
    clearAuthUser();
    setCurrentUser(null);
  };

  // Filter users by search and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRole !== 'all') {
        const role = (u.role || '').toLowerCase();
        if (selectedRole === 'leadership' && !['admin', 'leadership', 'vp', 'director'].some(r => role.includes(r) || (u.title || '').toLowerCase().includes(r))) return false;
        if (selectedRole === 'engineering' && !['engineering', 'developer', 'architect', 'eng'].some(r => role.includes(r) || (u.title || '').toLowerCase().includes(r))) return false;
        if (selectedRole === 'security' && !['security', 'soc2', 'compliance'].some(r => role.includes(r) || (u.title || '').toLowerCase().includes(r))) return false;
        if (selectedRole === 'operations' && !['operations', 'sre', 'ops'].some(r => role.includes(r) || (u.title || '').toLowerCase().includes(r))) return false;
        if (selectedRole === 'product' && !['product', 'ux', 'design'].some(r => role.includes(r) || (u.title || '').toLowerCase().includes(r))) return false;
      }

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        (u.title || '').toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery, selectedRole]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top bar with logo */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between mb-8">
        <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <FollowFlowLogo size={36} subtitle="Commitment Network" />
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E4E7EC] rounded-full text-[11px] font-medium text-[#667085] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SOC 2 Type II Verified</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto w-full bg-white border border-[#E4E7EC] rounded-3xl shadow-xl shadow-indigo-100/40 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 md:p-8 border-b border-[#E4E7EC] bg-gradient-to-b from-white to-gray-50/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Sign-In Wall · Enterprise Access
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight">
            Sign in to FollowFlow
          </h1>
          <p className="text-sm text-[#667085] mt-1.5 leading-relaxed">
            Select your enterprise identity or sign in with your corporate email to access promises, agent workflows, and cryptographic evidence.
          </p>

          {/* Active session banner if user is already logged in */}
          {currentUser && (
            <div className="mt-4 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">
                    Signed in as <span className="text-indigo-600">{currentUser.name}</span>
                  </p>
                  <p className="text-[11px] text-[#667085]">@{currentUser.username} · {currentUser.reliability_score}% reliability</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(redirectUrl)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1"
                >
                  Continue <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 bg-white border border-[#E4E7EC] text-[#667085] text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E4E7EC] bg-[#F7F8FA]">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'directory'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-[#667085] hover:text-[#111827]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Enterprise Directory (1-Click)</span>
            <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-mono">
              {users.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-[#667085] hover:text-[#111827]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Work Email & SSO</span>
          </button>
        </div>

        {/* Tab 1: Directory 1-Click Sign-In */}
        {activeTab === 'directory' && (
          <div className="p-6">
            {/* Search & Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, role, or @username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {['all', 'leadership', 'engineering', 'security', 'operations', 'product'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                      selectedRole === r
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#F7F8FA] text-[#667085] hover:bg-gray-200 border border-[#E4E7EC]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list of enterprise users */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-[#98A2B3] text-xs">
                  No directory members match your search criteria.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = currentUser?.id === u.id;
                  const isAuthProgress = authenticatingUser === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                          : 'border-[#E4E7EC] hover:border-indigo-300 hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#111827] truncate group-hover:text-indigo-600 transition-colors">
                              {u.name}
                            </p>
                            <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                              @{u.username}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#667085] truncate max-w-[280px]">
                            {u.title || u.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-emerald-600">
                            {u.reliability_score || 95.0}%
                          </span>
                          <span className="text-[9px] text-[#98A2B3] block">Trust</span>
                        </div>

                        <button
                          disabled={isAuthProgress}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : isAuthProgress
                              ? 'bg-indigo-400 text-white'
                              : 'bg-white border border-[#E4E7EC] text-[#111827] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                          }`}
                        >
                          {isAuthProgress ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Signing In...</span>
                            </>
                          ) : isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-[#98A2B3]">
              <span>💡 1-click testing enabled for all 36 workspace users</span>
              <span className="font-mono">AWS Fargate Active</span>
            </div>
          </div>
        )}

        {/* Tab 2: Email & Password / SSO */}
        {activeTab === 'email' && (
          <div className="p-6 md:p-8 space-y-5">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#111827]">Password / OTP</label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {emailError && (
                <p className="text-xs text-red-600 font-semibold">{emailError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E4E7EC]"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase text-[#98A2B3] tracking-wider">
                Or Continue With Enterprise SSO
              </span>
              <div className="flex-grow border-t border-[#E4E7EC]"></div>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectUser(users[0] || FALLBACK_USERS[0])}
                className="p-2.5 border border-[#E4E7EC] rounded-xl hover:bg-[#F7F8FA] transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#111827]"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                AWS IAM Identity Center
              </button>
              <button
                type="button"
                onClick={() => handleSelectUser(users[1] || FALLBACK_USERS[1])}
                className="p-2.5 border border-[#E4E7EC] rounded-xl hover:bg-[#F7F8FA] transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#111827]"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Okta SSO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info & compliance */}
      <div className="max-w-xl mx-auto w-full mt-8 text-center text-xs text-[#98A2B3] space-y-2">
        <div className="flex items-center justify-center gap-4 text-[#667085]">
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/security" className="hover:text-indigo-600 transition-colors">Security Whitepaper</Link>
          <span>·</span>
          <Link href="/status" className="hover:text-indigo-600 transition-colors">System Status</Link>
        </div>
        <p className="text-[11px] text-[#98A2B3]">
          FollowFlow uses cryptographic Ed25519 commit signing and autonomous AWS Bedrock / Strands Agents SDK orchestration.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
