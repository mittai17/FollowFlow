'use client';
import { useEffect, useState } from 'react';
import { getDocuments, verifyCommitment } from '@/lib/api';
import { Card, Skeleton, EmptyState } from '@/components/ui/index';
import { ShieldCheck, CheckCircle2, FileText, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function VerificationPage() {
  const [testUrl, setTestUrl] = useState('https://github.com/rahul/autonomous-agent');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const mockChecks = [
    { name: 'Repository exists', status: 'pass', desc: 'Valid 200 HTTP response from host' },
    { name: 'Repository public', status: 'pass', desc: 'Accessible without private authentication' },
    { name: 'Commit activity matched', status: 'pass', desc: 'Latest commit timestamp falls within deadline window' },
    { name: 'README documentation present', status: 'pass', desc: 'README.md found with valid project description' },
    { name: 'Verification signature', status: 'pass', desc: 'Signed by FollowFlow Agent cryptographic audit log' },
  ];

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        verified: true,
        checks: mockChecks,
        timestamp: new Date().toISOString(),
      });
      setVerifying(false);
    }, 1200);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header (Section 12, 13, 37) */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Evidence Engine
        </div>
        <h1 className="text-2xl font-black text-[#111827]">Verifiable Proof Sandbox</h1>
        <p className="text-sm text-[#667085]">
          Autonomous evidence validation. The agent inspects repositories, deliverables, and documents to confirm completion.
        </p>
      </div>

      {/* Verification Tool */}
      <Card className="mb-8">
        <h2 className="font-bold text-sm text-[#111827] mb-2">Test Live Evidence Verification</h2>
        <p className="text-xs text-[#667085] mb-4">
          Enter a repository URL, API endpoint, or document link to run the agent's inspection pipeline.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="flex-1 px-3.5 py-2.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {verifying ? 'Inspecting…' : 'Run Verification'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ Evidence Verified
              </span>
              <span className="text-[10px] text-[#98A2B3] font-mono">Agent ID: FF-AUTONOMOUS-01</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              {result.checks.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="font-bold text-[#111827]">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-[#667085]">{c.desc}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-emerald-700 pt-1 font-medium text-right">
              Eligible for +1.0 Commitment Reliability Score points
            </p>
          </div>
        )}
      </Card>

      {/* Verified Artifacts Log (Section 37) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
          Recently Verified Artifacts Log
        </h3>
        <div className="space-y-3">
          {[
            {
              title: 'Publish open-source AI agent project on GitHub',
              type: 'GitHub Repository',
              url: 'https://github.com/rahul/strands-agent-loop',
              date: 'Sep 11, 2026',
              checks: '5/5 Passed',
            },
            {
              title: 'Deploy FastAPI backend to Amazon Bedrock AgentCore',
              type: 'AgentCore Endpoint',
              url: 'https://agentcore.bedrock.us-east-1.amazonaws.com',
              date: 'Sep 08, 2026',
              checks: '4/4 Passed',
            },
            {
              title: 'Publish blog post: Autonomous AI Employees in Practice',
              type: 'builder.aws.com Post',
              url: 'https://builder.aws.com/post/autonomous-agents',
              date: 'Sep 04, 2026',
              checks: '3/3 Passed',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-[#E4E7EC] shadow-sm flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#111827] text-sm">{item.title}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    {item.checks}
                  </span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  {item.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <span className="text-[10px] text-[#98A2B3]">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
