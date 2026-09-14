'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({
  size = 'md',
  color = 'indigo',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'indigo' | 'white' | 'cyan' | 'gray';
  className?: string;
}) {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorMap = {
    indigo: 'text-indigo-600',
    white: 'text-white',
    cyan: 'text-cyan-500',
    gray: 'text-[#98A2B3]',
  };

  return (
    <Loader2
      className={cn('animate-spin shrink-0', sizeMap[size], colorMap[color], className)}
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-[bounce_1s_infinite_100ms]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-[bounce_1s_infinite_200ms]"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-[bounce_1s_infinite_300ms]"></span>
    </span>
  );
}

export function LoadingOverlay({
  message = 'Processing...',
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-2xl flex items-center gap-3.5 max-w-sm w-full mx-4">
        <LoadingSpinner size="md" />
        <div className="text-left">
          <p className="font-bold text-xs text-[#111827]">{message}</p>
          <p className="text-[10px] text-[#667085]">Communicating with autonomous loop</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingPulse({
  label = 'Online',
  color = 'emerald',
}: {
  label?: string;
  color?: 'emerald' | 'amber' | 'indigo';
}) {
  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600',
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
      <span className="relative flex h-2 w-2">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colorMap[color])}></span>
        <span className={cn('relative inline-flex rounded-full h-2 w-2', colorMap[color])}></span>
      </span>
      <span>{label}</span>
    </span>
  );
}

export function LoadingCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] shadow-xs space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-100 rounded-md"></div>
            <div className="h-4 w-12 bg-gray-100 rounded-full"></div>
          </div>
          <div className="h-5 w-3/4 bg-gray-100 rounded-md"></div>
          <div className="h-3 w-full bg-gray-100 rounded-md"></div>
          <div className="h-3 w-2/3 bg-gray-100 rounded-md"></div>
          <div className="pt-3 border-t border-[#E4E7EC] flex justify-between">
            <div className="h-3 w-16 bg-gray-100 rounded-md"></div>
            <div className="h-3 w-20 bg-gray-100 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
