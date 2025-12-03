// components/layout/SettingsDrawer.tsx
"use client";

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TimezoneSelector } from '@/components/profile/TimezoneSelector';
import { EditProfileForm } from '@/components/profile/EditProfileForm'; // Import EditProfileForm
import { useAuth } from '@/hooks/useAuth';
import { updateUserTimezone } from '@/lib/supabase/user.client';
import { toast } from 'sonner'; // Switch to sonner for consistency

interface SettingsDrawerProps {
  children: React.ReactNode;
}

export function SettingsDrawer({ children }: SettingsDrawerProps) {
  const { user, refreshUser } = useAuth();
  const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }
    if (newTimezone === user.timezone) {
      return;
    }

    setIsUpdatingTimezone(true);
    try {
      await updateUserTimezone(user.id, newTimezone);
      toast.success("Timezone updated successfully!");
      refreshUser();
    } catch (error) {
      console.error("Failed to update timezone:", error);
      toast.error("Failed to update timezone.");
    } finally {
      setIsUpdatingTimezone(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your profile and application preferences.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-8">
          {/* Profile Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Profile</h3>
            <EditProfileForm />
          </section>

          {/* Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Preferences</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Timezone
                </label>
                <TimezoneSelector
                currentTimezone={user?.timezone || 'UTC'}
                onTimezoneChange={handleTimezoneChange}
                />
                {isUpdatingTimezone && (
                    <p className="text-xs text-muted-foreground">Updating timezone...</p>
                )}
                <p className="text-[0.8rem] text-muted-foreground">
                    Your timezone determines when your "Day" starts and ends.
                </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}