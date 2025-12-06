// components/profile/OwnerProfileView.tsx
"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import ProfileLayout from '@/components/profile/ProfileLayout';
import ActionsSection from '@/components/profile/sections/ActionsSection';
import HabitsSection from '@/components/profile/sections/HabitsSection';
import JournalSection from '@/components/profile/sections/JournalSection';
import MotivationsSection from '@/components/profile/sections/MotivationsSection';
import {useActions} from '@/hooks/useActions';
import {useAuth, User} from '@/hooks/useAuth';
import {updateUserProfile, updateUserTimezone} from '@/lib/supabase/user.client';
import {PublicPage} from '@/components/profile/PublicPage';
import {toast} from 'sonner';
import {fetchOwnerHabits} from '@/lib/supabase/habit';
import {fetchJournalEntries} from '@/lib/supabase/journal'; // Import fetchJournalEntries
import {ActionNode, Habit, Identity, JournalEntry} from '@/lib/supabase/types'; // Import JournalEntry // Import Identity
import {VibeSelector} from '@/components/profile/VibeSelector'; // Import the new VibeSelector component
import IdentitySection from '@/components/profile/sections/IdentitySection'; // Import IdentitySection
import TargetsSection from '@/components/profile/sections/TargetsSection'; // Import TargetsSection
import BioSection from '@/components/profile/sections/BioSection';

interface OwnerProfileViewProps {
    username: string;
    initialProfileUser: User;
    publicActions: ActionNode[];
    publicHabits: Habit[];
    publicJournalEntries: JournalEntry[];
    publicIdentities: (Identity & { backingCount: number })[]; // Add
    publicTargets: ActionNode[]; // Add
    privateCount?: number; // Add privateCount
}

export default function OwnerProfileView({
                                             username,
                                             initialProfileUser,
                                             publicActions,
                                             publicHabits,
                                             publicJournalEntries,
                                             publicIdentities,
                                             publicTargets,
                                             privateCount = 0
                                         }: Readonly<OwnerProfileViewProps>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {user: authenticatedUser, refreshUser} = useAuth();

    const [optimisticTimezone, setOptimisticTimezone] = useState<string | null>(null);

    const currentViewMode = (searchParams.get('vibe') as 'edit' | 'private' | 'public') || 'edit';
    const isReadOnly = currentViewMode !== 'edit';

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
        undoDeleteAction, // Destructure undoDeleteAction
        indentAction,
        outdentAction,
        moveActionUp,
        moveActionDown,
        toggleActionPrivacy,
        addActionAfter // Destructure new handler
    } = useActions(true, optimisticTimezone || profileToDisplay?.timezone || 'UTC');

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

    const handleBioUpdate = async (newBio: string) => {
        if (!authenticatedUser?.id) return;

        try {
            const {error} = await updateUserProfile(authenticatedUser.id, {
                bio: newBio,
            });

            if (error) throw error;

            toast.success('Bio updated successfully');
            await refreshUser();
        } catch (error) {
            console.error('Failed to update bio:', error);
            toast.error('Failed to update bio');
            throw error;
        }
    };

    // Function to change view mode and update URL
    const handleViewModeChange = useCallback((mode: 'edit' | 'private' | 'public') => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (mode === 'edit') {
            newSearchParams.delete('vibe');
        } else {
            newSearchParams.set('vibe', mode);
        }
        router.replace(`/${username}?${newSearchParams.toString()}`);
    }, [router, searchParams, username]);

    // Default to 'edit' mode if no vibe is set initially
    useEffect(() => {
        if (!searchParams.get('vibe')) {
            router.replace(`/${username}?vibe=edit`);
        }
    }, [searchParams, router, username]);


    // Fetch owner's private data when not in public preview mode
    useEffect(() => {
        if (currentViewMode !== 'public' && authenticatedUser?.id) {
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
    }, [currentViewMode, authenticatedUser?.id]);


    if (!profileToDisplay) {
        return <div>Error: User profile not found for owner.</div>;
    }

    return (<div className="relative pt-8 lg:pt-4">
            <VibeSelector
                currentViewMode={currentViewMode}
                onViewModeChange={handleViewModeChange}
            />

            {currentViewMode === 'public' ? (<div className="animate-in fade-in duration-300">
                    <PublicPage
                        user={profileToDisplay}
                        publicActions={publicActions}
                        publicHabits={publicHabits}
                        publicJournalEntries={publicJournalEntries}
                        publicIdentities={publicIdentities} // Add
                        publicTargets={publicTargets} // Add
                        privateCount={privateCount}
                    />
                </div>) : (<ProfileLayout
                    username={username}
                    isOwner={true} // Always true for owner's view
                    isReadOnly={isReadOnly} // Pass isReadOnly based on current view mode
                    timezone={optimisticTimezone || profileToDisplay.timezone}
                    onTimezoneChange={handleTimezoneChange}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="lg:col-span-1 h-full">
                            <BioSection
                                username={username}
                                bio={profileToDisplay.bio ?? null}
                                isOwner={true}
                                isReadOnly={isReadOnly}
                                onBioUpdate={handleBioUpdate}
                            />
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-6">
                             <IdentitySection isOwner={true} isReadOnly={isReadOnly} ownerHabits={ownerHabits}/>
                             <TargetsSection
                                isOwner={true}
                                isReadOnly={isReadOnly} // Pass isReadOnly
                                timezone={optimisticTimezone || profileToDisplay.timezone || 'UTC'}
                            />
                        </div>
                    </div>

                    <ActionsSection
                        isOwner={true}
                        isReadOnly={isReadOnly} // Pass isReadOnly
                        actions={actions}
                        loading={actionsLoading}
                        onActionToggled={toggleAction}
                        onActionAdded={addAction}
                        onActionUpdated={updateActionText}
                        onActionDeleted={deleteAction}
                        undoDeleteAction={undoDeleteAction} // Pass undoDeleteAction
                        onActionIndented={indentAction}
                        onActionOutdented={outdentAction}
                        onActionMovedUp={moveActionUp}
                        onActionMovedDown={moveActionDown}
                        onActionPrivacyToggled={toggleActionPrivacy}
                        onActionAddedAfter={addActionAfter} // New
                        timezone={optimisticTimezone || profileToDisplay.timezone || 'UTC'} // Pass timezone
                    />
                    <HabitsSection
                        isOwner={true}
                        isReadOnly={isReadOnly} // Pass isReadOnly
                        habits={ownerHabits}
                        loading={ownerHabitsLoading}
                    />
                    <JournalSection
                        isOwner={true}
                        isReadOnly={isReadOnly} // Pass isReadOnly
                        journalEntries={ownerJournalEntries}
                        loading={ownerJournalEntriesLoading}
                    />
                    <MotivationsSection
                        username={username}
                        isOwner={true}
                        isReadOnly={isReadOnly} // Pass isReadOnly
                        loading={false}
                    />
                </ProfileLayout>)}
        </div>);
}
