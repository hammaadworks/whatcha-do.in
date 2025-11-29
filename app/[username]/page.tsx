import { notFound } from 'next/navigation';
import { getUserByUsernameServer } from '@/lib/supabase/user.server';
import PrivatePage from '@/components/profile/PrivatePage.tsx';
import { fetchPublicActions } from '@/lib/supabase/actions';
import { fetchPublicHabits } from '@/lib/supabase/habit';
import { fetchJournalEntries } from '@/lib/supabase/journal'; // Import fetchJournalEntries
import { PublicUserDisplay, ActionNode, Habit, JournalEntry } from '@/lib/supabase/types'; // Import JournalEntry

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
  let publicHabits: Habit[] = [];
  let publicJournalEntries: JournalEntry[] = []; // Initialize

  try {
    publicActions = await fetchPublicActions(user.id);
    publicHabits = await fetchPublicHabits(user.id);
    publicJournalEntries = await fetchJournalEntries(user.id); // Fetch public journal entries
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
      publicJournalEntries={publicJournalEntries} // Pass publicJournalEntries
    />
  );
}