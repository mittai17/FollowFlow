'use client';
import Link from 'next/link';
import {
  ShieldCheck, Clock, Zap, CheckCircle, ArrowRight,
  Brain, FileCheck, Trophy, Sparkles, MessageSquare, Lock, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/index';
import FollowFlowLogo from '@/components/ui/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Navigation / Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center">
            <FollowFlowLogo size={42} subtitle="Autonomous Commitment Network" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-[#667085] hover:text-[#111827] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              Open Workspace
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            The AI employee that remembers what you promised
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight leading-tight mb-6">
            Keep your promises.
            <br />
            <span className="text-indigo-600">Let AI handle the follow-through.</span>
          </h1>

          <p className="text-lg text-[#667085] leading-relaxed mb-8">
            FollowFlow is an autonomous AI operations agent that tracks commitments, monitors deadlines,
            chases missing evidence, verifies completion, and builds a transparent, verifiable record of follow-through.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/commitments?new=true"
              className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              Create a Commitment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-white border border-[#E4E7EC] text-[#111827] rounded-xl font-bold text-sm hover:bg-[#F7F8FA] transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-indigo-600" /> Explore Live Dashboard
            </Link>
          </div>
        </div>

        {/* Hero 3 Bento Cards (Section 48) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="hover:border-indigo-200 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">1. Remember</h3>
            <p className="text-sm text-[#667085] leading-relaxed">
              AI detects and extracts structured commitments from natural language messages, emails, and conversations automatically.
            </p>
          </Card>

          <Card className="hover:border-indigo-200 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">2. Follow Through</h3>
            <p className="text-sm text-[#667085] leading-relaxed">
              Autonomous background agent calculates deadline risks, schedules checks, and dispatches smart, contextual follow-ups.
            </p>
          </Card>

          <Card className="hover:border-indigo-200 transition-all hover:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">3. Verify</h3>
            <p className="text-sm text-[#667085] leading-relaxed">
              Never claims done without evidence. The agent inspects code repositories, documents, and deliverables to confirm completion.
            </p>
          </Card>
        </div>

        {/* Section 49: Proof, Not Promises */}
        <div className="bg-white border border-[#E4E7EC] rounded-[24px] p-8 md:p-12 mb-20 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Verifiable Execution</span>
            <h2 className="text-3xl font-black text-[#111827] tracking-tight mt-1 mb-3">Proof, not promises.</h2>
            <p className="text-[#667085] text-sm leading-relaxed">
              FollowFlow doesn't ask people to simply claim they finished. It verifies evidence whenever possible, ensuring high-trust accountability across teams and networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Promise', desc: '"I will submit my open-source agent by Friday"', icon: MessageSquare, color: 'text-indigo-600' },
              { step: '02', title: 'Evidence', desc: 'GitHub repository or release document required', icon: FileCheck, color: 'text-cyan-600' },
              { step: '03', title: 'Verification', desc: 'Agent inspects repository, commits, and README', icon: ShieldCheck, color: 'text-emerald-600' },
              { step: '04', title: 'Trusted Completion', desc: '+1.0 points added to verifiable Reliability Score', icon: Trophy, color: 'text-purple-600' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#E4E7EC]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#98A2B3]">{item.step}</span>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h4 className="font-bold text-[#111827] text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-[#667085] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 50: Accountability without the noise */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Social Trust Layer</span>
            <h2 className="text-3xl font-black text-[#111827] tracking-tight mt-1 mb-2">Accountability without the noise.</h2>
            <p className="text-[#667085] text-sm">
              A social network built around follow-through, not endless scrolling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Public Commitment</span>
                <span className="text-xs text-[#98A2B3]">Due in 4 days</span>
              </div>
              <h4 className="font-bold text-[#111827] text-base mb-1">Rahul Kumar</h4>
              <p className="text-sm text-[#4B5563] mb-4">"Publish open-source AI agent project on GitHub with full documentation."</p>
              <div className="flex items-center justify-between text-xs text-[#667085] border-t border-[#E4E7EC] pt-3">
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Evidence: GitHub Repo
                </span>
                <span className="font-bold text-indigo-600">3 Supporters</span>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">✓ Verified Complete</span>
                <span className="text-xs text-[#98A2B3]">Verified 3d ago</span>
              </div>
              <h4 className="font-bold text-[#111827] text-base mb-1">Ananya Sharma</h4>
              <p className="text-sm text-[#4B5563] mb-4">"Shipped technical architecture RFC for enterprise payment gateway."</p>
              <div className="flex items-center justify-between text-xs text-[#667085] border-t border-[#E4E7EC] pt-3">
                <span className="text-[#667085]">Verified by FollowFlow Agent</span>
                <span className="font-bold text-purple-600">100% Score</span>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Community Challenge</span>
                <span className="text-xs text-[#98A2B3]">1,284 Members</span>
              </div>
              <h4 className="font-bold text-[#111827] text-base mb-1">30-Day Builder Challenge</h4>
              <p className="text-sm text-[#4B5563] mb-4">Build and ship for at least 1 hour every day for 30 consecutive days.</p>
              <div className="flex items-center justify-between text-xs text-[#667085] border-t border-[#E4E7EC] pt-3">
                <span className="font-medium text-indigo-600">Current Leader: 27d streak</span>
                <Link href="/challenges" className="text-indigo-600 font-bold hover:underline">Join →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Footer */}
        <div className="text-center py-12 border-t border-[#E4E7EC]">
          <h3 className="text-2xl font-bold text-[#111827] mb-3">Ready to experience autonomous follow-through?</h3>
          <p className="text-sm text-[#667085] mb-6">Explore the full autonomous workflow or jump directly to the live dashboard.</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/commitments?new=true"
              className="px-6 py-3 bg-white border border-[#E4E7EC] text-[#111827] font-bold text-sm rounded-xl hover:bg-[#F7F8FA]"
            >
              Create a Commitment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
