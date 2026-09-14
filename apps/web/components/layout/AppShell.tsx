'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, CheckSquare, MessageSquare, Trophy,
  Compass, User, Activity, CheckCircle2, ShieldCheck,
  Settings, RefreshCw, Zap, Plus, Menu, X, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FollowFlowLogo, { FollowFlowIcon } from '@/components/ui/Logo';

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

const mobileBottomNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/commitments', label: 'Commitments', icon: CheckSquare },
  { href: '/feed', label: 'Feed', icon: Compass },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // If on landing page, render clean full-width experience
  if (pathname === '/') {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* ── Mobile Top Bar (visible on < md) ─────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-b border-[#E4E7EC] flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="flex items-center">
          <FollowFlowLogo size={28} showWordmark={true} />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/commitments?new=true"
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> New
          </Link>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-1.5 rounded-lg border border-[#E4E7EC] text-[#667085] hover:bg-gray-50"
            aria-label="Toggle navigation menu"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Slide-out Drawer Overlay (visible on < md when open) ─── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] mb-4">
                <div className="flex items-center">
                  <FollowFlowLogo size={32} showWordmark={true} />
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#667085]" />
                </button>
              </div>

              <div className="mb-4">
                <Link
                  href="/commitments?new=true"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Make a Commitment
                </Link>
              </div>

              <nav className="space-y-4 overflow-y-auto max-h-[50vh]">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#98A2B3] px-2 mb-1">Commitments</p>
                  <div className="space-y-0.5">
                    {primaryNav.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                          pathname === href ? 'bg-indigo-600 text-white' : 'text-[#667085] hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-[#98A2B3] px-2 mb-1">AI Operations</p>
                  <div className="space-y-0.5">
                    {agentNav.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                          pathname === href ? 'bg-indigo-600 text-white' : 'text-[#667085] hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            <div className="border-t border-[#E4E7EC] pt-3">
              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#667085]"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Fixed Sidebar (hidden on < md, visible on md+) ──────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E4E7EC] flex-col z-40">
        <div className="px-5 py-4 border-b border-[#E4E7EC]">
          <Link href="/dashboard" className="block">
            <FollowFlowLogo size={34} subtitle="Commitment Network" />
          </Link>
          <div className="mt-2.5 pt-2 border-t border-[#E4E7EC]/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px] font-bold text-[#111827] truncate max-w-[130px]">FollowFlow Labs</span>
            </div>
            <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">Enterprise</span>
          </div>
        </div>

        <div className="p-3">
          <Link
            href="/commitments?new=true"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
          >
            <Plus className="w-3.5 h-3.5" /> Make a Commitment
          </Link>
        </div>

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

        <div className="px-3 pb-3 border-t border-[#E4E7EC] pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#98A2B3] px-2 pt-0.5 font-medium">
            <Link href="/status" className="hover:text-indigo-600 transition-colors">Status</Link>
            <span>·</span>
            <Link href="/security" className="hover:text-indigo-600 transition-colors">Security</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/support" className="hover:text-indigo-600 transition-colors">Support</Link>
          </div>
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
              <div className="truncate max-w-[120px]">
                <p className="text-xs font-bold text-[#111827] truncate">Rahul Kumar</p>
                <p className="text-[10px] text-indigo-600 font-mono font-bold">@rahulk</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">96.5%</span>
              <span className="text-[9px] text-[#98A2B3] block">Reliability</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Content Area (Offset for desktop sidebar, and for mobile top/bottom bars) ── */}
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation Bar (hidden on md+, visible on mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-t border-[#E4E7EC] flex items-center justify-around px-2 z-40">
        {mobileBottomNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                active ? 'text-indigo-600' : 'text-[#667085] hover:text-[#111827]'
              )}
            >
              <Icon className={cn('w-4 h-4', active && 'stroke-[2.5]')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
