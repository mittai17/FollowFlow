import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

export default function TermsPage() {
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
            Legal & Governance
          </span>
          <span className="text-[10px] text-[#98A2B3]">Last Updated: September 2026</span>
        </div>
        <h1 className="text-3xl font-black text-[#111827]">Enterprise Terms of Service</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Master service agreement governing autonomous commitment tracking, evidence verification, and team SLA reliability.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#475467] space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">1. Acceptance and Purpose</h2>
          <p>
            By authenticating or interacting with FollowFlow (the "Service"), whether through the web interface, API, or autonomous agent integrations (e.g. AWS Bedrock AgentCore, Strands Agents SDK), your organization ("Customer") agrees to be bound by these Terms of Service. FollowFlow provides autonomous commitment detection, workflow milestone monitoring, and objective proof verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">2. Autonomous Agent Discretion & Verification Policy</h2>
          <p>
            FollowFlow operates an autonomous agent loop (Observe → Reason → Act → Wait → Verify). A commitment cannot be marked fulfilled by subjective assertion alone. Fulfillments require cryptographic, version-controlled, or verifiable third-party artifacts (such as merged GitHub PRs, AWS CloudWatch 0-alarm health states, or S3 deliverable uploads).
          </p>
          <div className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs space-y-1.5">
            <p className="font-bold text-[#111827]">SLA Safeguards & Non-Punitive Rescheduling:</p>
            <p>
              Commitments transparently rescheduled prior to deadline expiry with legitimate technical reasons are non-penalizing. The autonomous agent will pause follow-ups until the revised horizon.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">3. Connected Third-Party Integrations</h2>
          <p>
            When Customer connects GitHub, Slack, Notion, LinkedIn, Jira, AWS, or Google Workspace accounts, Customer authorizes FollowFlow to perform read-only verification queries against specified repositories, channels, and logs. FollowFlow maintains zero credential persistence; access tokens are transmitted securely over TLS 1.3 and scoped strictly to evidence audits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">4. Reliability Profiles & Public Badges</h2>
          <p>
            Public trust profiles and verified achievement badges earned through FollowFlow are tied to cryptographic audit hashes. FollowFlow guarantees that public reliability scores are computed deterministically based on published scoring rubrics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">5. Data Ownership and Compliance</h2>
          <p>
            Customer retains all rights, title, and interest in and to their proprietary code, design documents, and specifications submitted as proof artifacts. FollowFlow does not use customer commitment data to train public foundation models.
          </p>
        </section>
      </div>
    </div>
  );
}
