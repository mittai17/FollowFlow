import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export default function PrivacyPage() {
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
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
            Data Protection & GDPR
          </span>
          <span className="text-[10px] text-[#98A2B3]">Effective: September 2026</span>
        </div>
        <h1 className="text-3xl font-black text-[#111827]">Privacy Policy & Data Security</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          How FollowFlow collects, secures, and safeguards customer commitments, evidence artifacts, and organizational telemetry.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#475467] space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">1. Zero-Retention Telemetry & Credentials</h2>
          <p>
            FollowFlow adheres to a strict principle of least privilege. When evaluating evidence via third-party providers (GitHub, AWS, Slack, Notion):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>We do not store source code or repository contents permanently.</li>
            <li>Only the audit metadata (commit hash, PR status, timestamp, author handle) is logged.</li>
            <li>Tokens and authorization headers are never logged to stdout or persistent databases.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">2. Data Encryption and Storage</h2>
          <p>
            All data at rest is encrypted using AES-256 GCM. Data in transit is enforced through TLS 1.3 encryption. Evidence documents uploaded to the FollowFlow vault are stored in encrypted object storage with time-limited signed URLs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">3. Organizational Visibility & Privacy Scopes</h2>
          <p>
            Commitment privacy is strictly enforced across three scopes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl">
              <span className="font-bold text-[#111827] block mb-1">Private Scope</span>
              <span className="text-[#667085]">Visible exclusively to the commitment owner and personal agent.</span>
            </div>
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <span className="font-bold text-purple-900 block mb-1">Team / Shared Scope</span>
              <span className="text-purple-700">Restricted to members within the authorized organization and team.</span>
            </div>
            <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl">
              <span className="font-bold text-cyan-900 block mb-1">Public Scope</span>
              <span className="text-cyan-800">Published to the verifiable community trust feed and builder profile.</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">4. Foundation Model Isolation</h2>
          <p>
            FollowFlow utilizes private Amazon Bedrock endpoints and local Ollama inference. Customer workflow data is never used to train or fine-tune public foundation models.
          </p>
        </section>
      </div>
    </div>
  );
}
