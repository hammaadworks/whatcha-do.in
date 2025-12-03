"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ frontContent, backContent, className }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("relative w-full h-full cursor-pointer", className)}
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="absolute w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of the card */}
        <div
          className="absolute w-full h-full rounded-xl bg-card border border-border p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {frontContent}
        </div>

        {/* Back of the card */}
        <div
          className="absolute w-full h-full rounded-xl bg-card border border-primary p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};