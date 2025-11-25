'use client';

import React from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const AppFooter = () => {
  const { canInstall, promptInstall } = usePWAInstall();

  return (
    <footer className="text-center p-4 bg-card border-t border-card-border text-muted-foreground text-sm">
      &copy; {new Date().getFullYear()} whatcha-doin. All rights reserved.
      {canInstall && (
        <>
          <span className="mx-2">|</span>
          <button onClick={promptInstall} className="text-primary hover:underline focus:outline-none">
            Install PWA
          </button>
        </>
      )}
    </footer>
  );
};

export default AppFooter;
