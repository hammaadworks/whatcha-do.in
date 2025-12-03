// components/profile/OwnerProfileView.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import ActionsSection from '@/components/profile/sections/ActionsSection';
import HabitsSection from '@/components/profile/sections/HabitsSection';
import JournalSection from '@/components/profile/sections/JournalSection';
import MotivationsSection from '@/components/profile/sections/MotivationsSection';
import { useActions } from '@/hooks/useActions';
import { useAuth } from '@/hooks/useAuth';
import { updateUserTimezone } from '@/lib/supabase/user.client';
import { User } from '@/hooks/useAuth';
import { PublicPage } from '@/components/profile/PublicPage';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { fetchOwnerHabits } from '@/lib/supabase/habit';
import { fetchPublicActions } from '@/lib/supabase/actions';
import { fetchJournalEntries } from '@/lib/supabase/journal'; // Import fetchJournalEntries
import { Habit, ActionNode, JournalEntry } from '@/lib/supabase/types'; // Import JournalEntry

interface OwnerProfileViewProps {
  username: string;
  initialProfileUser: User;
  publicActions: ActionNode[];
  publicHabits: Habit[];
  publicJournalEntries: JournalEntry[];
  privateCount?: number; // Add privateCount
}

export default function OwnerProfileView({ username, initialProfileUser, publicActions, publicHabits, publicJournalEntries, privateCount = 0 }: Readonly<OwnerProfileViewProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authenticatedUser } = useAuth();

  const [optimisticTimezone, setOptimisticTimezone] = useState<string | null>(null);
  const [isPublicPreviewMode, setIsPublicPreviewMode] = useState(false);
  
  // No longer need states for public preview data as they come from props
  // const [publicActions, setPublicActions] = useState<ActionNode[]>([]);
  // const [publicHabits, setPublicHabits] = useState<Habit[]>([]);
  // const [publicJournalEntries, setPublicJournalEntries] = useState<JournalEntry[]>([]);
  // const [publicDataLoading, setPublicDataLoading] = useState(false); // No longer needed

  // States for owner's private data
  const [ownerHabits, setOwnerHabits] = useState<Habit[]>([]);
  const [ownerHabitsLoading, setOwnerHabitsLoading] = useState(false);
  const [ownerJournalEntries, setOwnerJournalEntries] = useState<JournalEntry[]>([]);
  const [ownerJournalEntriesLoading, setOwnerJournalEntriesLoading] = useState(false);
  // Motivations are static for now, so no loading state needed

  const profileToDisplay = authenticatedUser || initialProfileUser;

  const {
    actions,
    loading: actionsLoading,
    addAction,
    toggleAction,
    updateActionText,
    deleteAction,
    indentAction,
    outdentAction,
    moveActionUp,
    moveActionDown,
    toggleActionPrivacy, // Destructure new handler
  } = useActions(
    true,
    optimisticTimezone || profileToDisplay?.timezone || 'UTC'
  );

  const handleTimezoneChange = async (newTimezone: string) => {
    if (authenticatedUser?.id) {
      setOptimisticTimezone(newTimezone);
      try {
        await updateUserTimezone(authenticatedUser.id, newTimezone);
      } catch (error) {
        console.error("Failed to update timezone", error);
        setOptimisticTimezone(null);
      }
    }
  };

  // Sync isPublicPreviewMode with URL query parameter
  useEffect(() => {
    setIsPublicPreviewMode(searchParams.get('preview') === 'true');
  }, [searchParams]);

  // No longer need to fetch public data in this component as they come from props

  // Fetch owner's private data when not in public preview mode
  useEffect(() => {
    if (!isPublicPreviewMode && authenticatedUser?.id) {
      // Fetch owner habits
      setOwnerHabitsLoading(true);
      fetchOwnerHabits(authenticatedUser.id)
        .then(setOwnerHabits)
        .catch(err => console.error("Failed to fetch owner habits:", err))
        .finally(() => setOwnerHabitsLoading(false));

      // Fetch owner journal entries
      setOwnerJournalEntriesLoading(true);
      fetchJournalEntries(authenticatedUser.id)
        .then(setOwnerJournalEntries)
        .catch(err => console.error("Failed to fetch owner journal entries:", err))
        .finally(() => setOwnerJournalEntriesLoading(false));
    }
  }, [isPublicPreviewMode, authenticatedUser?.id]);


  // Function to toggle preview mode and update URL
  const handleTogglePreview = useCallback((checked: boolean) => {
    setIsPublicPreviewMode(checked);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (checked) {
      newSearchParams.set('preview', 'true');
    } else {
      newSearchParams.delete('preview');
    }
    router.replace(`/${username}?${newSearchParams.toString()}`);
  }, [router, searchParams, username]);

  if (!profileToDisplay) {
    return <div>Error: User profile not found for owner.</div>;
  }

  return (
    <>
      <ProfileLayout
        username={username}
        bio={profileToDisplay.bio ?? null}
        isOwner={true}
        timezone={optimisticTimezone || profileToDisplay.timezone}
        onTimezoneChange={handleTimezoneChange}
      >
        <div className="flex items-center space-x-2 my-4 justify-end">
          <Label htmlFor="public-preview-mode">Public Preview</Label>
          <Switch
            id="public-preview-mode"
            checked={isPublicPreviewMode}
            onCheckedChange={handleTogglePreview}
          />
        </div>

        {isPublicPreviewMode ? (
            <PublicPage
              user={profileToDisplay}
              publicActions={publicActions}
              publicHabits={publicHabits}
              publicJournalEntries={publicJournalEntries}
              privateCount={privateCount} // Pass privateCount
            />
        ) : (
          <>
            <ActionsSection
              isOwner={true}
              actions={actions}
              loading={actionsLoading}
              onActionToggled={toggleAction}
              onActionAdded={addAction}
              onActionUpdated={updateActionText}
              onActionDeleted={deleteAction}
              onActionIndented={indentAction}
              onActionOutdented={outdentAction}
              onActionMovedUp={moveActionUp}
              onActionMovedDown={moveActionDown}
              onActionPrivacyToggled={toggleActionPrivacy} // Pass new handler
            />
            <HabitsSection
              isOwner={true}
              habits={ownerHabits}
              loading={ownerHabitsLoading}
            />
            <JournalSection
              isOwner={true}
              journalEntries={ownerJournalEntries}
              loading={ownerJournalEntriesLoading}
            />
            <MotivationsSection
              username={username}
              isOwner={true}
              loading={false}
            />
          </>
        )}
      </ProfileLayout>
    </>
  );
}
