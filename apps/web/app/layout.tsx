import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FollowFlow — Keep your promises. Let AI handle the follow-through.',
  description: 'Autonomous AI commitment network that tracks promises, verifies evidence, and monitors deadlines.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#F7F8FA' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
