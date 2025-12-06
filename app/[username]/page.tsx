import {notFound} from 'next/navigation';
import {getUserByUsernameServer} from '@/lib/supabase/user.server';
import PrivatePage from '@/components/profile/PrivatePage'; // Import from the correct path
import {fetchPublicActionsServer} from '@/lib/supabase/actions.server'; // Use server-side actions
import {fetchPublicHabitsServer} from '@/lib/supabase/habit.server'; // Use server-side habits
import {fetchPublicJournalEntriesServer} from '@/lib/supabase/journal.server'; // Use server-side journal
import {fetchPublicIdentitiesServer} from '@/lib/supabase/identities.server'; // Use server-side identities
import {fetchPublicTargetsServer} from '@/lib/supabase/targets.server'; // Use server-side targets
import {getMonthStartDate} from '@/lib/date'; // Import date helper
import {ActionNode, Habit, Identity, JournalEntry, PublicUserDisplay} from '@/lib/supabase/types';

type ProfilePageProps = {
    params: Promise<{
        username: string;
    }>;
};

export default async function ProfilePage({params}: ProfilePageProps) {
    const {username} = await params;

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
    let publicIdentities: (Identity & { backingCount: number })[] = [];
    let publicTargets: ActionNode[] = [];

    try {
        const actionsResult = await fetchPublicActionsServer(user.id);
        publicActions = actionsResult.actions;
        privateCount = actionsResult.privateCount;
        publicHabits = await fetchPublicHabitsServer(user.id);
        publicJournalEntries = await fetchPublicJournalEntriesServer(user.id);
        publicIdentities = await fetchPublicIdentitiesServer(user.id);

        // Fetch current month targets
        const currentMonthDate = getMonthStartDate(0, user.timezone || 'UTC');
        const targetsResult = await fetchPublicTargetsServer(user.id, currentMonthDate);
        publicTargets = targetsResult.targets;

    } catch (error) {
        console.error("Error fetching public data for profile page:", error);
        // Continue with empty arrays if there's an error
    }


    return (<PrivatePage
            username={username}
            initialProfileUser={user}
            publicActions={publicActions}
            publicHabits={publicHabits}
            publicJournalEntries={publicJournalEntries}
            publicIdentities={publicIdentities}
            publicTargets={publicTargets}
            privateCount={privateCount}
        />);
}