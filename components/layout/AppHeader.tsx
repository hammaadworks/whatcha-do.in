import React from 'react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';

interface AppHeaderProps {
  isAuthenticated?: boolean;
}

export default function AppHeader({ isAuthenticated = false }: AppHeaderProps) {
  return (
    <header className="bg-card text-foreground p-4 flex justify-between items-center flex-wrap">
      <Link href="/dashboard" className="text-[var(--font-size-xl)] font-bold">
        whatcha-doin
      </Link>
      <div className="flex items-center gap-4">
        <AnimatedThemeToggler />
        {isAuthenticated && <LogoutButton />}
      </div>
    </header>
  );
}
