import Link from 'next/link';
import { ArrowLeft, AlertCircle, Bot, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

export default function DisclaimerPage() {
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
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
            AI Ethics & Autonomy Boundaries
          </span>
          <span className="text-[10px] text-[#98A2B3]">Operational Standard</span>
        </div>
        <h1 className="text-3xl font-black text-[#111827]">Agentic AI Transparency & Disclaimer</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Operational boundaries, human-in-the-loop safeguards, and automated evidence auditing principles.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#475467] space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">1. What FollowFlow Autonomous Agents Do</h2>
          <p>
            FollowFlow agents are engineered to maintain workflow continuity by eliminating the friction of dropped promises. Agents continuously observe deadlines, analyze connected evidence streams, draft follow-up notifications, and compute reliability metrics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">2. Human-in-the-Loop Safeguards (Ambiguity Stop Rule)</h2>
          <p>
            In accordance with the <strong>Observe → Reason → Act → Wait → Verify</strong> architecture, the agent never takes irrevocable or speculative actions when evidence is contradictory or ambiguous.
          </p>
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-900">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> When The Agent Pauses:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>When evidence URL returns non-200 or missing repository permissions.</li>
              <li>When evidence confidence score falls below 85%.</li>
              <li>When conflicting deliverables are uploaded by multiple team members.</li>
              <li>In these scenarios, the agent immediately pauses, logs the reason, and routes an Approval Card to the Human Operator.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#111827]">3. Evidence Objectivity Guarantee</h2>
          <p>
            No user or team administrator can manually "override" a commitment status to verified without presenting verifiable evidence. This ensures that FollowFlow reliability scores remain a trusted, tamper-resistant indicator across teams and organizations.
          </p>
        </section>
      </div>
    </div>
  );
}
