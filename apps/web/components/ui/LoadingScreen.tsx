'use client';

export function LoadingScreen({ message = 'Loading workspace...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F8FA] p-6 animate-in fade-in duration-200">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-cyan-400/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"></div>

      <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* Animated Brand Mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20 animate-bounce duration-1000">
            <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
                <circle cx="12" cy="12" r="2.5" className="fill-cyan-400 stroke-none animate-ping" />
              </svg>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>

        {/* Wordmark & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-[#111827] tracking-tight">
            Follow<span className="text-indigo-600">Flow</span>
          </h2>
          <p className="text-xs font-semibold text-[#667085]">{message}</p>
        </div>

        {/* Laser Progress Bar */}
        <div className="w-48 h-1.5 bg-[#E4E7EC] rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 rounded-full w-24 animate-[shimmer_1.4s_infinite_linear] [background-size:200%_100%]"></div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3] font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AWS Bedrock AgentCore · Sub-millisecond sync</span>
        </div>
      </div>
    </div>
  );
}
