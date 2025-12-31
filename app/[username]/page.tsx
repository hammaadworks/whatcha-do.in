import {notFound} from 'next/navigation';
import {getUserByUsernameServer} from '@/lib/supabase/user.server';
import {PrivatePage} from '@/components/profile/PrivatePage'; // Import from the correct path
import {PublicProfileThemeWrapper} from '@/components/profile/PublicProfileThemeWrapper'; // Import theme wrapper
import {fetchPublicActionsServer} from '@/lib/supabase/actions.server'; // Use server-side actions
import {fetchPublicHabitsServer} from '@/lib/supabase/habit.server'; // Use server-side habits
import {fetchPublicJournalEntriesServer} from '@/lib/supabase/journal.server'; // Use server-side journal
import {fetchPublicIdentitiesServer} from '@/lib/supabase/identities.server'; // Use server-side identities
import {fetchPublicTargetsServer} from '@/lib/supabase/targets.server'; // Use server-side targets
import { getCurrentMonthStartISO, getReferenceDateServer } from "@/lib/date";
import {ActionNode, Habit, Identity, JournalEntry, PublicUserDisplay} from '@/lib/supabase/types';
import { cookies } from "next/headers";
import { SIMULATED_DATE_COOKIE } from "@/lib/constants";

type ProfilePageProps = {
    params: Promise<{
        username: string;
    }>;
};

/**
 * Server Component for the dynamic user profile route (`/[username]`).
 * 
 * Responsibilities:
 * 1. Resolves the `username` from the URL.
 * 2. Fetches public data (User profile, Habits, Actions, etc.) on the server for SEO and performance.
 * 3. Passes this initial data to the client-side `PrivatePage` component.
 * 4. Handles 404s if the user does not exist.
 */
export default async function ProfilePage({params}: ProfilePageProps) {
    const {username} = await params;

    if (username === 'not-found') {
        notFound();
    }

    const user: PublicUserDisplay | null = await getUserByUsernameServer(username);

    if (!user) {
        notFound();
    }

    // Determine reference date for Time Travel (if applicable)
    const cookieStore = await cookies();
    const simulatedDateCookie = cookieStore.get(SIMULATED_DATE_COOKIE)?.value;
    const refDate = getReferenceDateServer(simulatedDateCookie);

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
        const currentMonthDate = getCurrentMonthStartISO(user.timezone || 'UTC', refDate);
        const targetsResult = await fetchPublicTargetsServer(user.id, currentMonthDate);
        publicTargets = targetsResult.targets;

    } catch (error) {
        console.error("Error fetching public data for profile page:", error);
        // Continue with empty arrays if there's an error
    }


    return (
        <PublicProfileThemeWrapper initialTheme={user.active_theme} username={username}>
            <PrivatePage
                username={username}
                initialProfileUser={user}
                publicActions={publicActions}
                publicHabits={publicHabits}
                publicJournalEntries={publicJournalEntries}
                publicIdentities={publicIdentities}
                publicTargets={publicTargets}
                privateCount={privateCount}
            />
        </PublicProfileThemeWrapper>
    );
}