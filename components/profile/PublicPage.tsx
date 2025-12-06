'use client';

import {ActionNode, Habit, Identity, JournalEntry, PublicUserDisplay} from '@/lib/supabase/types'; // Import ActionNode, Habit, JournalEntry, Identity
import ProfileLayout from '@/components/profile/ProfileLayout';
import ActionsSection from '@/components/profile/sections/ActionsSection';
import HabitsSection from '@/components/profile/sections/HabitsSection';
import JournalSection from '@/components/profile/sections/JournalSection';
import MotivationsSection from '@/components/profile/sections/MotivationsSection';
import IdentitySection from '@/components/profile/sections/IdentitySection'; // Import
import TargetsSection from '@/components/profile/sections/TargetsSection'; // Import
import BioSection from '@/components/profile/sections/BioSection';

type PublicProfileViewProps = {
    user: PublicUserDisplay; publicActions: ActionNode[]; publicHabits: Habit[]; publicJournalEntries: JournalEntry[]; // Add publicJournalEntries
    publicIdentities: (Identity & { backingCount: number })[]; // Add
    publicTargets: ActionNode[]; // Add
    privateCount?: number; // Add privateCount
};

export function PublicPage({
                               user,
                               publicActions,
                               publicHabits,
                               publicJournalEntries,
                               publicIdentities,
                               publicTargets,
                               privateCount = 0
                           }: Readonly<PublicProfileViewProps>) {
    return (<ProfileLayout
            username={user.username || ''}
            isOwner={false}
            timezone={user.timezone} // Pass timezone
        >
            {/* Top row: Bio and Identity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <BioSection
                        username={user.username || ''}
                        bio={user.bio ?? null}
                        isOwner={false}
                        isReadOnly={true}
                    />
                </div>
                <div>
                    <IdentitySection
                        isOwner={false}
                        isReadOnly={true}
                        identities={publicIdentities}
                        ownerHabits={[]}
                    />
                </div>
            </div>

            {/* Middle row: Targets */}
            <div className="mb-8">
                <TargetsSection
                    isOwner={false}
                    isReadOnly={true}
                    timezone={user.timezone || 'UTC'}
                    targets={publicTargets}
                />
            </div>

            <ActionsSection
                isOwner={false}
                actions={publicActions}
                loading={false} // Always false for public page sections
                privateCount={privateCount} // Pass privateCount
                timezone={user.timezone || 'UTC'} // Pass timezone prop
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
        </ProfileLayout>);
}
