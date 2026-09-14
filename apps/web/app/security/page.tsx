import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, KeyRound, Server, FileCode, CheckCircle2 } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Application
      </Link>

      <div className="space-y-2 pb-6 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
            Enterprise Security
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            ● SOC2 Type II Aligned
          </span>
        </div>
        <h1 className="text-3xl font-black text-[#111827]">Security Architecture & Compliance</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Zero-trust agent execution, immutable audit ledgers, and Amazon Bedrock security guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#111827]">End-to-End Encryption</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Data at rest is secured via AES-256 GCM encryption. Communications between agent workers, API gateways, and web clients utilize TLS 1.3 with strict HSTS.
          </p>
        </div>

        <div className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#111827]">AWS Bedrock Guardrails</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Autonomous agent tool execution is monitored by AWS Bedrock Guardrails, filtering prompt injections, confidential PII leaks, and unauthorized invocations.
          </p>
        </div>

        <div className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileCode className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#111827]">Immutable Audit Trail</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Every lifecycle transition (created, rescheduled, verified, evaluated) is permanently recorded in the agent event log with actor identifiers and hashes.
          </p>
        </div>

        <div className="p-5 bg-white border border-[#E4E7EC] rounded-[20px] space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#111827]">Zero-Trust Scoped Tokens</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Integration credentials (GitHub, Slack, AWS) are evaluated in ephemeral sandboxes and never persisted as raw tokens in persistent application state.
          </p>
        </div>
      </div>
    </div>
  );
}
