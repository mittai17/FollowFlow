'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring
    console.error('Unhandled FollowFlow Exception:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-[24px] border border-[#E4E7EC] shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
            Internal Application Exception
          </span>
          <h1 className="text-2xl font-black text-[#111827]">Operational Interruption</h1>
          <p className="text-xs text-[#667085] leading-relaxed">
            The autonomous execution runtime encountered an unexpected state. Our telemetry service has recorded this incident.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-[#98A2B3] pt-1">
              Incident Trace ID: <span className="font-semibold text-gray-700">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-evaluate State
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#E4E7EC] text-[#111827] rounded-xl text-xs font-semibold hover:bg-[#F7F8FA] transition-colors flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#667085]" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
