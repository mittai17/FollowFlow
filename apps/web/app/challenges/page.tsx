'use client';
import { useEffect, useState } from 'react';
import { getChallenges, joinChallenge, type Challenge } from '@/lib/api';
import { Card, Skeleton, EmptyState } from '@/components/ui/index';
import { Trophy, Users, Flame, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});

  async function load() {
    try {
      const data = await getChallenges();
      setChallenges(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleJoin(id: string) {
    try {
      await joinChallenge(id, 'Rahul Kumar');
      setJoinedMap((prev) => ({ ...prev, [id]: true }));
      load();
    } catch {}
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header (Section 20 & 35) */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Commitment Challenges
        </div>
        <h1 className="text-2xl font-black text-[#111827]">Structured Accountability Sprints</h1>
        <p className="text-sm text-[#667085]">
          Form habits, maintain streaks, and execute daily commitments with verifiable proof.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64" />
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState icon="🏆" title="No active challenges" description="Check back soon for new community challenges." />
      ) : (
        <div className="space-y-8">
          {challenges.map((c) => {
            const isJoined = joinedMap[c.id];

            return (
              <div
                key={c.id}
                className="bg-white rounded-[24px] border border-[#E4E7EC] p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Challenge Title & Stats */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        Active Challenge
                      </span>
                      <span className="text-xs text-[#667085] flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" /> Top streak: {c.top_streak} days
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-[#111827] mb-2">{c.title}</h2>
                    <p className="text-sm text-[#667085] max-w-2xl">{c.description}</p>
                  </div>

                  <button
                    onClick={() => handleJoin(c.id)}
                    disabled={isJoined}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isJoined
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isJoined ? '✓ Joined Challenge' : 'Join Challenge'}
                  </button>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] text-center">
                  <div>
                    <span className="text-2xl font-black text-[#111827] block">{c.participant_count}</span>
                    <span className="text-xs text-[#667085]">Participants</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-indigo-600 block">{c.completion_rate}%</span>
                    <span className="text-xs text-[#667085]">Completion Rate</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-amber-600 block">{c.top_streak} Days</span>
                    <span className="text-xs text-[#667085]">Record Streak</span>
                  </div>
                </div>

                {/* 30-Day Streak Tracker Visualizer (Section 20) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
                    Daily Proof Tracker (First 30 Days)
                  </h3>
                  <div className="grid grid-cols-10 md:grid-cols-15 gap-1.5">
                    {[...Array(30)].map((_, day) => {
                      const dayNum = day + 1;
                      const completed = dayNum <= 18; // Rahul's 18 day streak
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded-lg text-center text-[10px] font-bold border transition-all ${
                            completed
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-[#F7F8FA] text-[#98A2B3] border-[#E4E7EC]'
                          }`}
                          title={`Day ${dayNum}: ${completed ? 'Verified' : 'Upcoming'}`}
                        >
                          D{dayNum} {completed && '✓'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leaderboard Section (Section 20 & 35) */}
                <div className="border-t border-[#E4E7EC] pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
                    Commitment Streak Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {c.members && c.members.length > 0 ? (
                      c.members.map((m, rank) => (
                        <div
                          key={m.id || rank}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] text-xs font-semibold"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center font-bold text-[#98A2B3]">#{rank + 1}</span>
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {m.user_name.charAt(0)}
                            </div>
                            <span className="text-[#111827]">{m.user_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-mono font-bold">{m.streak}/30 days ✓</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#667085]">No participants yet.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
