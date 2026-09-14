'use client';
import { useState, useRef } from 'react';
import { streamDemo, resetDemo, type DemoStep } from '@/lib/api';
import { Zap, RefreshCw, CheckCircle, Clock, ArrowRight, AlertTriangle } from 'lucide-react';

const STEP_EVENT_ICONS: Record<string, string> = {
  case_created: '📋',
  requirements_identified: '📝',
  documents_received: '📄',
  message_received: '📨',
  promise_detected: '🧠',
  promise_created: '⏰',
  followup_scheduled: '📅',
  deadline_reached: '⏰',
  followup_sent: '📧',
  promise_updated: '🔄',
  verification_started: '🔍',
  documents_verified: '✅',
  conflict_detected: '⚠️',
  human_decision_required: '🛑',
  human_decision_made: '✅',
  agent_resumed: '🤖',
  case_completed: '🎉',
};

const WORKFLOW = [
  'Detect', 'Understand', 'Plan', 'Act',
  'Wait', 'Monitor', 'Re-evaluate', 'Escalate', 'Complete'
];

interface StepCard extends DemoStep {
  uid: number;
}

export default function DemoPage() {
  const [steps, setSteps] = useState<StepCard[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useRef(0);

  async function handleReset() {
    setResetting(true);
    try { await resetDemo(); setSteps([]); setDone(false); setError(''); } catch {}
    setResetting(false);
  }

  function handleStart() {
    if (running) return;
    setRunning(true); setDone(false); setError(''); setSteps([]);

    streamDemo(
      (data) => {
        if ((data as any).error) { setError((data as any).error); setRunning(false); return; }
        setSteps(prev => {
          const card: StepCard = { ...data, uid: uid.current++ };
          const next = [...prev, card];
          setTimeout(() => {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
          }, 50);
          return next;
        });
      },
      () => { setRunning(false); setDone(true); }
    );
  }

  const caseId = steps.find(s => s.data?.case_id)?.data?.case_id as string | undefined;
  const summary = steps.find(s => s.event_type === 'case_completed')?.data?.summary as Record<string, number> | undefined;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full mb-3">
          <Zap className="w-3 h-3 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">LIVE DEMO MODE</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">Vendor Onboarding Demo</h1>
        <p className="text-sm text-[#667085] mt-0.5">
          A real, end-to-end vendor onboarding workflow — 14 autonomous steps with a human decision in the middle.
          Nothing is faked. Every action writes to the real database.
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {WORKFLOW.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700">{step}</div>
            {i < WORKFLOW.length - 1 && <ArrowRight className="w-3 h-3 text-[#98A2B3]" />}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleStart}
          disabled={running || resetting}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
        >
          {running ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Agent Running…</>
          ) : (
            <><Zap className="w-4 h-4" /> {steps.length > 0 ? 'Run Again' : 'Start Demo'}</>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={running || resetting}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E4E7EC] text-[#111827] rounded-xl font-medium hover:bg-[#F7F8FA] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Clearing…' : 'Reset Data'}
        </button>
        {caseId && (
          <a href={`/cases/${caseId}`} target="_blank"
            className="flex items-center gap-2 px-4 py-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View Case →
          </a>
        )}
        <p className="text-xs text-[#98A2B3] ml-auto">
          📧 Emails visible at <a href="http://localhost:8025" target="_blank" className="text-indigo-500 underline">localhost:8025</a> (Mailpit)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!running && steps.length === 0 && !error && (
        <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-[20px] p-12 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-lg font-bold text-[#111827] mb-2">Ready to demonstrate</h2>
          <p className="text-sm text-[#667085] max-w-md mx-auto">
            Click <strong>Start Demo</strong> to run a complete vendor onboarding case.
            The agent will autonomously detect promises, verify documents, send follow-ups,
            detect a conflict, and ask for your decision — all in real time.
          </p>
        </div>
      )}

      {/* Steps stream */}
      {steps.length > 0 && (
        <div ref={containerRef} className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
          {steps.map((step) => {
            const isComplete = step.event_type === 'case_completed';
            const isHuman = step.event_type === 'human_decision_required';
            const isHumanDone = step.event_type === 'human_decision_made';

            return (
              <div
                key={step.uid}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all animate-in slide-in-from-bottom-2 duration-300 ${
                  isComplete ? 'bg-emerald-50 border-emerald-300' :
                  isHuman ? 'bg-amber-50 border-amber-300' :
                  isHumanDone ? 'bg-blue-50 border-blue-200' :
                  'bg-white border-[#E4E7EC]'
                }`}
              >
                {/* Step number */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isComplete ? 'bg-emerald-500 text-white' :
                  isHuman ? 'bg-amber-500 text-white' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {typeof step.step === 'number' ? step.step : '✓'}
                </div>

                {/* Icon */}
                <div className="text-xl flex-shrink-0">
                  {STEP_EVENT_ICONS[step.event_type] || '•'}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isComplete ? 'text-emerald-800' : isHuman ? 'text-amber-900' : 'text-[#111827]'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-[#667085] mt-0.5 whitespace-pre-line">{step.description}</p>
                  {step.data && Object.keys(step.data).length > 0 && step.event_type !== 'case_completed' && (
                    <details className="mt-1.5">
                      <summary className="text-[10px] text-[#98A2B3] cursor-pointer hover:text-indigo-500">view data</summary>
                      <pre className="mt-1 text-[10px] bg-[#F7F8FA] rounded p-2 overflow-x-auto text-[#667085] max-h-24">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-[#98A2B3] flex-shrink-0">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}

          {/* Running indicator */}
          {running && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-indigo-700">Agent working…</p>
              <div className="flex gap-1 ml-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Summary */}
      {done && summary && (
        <div className="mt-6 p-6 bg-emerald-50 border-2 border-emerald-300 rounded-[20px]">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-emerald-900">Demo Complete!</h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-emerald-700">{val}</p>
                <p className="text-xs text-emerald-600 capitalize">{key.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          {caseId && (
            <a href={`/cases/${caseId}`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              View Complete Case →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
