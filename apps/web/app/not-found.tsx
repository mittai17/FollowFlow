'use client';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, CheckSquare, Search, FileQuestion, LifeBuoy, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">
            Error 404 · Page Not Found
          </span>
          <h1 className="text-2xl font-black text-[#111827]">Resource Unavailable</h1>
          <p className="text-xs text-[#667085] leading-relaxed">
            The destination you requested does not exist or has been relocated within the FollowFlow network.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Return to Dashboard
          </Link>
          <Link
            href="/commitments"
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#E4E7EC] text-[#111827] rounded-xl text-xs font-semibold hover:bg-[#F7F8FA] transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#667085]" /> View Commitments
          </Link>
        </div>

        {/* Quick Links Directory */}
        <div className="pt-6 border-t border-[#E4E7EC] text-xs text-[#667085] space-y-2">
          <p className="font-semibold text-[11px] uppercase text-[#98A2B3] tracking-wider">Useful Enterprise Resources</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/security" className="hover:text-indigo-600 transition-colors">Security & SOC2</Link>
            <span>·</span>
            <Link href="/disclaimer" className="hover:text-indigo-600 transition-colors">AI Disclaimer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
