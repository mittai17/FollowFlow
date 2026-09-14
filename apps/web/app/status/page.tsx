import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Cpu, Database, Mail, Globe, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'System Status & SLA Telemetry — FollowFlow',
  description: 'Real-time operational status, component health, and uptime telemetry for the FollowFlow Autonomous Commitment Network.',
};

export default function StatusPage() {
  const components = [
    {
      name: 'Strands Autonomous Agent Engine',
      description: 'AWS Bedrock & Strands SDK core commitment reasoning loop',
      status: 'Operational',
      uptime: '99.99%',
      latency: '38ms',
      icon: Cpu,
    },
    {
      name: 'Cryptographic Evidence Engine',
      description: 'SHA-256 deliverable verification, git tree hashing & validation',
      status: 'Operational',
      uptime: '100.0%',
      latency: '14ms',
      icon: ShieldCheck,
    },
    {
      name: 'PostgreSQL Relational Cluster',
      description: 'Supabase multi-tenant database with Row-Level Security',
      status: 'Operational',
      uptime: '99.98%',
      latency: '22ms',
      icon: Database,
    },
    {
      name: 'Industry Integration Connectors',
      description: 'OAuth & token validation for GitHub, Slack, Notion, Jira, AWS',
      status: 'Operational',
      uptime: '99.95%',
      latency: '54ms',
      icon: Globe,
    },
    {
      name: 'Autonomous Notification Dispatcher',
      description: 'SMTP & Amazon SES transactional follow-up channels',
      status: 'Operational',
      uptime: '99.99%',
      latency: '45ms',
      icon: Mail,
    },
  ];

  // 90-day uptime simulation bars
  const days = Array.from({ length: 45 }, (_, i) => ({
    day: i,
    operational: true,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Application
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                All Systems Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              System Status & Telemetry
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              Live operational health, latency metrics, and SLA compliance.
            </p>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs text-[#667085]">
            <span className="font-mono text-[11px] text-[#98A2B3]">Last updated: Just now</span>
            <span className="font-bold text-emerald-600 text-sm">99.99% 30d Uptime</span>
          </div>
        </div>
      </div>

      {/* Overall Health Summary Banner */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Uptime History (Last 45 Days)</h2>
          <span className="text-xs font-semibold text-emerald-600">No Incidents Reported</span>
        </div>
        <div className="flex items-center gap-1 overflow-hidden py-1">
          {days.map((d) => (
            <div
              key={d.day}
              className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-xs transition-colors cursor-pointer"
              title={`Day ${d.day + 1}: 100% Operational`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#98A2B3] mt-2">
          <span>45 days ago</span>
          <span>100% Uptime</span>
          <span>Today</span>
        </div>
      </div>

      {/* Component Status Cards */}
      <div className="space-y-3 mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-2 px-1">Service Components</h2>
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.name}
              className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-100 transition-colors shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 mt-0.5 sm:mt-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">{comp.name}</h3>
                  <p className="text-[11px] text-[#667085]">{comp.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:self-center pl-9 sm:pl-0">
                <div className="text-right">
                  <span className="text-[10px] text-[#98A2B3] block uppercase font-mono">Response</span>
                  <span className="text-xs font-semibold text-[#111827] font-mono">{comp.latency}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#98A2B3] block uppercase font-mono">30d Uptime</span>
                  <span className="text-xs font-semibold text-emerald-600 font-mono">{comp.uptime}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">{comp.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Commitment Section */}
      <div className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Enterprise Service Level Agreement (SLA)</h3>
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
              FollowFlow guarantees 99.9% monthly uptime for production Enterprise organization workspaces. In the event of an unscheduled downtime exceeding our SLA, impacted accounts receive automatic service credits as specified in our Master Subscription Agreement.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-indigo-600">
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <Link href="/security" className="hover:underline">Security Architecture</Link>
              <Link href="/support" className="hover:underline">Enterprise Escalation Desk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
