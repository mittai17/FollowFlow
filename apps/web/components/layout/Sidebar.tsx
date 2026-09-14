'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, MessageSquare, FileText,
  CheckCircle, Activity, Bot, Settings, RefreshCw, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/cases', label: 'Cases', icon: Briefcase },
  { href: '/promises', label: 'Promises', icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/approvals', label: 'Approvals', icon: CheckCircle },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/agent', label: 'Agent', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E4E7EC] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E4E7EC]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#111827] text-lg tracking-tight">FollowFlow</span>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-[#667085]">Agent Online</span>
        </div>
      </div>

      {/* Demo Banner */}
      <Link href="/demo" className="mx-3 mt-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-colors">
        <Zap className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
        <span className="text-xs font-medium text-indigo-700">Run Live Demo</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
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
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-[#E4E7EC] pt-3">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#667085] hover:text-[#111827] hover:bg-[#F7F8FA] transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <div className="mt-2 px-3 py-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">A</div>
          <div>
            <p className="text-xs font-medium text-[#111827]">Demo Account</p>
            <p className="text-[10px] text-[#98A2B3]">Hackathon Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
