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
import { LayoutToggleSettings } from '@/components/profile/LayoutToggleSettings'; // Import LayoutToggleSettings
import { useAuth } from '@/hooks/useAuth';
import { updateUserTimezone } from '@/lib/supabase/user.client';
import { toast } from 'sonner'; // Switch to sonner for consistency
import { useSystemTime } from '@/components/providers/SystemTimeProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SettingsDrawerProps {
  children: React.ReactNode;
  isOpen: boolean; // Add isOpen prop
  onOpenChange: (open: boolean) => void; // Add onOpenChange prop
}

export function SettingsDrawer({ children, isOpen, onOpenChange }: SettingsDrawerProps) {
  const { user, refreshUser } = useAuth();
  const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);
  const { simulatedDate, setSystemTime } = useSystemTime();
  const [timeTravelDate, setTimeTravelDate] = useState<string>(
    simulatedDate ? simulatedDate.toISOString().slice(0, 16) : ''
  );

  const handleTimeTravel = () => {
    if (timeTravelDate) {
        const date = new Date(timeTravelDate);
        if (!isNaN(date.getTime())) {
            setSystemTime(date);
            toast.success(`Time Travel Active: ${date.toLocaleString()}`);
        } else {
            toast.error("Invalid date");
        }
    } else {
        setSystemTime(null);
        toast.success("Time Travel Deactivated (Back to Present)");
    }
  };

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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto pointer-events-auto">
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
            
            <LayoutToggleSettings />

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

          {/* Time Travel Section (Dev Only) */}
          {process.env.NEXT_PUBLIC_DEV_USER === user?.username && (
              <section className="space-y-4 border-t pt-4 border-dashed border-yellow-500">
                  <h3 className="text-lg font-medium border-b pb-2 text-yellow-600 flex items-center gap-2">
                      🚧 Time Travel
                  </h3>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label>Simulate Date & Time</Label>
                          <Input
                              type="datetime-local"
                              value={timeTravelDate}
                              onChange={(e) => setTimeTravelDate(e.target.value)}
                          />
                          <p className="text-[0.8rem] text-muted-foreground">
                              Set a fake system time. Affects data fetching and "Today" logic.
                          </p>
                      </div>
                      <div className="flex gap-2">
                          <Button onClick={handleTimeTravel} className="w-full">
                              {timeTravelDate ? "Engage Flux Capacitor ⚡️" : "Reset to Present"}
                          </Button>
                          {simulatedDate && (
                              <Button variant="outline" onClick={() => {
                                  setTimeTravelDate('');
                                  setSystemTime(null);
                                  toast.success("Back to the Future!");
                              }}>
                                  Reset
                              </Button>
                          )}
                      </div>
                      {simulatedDate && (
                          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs font-mono text-yellow-600">
                              Current Sim Time: {simulatedDate.toLocaleString()}
                          </div>
                      )}
                  </div>
              </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}