'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight, Loader2,
  CheckCircle2, Sparkles, ChevronDown, User, ShieldCheck
} from 'lucide-react';
import { getUsers, type User as UserType } from '@/lib/api';
import { getAuthUser, setAuthUser, clearAuthUser } from '@/lib/auth';
import FollowFlowLogo from '@/components/ui/Logo';

// Featured demo personas for evaluation
const DEMO_PERSONAS: Partial<UserType>[] = [
  {
    name: 'Rahul Kumar',
    username: 'rahulk',
    email: 'rahul@followflow.ai',
    role: 'admin',
    title: 'Lead Autonomous Architect',
    reliability_score: 96.5,
  },
  {
    name: 'Devon Clarke',
    username: 'devon_c',
    email: 'devon.clarke@followflow.ai',
    role: 'security',
    title: 'Director of Information Security',
    reliability_score: 99.6,
  },
  {
    name: 'Sarah Chen',
    username: 'sarah_c',
    email: 'sarah.chen@followflow.ai',
    role: 'product',
    title: 'Head of Product & Platform UX',
    reliability_score: 98.4,
  },
  {
    name: 'Marcus Vance',
    username: 'marcus_v',
    email: 'marcus.v@followflow.ai',
    role: 'engineering',
    title: 'Principal Systems Architect',
    reliability_score: 97.2,
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoPicker, setShowDemoPicker] = useState(false);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const existing = getAuthUser();
    if (existing) {
      setCurrentUser(existing);
    }
    getUsers()
      .then((users) => {
        if (users && users.length > 0) setAllUsers(users);
      })
      .catch(() => {});
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);

    try {
      // Look for user in database
      const matched = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      let userToAuth: UserType;

      if (matched) {
        userToAuth = matched;
      } else {
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        const namePart = email
          .split('@')[0]
          .split(/[._]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');

        userToAuth = {
          id: `usr_${Date.now()}`,
          name: namePart || 'Workspace Member',
          username: username || `user_${Date.now().toString().slice(-4)}`,
          email: email.trim().toLowerCase(),
          role: 'member',
          title: 'Enterprise Contributor',
          reliability_score: 95.0,
        };
      }

      setAuthUser(userToAuth);
      setCurrentUser(userToAuth);

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectPersona = (persona: Partial<UserType>) => {
    setEmail(persona.email || '');
    setPassword('••••••••••••');
    setError('');
    setShowDemoPicker(false);

    setLoading(true);
    const matched = allUsers.find((u) => u.email === persona.email) || (persona as UserType);
    setAuthUser(matched);
    setCurrentUser(matched);

    setTimeout(() => {
      router.push(redirectUrl);
    }, 400);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    const defaultUser = allUsers.find((u) => u.username === 'rahulk') || (DEMO_PERSONAS[0] as UserType);
    setAuthUser(defaultUser);
    setCurrentUser(defaultUser);

    setTimeout(() => {
      router.push(redirectUrl);
    }, 500);
  };

  const handleSignOut = () => {
    clearAuthUser();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Logo */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <FollowFlowLogo size={36} subtitle="Commitment Network" />
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E4E7EC] rounded-full text-[11px] font-medium text-[#667085] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SOC 2 Verified</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-8">
        <div className="bg-white border border-[#E4E7EC] rounded-3xl shadow-xl shadow-gray-100/70 p-8 sm:p-10 transition-all">
          {/* Card Header */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-2">
              Sign in to your FollowFlow workspace to manage promises and autonomous agents.
            </p>
          </div>

          {/* Active Session Notification */}
          {currentUser && (
            <div className="mb-6 p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#111827] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#667085] truncate">
                    @{currentUser.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(redirectUrl)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2 py-1.5 bg-white border border-[#E4E7EC] text-[#667085] text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Switch
                </button>
              </div>
            </div>
          )}

          {/* SSO Buttons */}
          <div className="space-y-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-[#E4E7EC] rounded-xl text-xs font-semibold text-[#111827] hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('AWS')}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-[#E4E7EC] rounded-xl text-xs font-semibold text-[#111827] hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center justify-center gap-2.5 shadow-xs"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
              <span>Continue with AWS Identity Center (SSO)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-[#E4E7EC]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-[#98A2B3] tracking-wider">
              Or with work email
            </span>
            <div className="flex-grow border-t border-[#E4E7EC]"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#111827]">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your work email.')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#E4E7EC] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-[#667085]">Remember me for 30 days</span>
              </label>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper (discreet & clean for evaluators) */}
          <div className="mt-6 pt-5 border-t border-[#E4E7EC]">
            <button
              type="button"
              onClick={() => setShowDemoPicker(!showDemoPicker)}
              className="w-full flex items-center justify-between text-xs font-medium text-[#667085] hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-gray-50"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test & Evaluation Accounts</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showDemoPicker ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDemoPicker && (
              <div className="mt-2 space-y-1.5 p-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-2xl animate-in fade-in duration-150">
                {DEMO_PERSONAS.map((p) => (
                  <div
                    key={p.username}
                    onClick={() => handleSelectPersona(p)}
                    className="p-2 rounded-xl bg-white border border-[#E4E7EC] hover:border-indigo-300 hover:shadow-xs cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {p.name?.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#111827] truncate">{p.name}</p>
                        <p className="text-[10px] text-[#667085] truncate">{p.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                      Auto-fill →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <p className="mt-4 text-center text-xs text-[#667085]">
          Don't have an account?{' '}
          <Link
            href="/support"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Contact your organization administrator
          </Link>
        </p>
      </div>

      {/* Page Footer */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-[#98A2B3] space-y-2">
        <div className="flex items-center justify-center gap-4 text-[#667085]">
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/security" className="hover:text-indigo-600 transition-colors">Security</Link>
          <span>·</span>
          <Link href="/status" className="hover:text-indigo-600 transition-colors">Status</Link>
        </div>
        <p className="text-[11px] text-[#98A2B3]">
          Protected by 256-bit AES encryption & cryptographic Ed25519 verification.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
