"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { InsightsBentoGrid } from '@/components/shared/InsightsBentoGrid';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook

interface InsightsTriggerProps {
  username: string; // Keep username for title, but we'll get userId for data fetching
  children?: React.ReactNode;
  className?: string;
  open?: boolean; // New prop for controlled open state
  onOpenChange?: (open: boolean) => void; // New prop for controlled open state
}

const InsightsTrigger: React.FC<InsightsTriggerProps> = ({
  username,
  children,
  className,
  open, // Destructure new open prop
  onOpenChange, // Destructure new onOpenChange prop
}) => {
  const { user, loading } = useAuth(); // Use the useAuth hook

  // Extract userId from the user object returned by useAuth
  // Assuming user.id is the userId, based on common patterns and schema context
  const userId = user?.id; 

  // If loading or no user, we might not be able to show insights,
  // or we might show a placeholder/login prompt. For now, pass undefined userId.
  // The InsightsBentoGrid handles userId being undefined.

  return (
    <Sheet open={open} onOpenChange={onOpenChange}> {/* Pass open and onOpenChange to Sheet */}
      <SheetTrigger asChild>
        <div>
          {children ? (
            children
          ) : (
            <Button variant="outline" className={className}> {/* Default to outline or handle variant prop */}
              <BarChart3 className="mr-2 h-4 w-4" />
              View Insights
            </Button>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background border-l border-card-border p-6 w-full sm:max-w-lg lg:max_w-2xl overflow-y-auto">
        <SheetHeader>
          {/* Use username for the title */}
          <SheetTitle className="text-2xl font-extrabold text-foreground">{username}'s Insights</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          {/* Pass the userId obtained from useAuth to InsightsBentoGrid */}
          {/* If loading or no user, userId will be undefined, and InsightsBentoGrid will handle it */}
          <InsightsBentoGrid userId={userId} /> 
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InsightsTrigger;