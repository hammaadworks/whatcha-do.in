import { notFound } from 'next/navigation';
import { getUserByUsernameServer } from '@/lib/supabase/user.server';
import PrivatePage from '@/components/profile/PrivatePage.tsx';
import { fetchPublicActionsServer } from '@/lib/supabase/actions.server'; // Use server-side actions
import { fetchPublicHabitsServer } from '@/lib/supabase/habit.server'; // Use server-side habits
import { fetchPublicJournalEntriesServer } from '@/lib/supabase/journal.server'; // Use server-side journal
import { PublicUserDisplay, ActionNode, Habit, JournalEntry } from '@/lib/supabase/types';

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  if (username === 'not-found') {
    notFound();
  }

  const user: PublicUserDisplay | null = await getUserByUsernameServer(username);

  if (!user) {
    notFound();
  }

  // Fetch public actions and habits for this user on the server
  let publicActions: ActionNode[] = [];
  let privateCount = 0;
  let publicHabits: Habit[] = [];
  let publicJournalEntries: JournalEntry[] = [];

  try {
    const actionsResult = await fetchPublicActionsServer(user.id);
    publicActions = actionsResult.actions;
    privateCount = actionsResult.privateCount;
    publicHabits = await fetchPublicHabitsServer(user.id);
    publicJournalEntries = await fetchPublicJournalEntriesServer(user.id);
  } catch (error) {
    console.error("Error fetching public data for profile page:", error);
    // Continue with empty arrays if there's an error
  }


  return (
    <PrivatePage
      username={username}
      initialProfileUser={user}
      publicActions={publicActions}
      publicHabits={publicHabits}
      publicJournalEntries={publicJournalEntries}
      privateCount={privateCount}
    />
  );
}