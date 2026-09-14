'use client';
import { useEffect, useState } from 'react';
import { getAgentStatus, type AgentStatus } from '@/lib/api';
import { Card, Skeleton } from '@/components/ui/index';
import { getRelativeTime } from '@/lib/utils';
import { Bot, CheckCircle, Activity, Clock, Wrench } from 'lucide-react';

export default function AgentPage() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => getAgentStatus().then(setStatus).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const tools = status?.tools || [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Agent</h1>
        <p className="text-sm text-[#667085] mt-0.5">FollowFlow autonomous agent status and capabilities</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">FollowFlow Agent</p>
              <p className="text-xs text-[#667085]">Strands Agents SDK v1.55.1</p>
            </div>
          </div>

          {loading ? <Skeleton className="h-32" /> : status ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-[#E4E7EC]">
                <span className="text-sm text-[#667085]">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm font-semibold text-[#111827] capitalize">{status.status}</span>
                </div>
              </div>
              {status.current_case && (
                <div className="flex items-center justify-between py-2.5 border-b border-[#E4E7EC]">
                  <span className="text-sm text-[#667085]">Working on</span>
                  <span className="text-sm font-medium text-indigo-600 truncate max-w-[140px]">{status.current_case}</span>
                </div>
              )}
              {status.current_action && (
                <div className="py-2.5 border-b border-[#E4E7EC]">
                  <p className="text-xs text-[#667085] mb-1">Current Action</p>
                  <p className="text-xs text-[#111827]">{status.current_action}</p>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5 border-b border-[#E4E7EC]">
                <span className="text-sm text-[#667085]">Queue</span>
                <span className="text-sm font-medium text-[#111827]">{status.queue_size} pending</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#E4E7EC]">
                <span className="text-sm text-[#667085]">Scheduled</span>
                <span className="text-sm font-medium text-[#111827]">{status.scheduled_count} actions</span>
              </div>
              {status.last_action_at && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#667085]">Last action</span>
                  <span className="text-xs text-[#98A2B3]">{getRelativeTime(status.last_action_at)}</span>
                </div>
              )}
            </div>
          ) : null}
        </Card>

        {/* Tools */}
        <Card className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-[#111827] text-sm">Agent Tools ({tools.length})</h2>
          </div>
          <p className="text-xs text-[#667085] mb-4">Real Strands SDK tool calls — each one writes to the database or sends real actions</p>
          {loading ? <Skeleton className="h-48" /> : (
            <div className="grid grid-cols-2 gap-2">
              {tools.map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-mono text-[#111827]">{t}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Architecture */}
        <Card className="col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-[#111827] text-sm">Autonomous Agent Loop</h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['🔍 Observe', '🧠 Reason', '⚡ Act', '⏳ Wait', '🔄 Re-evaluate', '🛑 Escalate?', '✅ Complete'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-shrink-0">
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-medium text-indigo-800 whitespace-nowrap">
                  {step}
                </div>
                {i < 6 && <div className="text-[#98A2B3] text-sm">→</div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#667085] mt-3">
            Built with <strong>AWS Strands Agents SDK v1.55.1</strong> · Ollama (local) / Amazon Bedrock (production) · Supabase PostgreSQL · FastAPI
          </p>
        </Card>
      </div>
    </div>
  );
}
