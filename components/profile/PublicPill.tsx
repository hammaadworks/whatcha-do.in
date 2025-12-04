// components/profile/PublicPill.tsx
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PublicPillProps {
  isPublicPreviewMode: boolean;
  onTogglePublicPreview: (checked: boolean) => void;
}

export const PublicPill: React.FC<PublicPillProps> = ({ isPublicPreviewMode, onTogglePublicPreview }) => {
  return (
    <div className="absolute -top-3 left-4 z-10">
      <div className="flex items-center justify-center bg-card rounded-full p-1 shadow-md border border-border">
        <button
          type="button"
          className={cn(
            "px-4 py-1 text-sm font-medium rounded-full transition-colors",
            {
              "bg-muted text-foreground": !isPublicPreviewMode,
              "text-muted-foreground hover:bg-muted": isPublicPreviewMode,
            }
          )}
          onClick={() => onTogglePublicPreview(false)}
        >
          Private
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-1 text-sm font-medium rounded-full transition-colors",
            {
              "bg-primary text-primary-foreground": isPublicPreviewMode,
              "text-muted-foreground hover:bg-muted": !isPublicPreviewMode,
            }
          )}
          onClick={() => onTogglePublicPreview(true)}
        >
          Public
        </button>
      </div>
    </div>
  );
};
