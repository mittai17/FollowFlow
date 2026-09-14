'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { prefetchAllCoreData } from '@/lib/api';

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prefetch all core data on initial app mount
    prefetchAllCoreData();
  }, []);

  useEffect(() => {
    // Whenever route or query params change, show micro laser progress
    setLoading(true);
    setProgress(35);
    const t1 = setTimeout(() => setProgress(75), 60);
    const t2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 150);
    }, 120);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 shadow-[0_0_8px_rgba(79,70,229,0.6)] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
