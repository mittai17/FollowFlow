'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, MessageSquare, Trophy,
  Compass, User, Activity, CheckCircle2, ShieldCheck,
  Settings, RefreshCw, Zap, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/commitments', label: 'My Commitments', icon: CheckSquare },
  { href: '/promises', label: 'Promises', icon: MessageSquare },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/feed', label: 'Feed', icon: Compass },
  { href: '/profile', label: 'Profile', icon: User },
];

const agentNav = [
  { href: '/activity', label: 'Agent Activity', icon: Activity },
  { href: '/approvals', label: 'Approvals', icon: CheckCircle2 },
  { href: '/verification', label: 'Verification', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E4E7EC] flex flex-col z-40">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-[#E4E7EC]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#111827] text-base tracking-tight block">FollowFlow</span>
            <span className="text-[10px] text-[#667085] font-medium leading-none block">Commitment Network</span>
          </div>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#667085] font-medium">Agent Autonomous</span>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">AWS</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <Link
          href="/commitments?new=true"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
        >
          <Plus className="w-3.5 h-3.5" /> Make a Commitment
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1">Commitments</p>
          <div className="space-y-0.5">
            {primaryNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#111827] hover:bg-[#F7F8FA]'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1">AI Operations</p>
          <div className="space-y-0.5">
            {agentNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#111827] hover:bg-[#F7F8FA]'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Profile & Settings */}
      <div className="px-3 pb-3 border-t border-[#E4E7EC] pt-2 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#667085] hover:text-[#111827] hover:bg-[#F7F8FA] transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <Link
          href="/profile"
          className="px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl flex items-center justify-between hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              R
            </div>
            <div>
              <p className="text-xs font-semibold text-[#111827]">Rahul Kumar</p>
              <p className="text-[10px] text-[#667085]">Verified Finisher</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-600">94%</span>
            <span className="text-[9px] text-[#98A2B3] block">Reliability</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
