'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { InsightsBentoGrid } from '@/components/shared/InsightsBentoGrid';
import { BarChart3 } from 'lucide-react';

interface InsightsTriggerProps {
  username: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const InsightsTrigger: React.FC<InsightsTriggerProps> = ({
  username,
  children,
  className,
  variant = "outline",
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant={variant} className={className}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Insights
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="bg-background border-l border-card-border p-6 w-full sm:max-w-lg lg:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-extrabold text-foreground">{username}'s Insights</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <InsightsBentoGrid />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InsightsTrigger;
