'use client';

import React from 'react';
import InsightsTrigger from '@/components/shared/InsightsTrigger';
import { Button } from '@/components/ui/button';

interface MotivationsSectionProps {
  username: string;
}

const MotivationsSection: React.FC<MotivationsSectionProps> = ({ username }) => {
  return (
    <div className="section mb-10">
      <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
        <h2 className="text-2xl font-extrabold">Motivations</h2>
        <InsightsTrigger username={username} />
      </div>
      <div
        className="motivational-quote-card relative overflow-hidden rounded-3xl p-10 text-center border border-primary animate-pulse-glow text-white dark:text-black"
        style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%) animate-rotate-light opacity-30"></div>
        <p className="quote-text text-3xl font-extrabold leading-tight mb-4 relative z-10 text-shadow-sm">
          <q>Work on your dreams as if your life depends on it. Because it does.</q>
        </p>
        <p className="quote-source text-lg font-semibold opacity-80 relative z-10">
          — Unknown
        </p>
      </div>
    </div>
  );
};

export default MotivationsSection;
