import React from 'react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicAppHeader() {
  return (
    <header className="bg-card text-foreground p-4 flex justify-between items-center flex-wrap">
      <Link href="/" className="text-[var(--font-size-xl)] font-bold">
        whatcha-doin
      </Link>
      <div className="flex items-center gap-4">
        <AnimatedThemeToggler />
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </header>
  );
}
