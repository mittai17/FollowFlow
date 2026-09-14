'use client';
import { cn, getStatusColor, getRiskColor, getStatusLabel } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', getStatusColor(status))}>
      {getStatusLabel(status)}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getRiskColor(risk))}>
      {risk === 'critical' ? '🔴' : risk === 'high' ? '🟠' : risk === 'medium' ? '🟡' : '🟢'} {risk}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-indigo-500' : value >= 25 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className={cn('h-1.5 bg-gray-100 rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-100 rounded-lg', className)} />;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-[20px] border border-[#E4E7EC] p-5', className)}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-sm text-[#667085] max-w-xs">{description}</p>
    </div>
  );
}

export * from './LoadingElements';
export * from './LoadingScreen';
export * from './TopProgressBar';
