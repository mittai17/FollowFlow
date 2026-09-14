import Link from 'next/link';
import { ShieldCheck, Mail, MessageSquare, Headphones, ArrowLeft, Clock, CheckCircle2, FileText } from 'lucide-react';

export const metadata = {
  title: 'Enterprise Support & SLA Desk — FollowFlow',
  description: 'Enterprise support, priority incident escalation, and SLA commitments for FollowFlow organizations.',
};

export default function SupportPage() {
  const tiers = [
    {
      name: 'Standard Developer',
      response: '< 24 hours',
      channels: ['Email Support', 'Documentation Center', 'GitHub Discussions'],
      sla: 'Standard Community SLA',
      badge: 'Current Plan',
    },
    {
      name: 'Enterprise Organization',
      response: '< 1 hour (Critical P1)',
      channels: ['Dedicated Slack Connect Channel', '24/7 Phone / PagerDuty Escalation', 'Dedicated Technical Account Manager'],
      sla: '99.9% Uptime SLA with Credit Backing',
      badge: 'Production Tier',
      highlighted: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Application
        </Link>

        <div className="border-b border-[#E4E7EC] pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              FollowFlow Support & SLA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Enterprise Support & Escalation
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            24/7 autonomous monitoring assistance, priority escalation, and security reporting.
          </p>
        </div>
      </div>

      {/* Support Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-6 border transition-all ${
              tier.highlighted
                ? 'bg-white border-indigo-500 shadow-md shadow-indigo-50 relative'
                : 'bg-white border-[#E4E7EC] shadow-xs'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Guaranteed Response
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#111827]">{tier.name}</h3>
              <span className="text-xs font-medium text-[#667085]">{tier.badge}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-4">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-[#111827]">Response Time: {tier.response}</span>
            </div>

            <div className="space-y-2 mb-6 text-xs text-[#667085]">
              {tier.channels.map((ch) => (
                <div key={ch} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{ch}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E4E7EC]/60 text-[11px] text-[#98A2B3] flex items-center justify-between">
              <span>{tier.sla}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Channels */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 mb-8 shadow-xs">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">Escalation Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-2">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#111827]">Priority Email Desk</h3>
            <p className="text-[11px] text-[#667085] mt-1">support@followflow.ai</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-2 block">P1-P3 triage within 1 hour</span>
          </div>

          <div className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#111827]">Security & Compliance</h3>
            <p className="text-[11px] text-[#667085] mt-1">security@followflow.ai</p>
            <span className="text-[10px] text-indigo-600 font-semibold mt-2 block">PGP / Vulnerability reports</span>
          </div>

          <div className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-2">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#111827]">Slack Connect</h3>
            <p className="text-[11px] text-[#667085] mt-1">Direct shared channel</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-2 block">Enterprise customers</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-4 text-xs font-medium text-indigo-600 border-t border-[#E4E7EC] pt-6">
        <Link href="/status" className="hover:underline flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Real-time System Status
        </Link>
        <Link href="/security" className="hover:underline flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Security & Trust Whitepaper
        </Link>
        <Link href="/terms" className="hover:underline flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Terms of Service
        </Link>
        <Link href="/disclaimer" className="hover:underline flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> AI Transparency Disclaimer
        </Link>
      </div>
    </div>
  );
}
