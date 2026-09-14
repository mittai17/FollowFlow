'use client';
import { useState } from 'react';
import { extractCommitment, type CommitmentResult } from '@/lib/api';
import { Card } from '@/components/ui/index';
import { Settings as SettingsIcon, Send, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [testMsg, setTestMsg] = useState('I will send the tax certificate by end of Friday');
  const [result, setResult] = useState<CommitmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function test() {
    setLoading(true);
    try { const r = await extractCommitment(testMsg); setResult(r); } catch {}
    setLoading(false);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
        <p className="text-sm text-[#667085] mt-0.5">Configuration and testing tools</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-[#111827] text-sm">System Config</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Backend API', 'http://localhost:8000', 'emerald'],
              ['LLM Provider', 'Ollama (qwen2.5:1.5b)', 'indigo'],
              ['Database', 'Supabase PostgreSQL', 'blue'],
              ['Email', 'Mailpit :8025', 'amber'],
              ['Agent SDK', 'AWS Strands v1.55.1', 'purple'],
            ].map(([k, v, c]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-[#E4E7EC]">
                <span className="text-[#667085]">{k}</span>
                <span className={`font-medium text-${c}-600`}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[#111827] text-sm mb-4">Test Commitment Extractor</h2>
          <textarea value={testMsg} onChange={e => setTestMsg(e.target.value)} rows={3}
            className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 mb-3 resize-none" />
          <button onClick={test} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            <Send className="w-3.5 h-3.5" /> {loading ? 'Extracting…' : 'Extract Commitment'}
          </button>
          {result && (
            <div className="mt-3 p-3 bg-[#F7F8FA] rounded-xl text-xs">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`w-3.5 h-3.5 ${result.is_commitment ? 'text-emerald-500' : 'text-[#98A2B3]'}`} />
                <span className="font-semibold">{result.is_commitment ? 'Commitment detected!' : 'Not a commitment'}</span>
                <span className="text-[#98A2B3]">({Math.round(result.confidence * 100)}% confidence)</span>
              </div>
              {result.is_commitment && (
                <div className="space-y-1 text-[#667085]">
                  {result.person && <p><strong>Person:</strong> {result.person}</p>}
                  {result.commitment && <p><strong>Will:</strong> {result.commitment}</p>}
                  {result.deadline && <p><strong>By:</strong> {result.deadline}</p>}
                  {result.evidence_required && <p><strong>Evidence:</strong> {result.evidence_required}</p>}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
