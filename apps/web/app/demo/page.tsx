'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { streamDemo, resetDemo } from '@/lib/api';
import {
  Zap, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck,
  Clock, ExternalLink, Sparkles, AlertTriangle
} from 'lucide-react';

const STEP_EVENT_ICONS: Record<string, string> = {
  commitment_created: '📝',
  evidence_requirement_detected: '🧠',
  verification_scheduled: '📅',
  deadline_approaching: '⏰',
  evidence_not_found: '🔍',
  followup_dispatched: '📧',
  user_response_received: '📨',
  commitment_rescheduled: '🔄',
  evidence_submitted: '📦',
  evidence_verified: '🛡️',
  status_verified: '✅',
  score_updated: '📈',
  feed_published: '🌐',
  profile_updated: '🏆',
  workflow_completed: '🎉',
};

const WORKFLOW_PIPELINE = [
  'Detect', 'Understand', 'Create Workflow', 'Set Deadline',
  'Monitor', 'Check Evidence', 'Follow Up', 'Re-evaluate',
  'Verify Completion', 'Update Trust Profile', 'Complete'
];

interface DemoStepCard {
  step: number | string;
  title: string;
  description: string;
  event_type: string;
  timestamp: string;
  data: Record<string, any>;
  uid: number;
}

export default function DemoPage() {
  const [steps, setSteps] = useState<DemoStepCard[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState<'Normal' | 'Fast' | 'Instant Demo'>('Fast');
  const [resetting, setResetting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useRef(0);

  async function handleReset() {
    setResetting(true);
    try {
      await resetDemo();
      setSteps([]);
      setDone(false);
      setError('');
    } catch {}
    setResetting(false);
  }

  function handleStart() {
    if (running) return;
    setRunning(true);
    setDone(false);
    setError('');
    setSteps([]);

    streamDemo(
      (data) => {
        if (data.error) {
          setError(data.error);
          setRunning(false);
          return;
        }
        setSteps((prev) => {
          const card: DemoStepCard = { ...data, uid: uid.current++ };
          const next = [...prev, card];
          setTimeout(() => {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
          }, 40);
          return next;
        });
      },
      () => {
        setRunning(false);
        setDone(true);
      },
      speed
    );
  }

  const commitmentId = steps.find((s) => s.data?.commitment_id)?.data?.commitment_id;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header & Hackathon Badge (Section 46) */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>DEMO MODE — 15-STEP AUTONOMOUS WORKFLOW</span>
          </div>

          {/* Speed Controls (Section 46) */}
          <div className="flex items-center gap-1 bg-white border border-[#E4E7EC] rounded-xl p-1 text-xs">
            <span className="text-[#667085] px-2 font-semibold">Speed:</span>
            {(['Normal', 'Fast', 'Instant Demo'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  speed === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#667085] hover:text-[#111827]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#111827]">Autonomous Commitment Simulator</h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Follow the agent execute all 15 steps autonomously: detect commitment → set deadline → monitor evidence → follow up via SMTP → verify proof → update trust profile.
        </p>
      </div>

      {/* Autonomous Pipeline Visualization */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2">
        {WORKFLOW_PIPELINE.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-700 whitespace-nowrap">
              {step}
            </div>
            {i < WORKFLOW_PIPELINE.length - 1 && <ArrowRight className="w-3 h-3 text-[#98A2B3] flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={handleStart}
          disabled={running || resetting}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Agent Executing…
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> {steps.length > 0 ? 'Run Again' : 'Run Autonomous Commitment Demo'}
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={running || resetting}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E4E7EC] text-[#111827] rounded-xl text-xs font-semibold hover:bg-[#F7F8FA] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting…' : 'Reset Simulator'}
        </button>

        {commitmentId && (
          <Link
            href={`/commitments/${commitmentId}`}
            className="flex items-center gap-1.5 px-4 py-3 text-indigo-600 font-bold text-xs hover:underline"
          >
            View Commitment Detail <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <div className="ml-auto text-xs text-[#667085] flex items-center gap-1.5 bg-white border border-[#E4E7EC] px-3 py-2 rounded-xl">
          <span>📧 Follow-up emails captured at</span>
          <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-0.5">
            localhost:8025 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial Empty State */}
      {!running && steps.length === 0 && !error && (
        <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-[24px] p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-4 text-2xl font-bold">
            🤖
          </div>
          <h3 className="text-lg font-bold text-[#111827] mb-2">Ready to Demonstrate Follow-Through</h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed mb-6">
            Click <strong>Run Autonomous Commitment Demo</strong> to witness the full 15-step cycle. Every step writes to Supabase, checks evidence against real criteria, and simulates communication.
          </p>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
          >
            Start Demonstration
          </button>
        </div>
      )}

      {/* Steps Streaming Log */}
      {steps.length > 0 && (
        <div
          ref={containerRef}
          className="max-h-[620px] overflow-y-auto space-y-3 pr-1 pb-4 scroll-smooth"
        >
          {steps.map((s) => {
            const isFinished = s.event_type === 'workflow_completed';
            const isVerified = s.event_type === 'evidence_verified';
            const isFollowup = s.event_type === 'followup_dispatched';

            return (
              <div
                key={s.uid}
                className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
                  isFinished
                    ? 'bg-emerald-50 border-emerald-300'
                    : isVerified
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isFollowup
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-[#E4E7EC]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isFinished
                        ? 'bg-emerald-600 text-white'
                        : isVerified
                        ? 'bg-emerald-500 text-white'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {s.step}
                  </div>

                  <span className="text-xl flex-shrink-0">{STEP_EVENT_ICONS[s.event_type] || '•'}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-xs font-bold ${
                          isFinished ? 'text-emerald-900' : 'text-[#111827]'
                        }`}
                      >
                        {s.title}
                      </h4>
                      <span className="text-[10px] text-[#98A2B3] flex-shrink-0">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#667085] leading-relaxed whitespace-pre-line">
                      {s.description}
                    </p>

                    {s.data && Object.keys(s.data).length > 0 && (
                      <details className="mt-2 text-[10px]">
                        <summary className="text-indigo-600 font-medium cursor-pointer hover:underline">
                          View Structured Agent Payload
                        </summary>
                        <pre className="mt-1 p-2 bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg text-[#667085] overflow-x-auto max-h-24">
                          {JSON.stringify(s.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {running && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-indigo-900">
                FollowFlow Agent evaluating next state…
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completion Banner */}
      {done && (
        <div className="mt-6 p-6 rounded-[24px] bg-emerald-50 border-2 border-emerald-300 text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-black">All 15 Autonomous Steps Completed!</h3>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed mb-4">
            The commitment was detected from text, tracked through deadlines, followed up automatically without human nagging, verified against real GitHub evidence, and contributed +1.0 points to Rahul Kumar's reliability profile.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/profile"
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              View Updated Profile (95% Score) →
            </Link>
            <Link
              href="/feed"
              className="px-4 py-2 bg-white border border-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-50"
            >
              Check Community Feed →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
