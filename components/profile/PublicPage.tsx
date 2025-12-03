'use client';

import { PublicUserDisplay, ActionNode, Habit, JournalEntry } from '@/lib/supabase/types'; // Import ActionNode, Habit, JournalEntry
import ProfileLayout from '@/components/profile/ProfileLayout';
import ActionsSection from '@/components/profile/sections/ActionsSection';
import HabitsSection from '@/components/profile/sections/HabitsSection';
import JournalSection from '@/components/profile/sections/JournalSection';
import MotivationsSection from '@/components/profile/sections/MotivationsSection';
import { mockPublicActionsData } from '@/lib/mock-data'; // Import mock data

type PublicProfileViewProps = {
  user: PublicUserDisplay;
  publicActions: ActionNode[];
  publicHabits: Habit[];
  publicJournalEntries: JournalEntry[]; // Add publicJournalEntries
  privateCount?: number; // Add privateCount
};

export function PublicPage({ user, publicActions, publicHabits, publicJournalEntries, privateCount = 0 }: Readonly<PublicProfileViewProps>) {
  return (
    <ProfileLayout
      username={user.username || ''}
      bio={user.bio ?? null}
      isOwner={false}
      timezone={user.timezone} // Pass timezone
    >
      <ActionsSection
        isOwner={false}
        actions={publicActions}
        loading={false} // Always false for public page sections
        privateCount={privateCount} // Pass privateCount
      />
      <HabitsSection
        isOwner={false}
        habits={publicHabits}
        loading={false} // Always false for public page sections
      />
      <JournalSection
        isOwner={false}
        journalEntries={publicJournalEntries} // Pass public journal entries
        loading={false} // Always false for public page sections
      />
      <MotivationsSection
        username={user.username || ''}
        isOwner={false} // Always false for public page sections
        loading={false} // Always false for public page sections
      />
    </ProfileLayout>
  );
}
