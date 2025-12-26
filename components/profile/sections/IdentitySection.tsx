import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Plus, UserPlus} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {IdentityCard} from '@/components/profile/identity/IdentityCard';
import {CreateIdentityModal} from '@/components/profile/identity/CreateIdentityModal';
import {IdentityDetailsModal} from '@/components/profile/identity/IdentityDetailsModal';
import {
    createIdentity,
    deleteIdentity,
    fetchIdentities,
    fetchIdentityHabits,
    linkHabitToIdentity,
    unlinkHabitFromIdentity,
    updateIdentity
} from '@/lib/supabase/identities';
import {Habit, Identity} from '@/lib/supabase/types';
import {useAuth} from '@/hooks/useAuth';
import {toast} from 'sonner';

interface IdentitySectionProps {
    isOwner: boolean;
    isReadOnly?: boolean; // Add isReadOnly prop
    ownerHabits: Habit[]; // Passed from parent to avoid refetch
    identities?: (Identity & { backingCount: number })[]; // Optional prop for public/prefetched data
}

export default function IdentitySection({
                                            isOwner,
                                            isReadOnly = false,
                                            ownerHabits,
                                            identities: propIdentities
                                        }: IdentitySectionProps) {
    const {user} = useAuth();
    const [identities, setIdentities] = useState<(Identity & { backingCount: number })[]>(propIdentities || []);
    const [loading, setLoading] = useState(!propIdentities); // Loading only if no props passed

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
    const [linkedHabits, setLinkedHabits] = useState<Habit[]>([]);

    useEffect(() => {
        // Only fetch if NO props provided and we have a user (Owner mode usually)
        if (!propIdentities && user) {
            loadIdentities();
        }
    }, [user, propIdentities]);

    const loadIdentities = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await fetchIdentities(user.id);
            setIdentities(data);
        } catch (error) {
            console.error("Failed to load identities", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (title: string, isPublic: boolean) => {
        if (!user) return;
        try {
            await createIdentity(user.id, {title, is_public: isPublic});
            toast.success("Identity created!");
            loadIdentities();
        } catch (error) {
            toast.error("Failed to create identity");
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Identity>) => {
        try {
            await updateIdentity(id, updates);
            toast.success("Identity updated!");
            loadIdentities();
            // Update local state if currently selected
            if (selectedIdentity && selectedIdentity.id === id) {
                setSelectedIdentity({...selectedIdentity, ...updates});
            }
        } catch (error) {
            toast.error("Failed to update identity");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteIdentity(id);
            toast.success("Identity deleted!");
            loadIdentities();
            setSelectedIdentity(null);
        } catch (error) {
            toast.error("Failed to delete identity");
        }
    };

    const handleIdentityClick = async (identity: Identity & { backingCount: number }) => {
        setSelectedIdentity(identity);
        // Fetch linked habits
        try {
            const habits = await fetchIdentityHabits(identity.id);
            setLinkedHabits(habits);
        } catch (error) {
            console.error("Failed to fetch linked habits", error);
            // Optionally, handle error state for linked habits
        }
    };

    const handleLinkHabit = async (habitId: string) => {
        if (!selectedIdentity || !user) return;
        try {
            await linkHabitToIdentity(user.id, habitId, selectedIdentity.id);
            toast.success("Habit linked!");
            // Refresh linked habits locally
            const habit = ownerHabits.find(h => h.id === habitId);
            if (habit) {
                setLinkedHabits(prev => [...prev, habit]);
            }
            loadIdentities(); // Refresh counts
        } catch (error) {
            toast.error("Failed to link habit");
        }
    };

    const handleUnlinkHabit = async (habitId: string) => {
        if (!selectedIdentity) return;
        try {
            await unlinkHabitFromIdentity(habitId, selectedIdentity.id);
            toast.success("Habit unlinked!");
            setLinkedHabits(prev => prev.filter(h => h.id !== habitId));
            loadIdentities(); // Refresh counts
        } catch (error) {
            toast.error("Failed to unlink habit");
        }
    };

    if (!isOwner && identities.length === 0) return null;

    return (<div className="space-y-4">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Identity</h2>
                {isOwner && !isReadOnly && ( // Conditional rendering for "New Identity" button
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                                                 <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                    onClick={() => setIsCreateModalOpen(true)}
                                                                    title="Add New Identity"                                >
                                    <UserPlus className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add New Identity</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {identities.map(identity => (<IdentityCard
                        key={identity.id}
                        identity={identity}
                        onClick={() => isOwner && handleIdentityClick(identity)} // Always clickable for owner, regardless of isReadOnly
                    />))}
                {identities.length === 0 && isOwner && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        No identities defined yet. Start by defining who you want to be!
                    </div>)}
            </div>

            {isOwner && !isReadOnly && ( // Conditional rendering for CreateIdentityModal
                <CreateIdentityModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreate}
                />)}

            {isOwner && selectedIdentity && ( // Conditional rendering for IdentityDetailsModal
                <IdentityDetailsModal
                    identity={selectedIdentity}
                    isOpen={!!selectedIdentity}
                    onClose={() => setSelectedIdentity(null)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    allHabits={ownerHabits}
                    linkedHabits={linkedHabits}
                    onLinkHabit={handleLinkHabit}
                    onUnlinkHabit={handleUnlinkHabit}
                    isReadOnly={isReadOnly} // Pass isReadOnly down to the modal
                />)}
        </div>);
}