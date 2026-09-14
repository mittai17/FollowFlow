import React from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  wordmarkClassName?: string;
}

export function FollowFlowIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  const iconPx = Math.max(16, Math.round(size * 0.62));

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-indigo-200 flex-shrink-0 transition-transform hover:scale-105 duration-200 ${className}`}
      aria-label="FollowFlow Icon"
    >
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {/* Forward loop ribbon 1 (Upper forward loop) */}
        <path
          d="M4 11C4 7.13401 7.13401 4 11 4C14.1 4 16.7 6.1 17.6 9L15.3 9.9C14.7 7.9 13.0 6.5 11 6.5C8.51472 6.5 6.5 8.51472 6.5 11C6.5 12.1 6.9 13.1 7.6 13.9L5.7 15.6C4.6 14.3 4 12.7 4 11Z"
          fill="currentColor"
        />
        {/* Forward loop ribbon 2 (Lower forward loop) */}
        <path
          d="M20 13C20 16.866 16.866 20 13 20C9.9 20 7.3 17.9 6.4 15L8.7 14.1C9.3 16.1 11.0 17.5 13 17.5C15.4853 17.5 17.5 15.4853 17.5 13C17.5 11.9 17.1 10.9 16.4 10.1L18.3 8.4C19.4 9.7 20 11.3 20 13Z"
          fill="currentColor"
          fillOpacity="0.88"
        />
        {/* Upper Arrowhead */}
        <path
          d="M15 4.5L18.5 8L15 11.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lower Arrowhead */}
        <path
          d="M9 19.5L5.5 16L9 12.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Verification node */}
        <circle cx="12" cy="12" r="2.2" fill="#38BDF8" />
        <circle cx="12" cy="12" r="1.0" fill="white" />
      </svg>
    </div>
  );
}

export default function FollowFlowLogo({
  size = 32,
  showWordmark = true,
  subtitle = 'Commitment Network',
  className = '',
  wordmarkClassName = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <FollowFlowIcon size={size} />
      {showWordmark && (
        <div className={`flex flex-col leading-tight ${wordmarkClassName}`}>
          <div className="flex items-center tracking-tight">
            <span className="font-extrabold text-[#111827] text-base">Follow</span>
            <span className="font-extrabold text-indigo-600 text-base">Flow</span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#667085] font-semibold tracking-normal leading-none mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
