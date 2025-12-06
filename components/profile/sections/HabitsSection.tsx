'use client';

import React, {useState} from 'react';
import {HabitChipPrivate} from '@/components/habits/HabitChipPrivate';
import {HabitChipPublic} from '@/components/habits/HabitChipPublic';
import {mockHabitsData, mockPublicHabitsData} from '@/lib/mock-data';
import {MovingBorder} from '@/components/ui/moving-border';
import {Button} from '@/components/ui/button';
import {Habit} from '@/lib/supabase/types'; // Import Habit
import {Skeleton} from '@/components/ui/skeleton'; // Import Skeleton
import {completeHabit, deleteHabit, updateHabit} from '@/lib/supabase/habit'; // Import update/delete/complete functions
import {toast} from 'sonner';
import {CompletionData} from '@/components/habits/HabitCompletionModal';
import {PlusCircle} from 'lucide-react'; // New import
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip"; // New import
import {HabitCreatorModal} from '@/components/habits/HabitCreatorModal'; // New import

interface HabitsSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean; // Add isReadOnly prop
    habits?: Habit[]; // Add habits prop
    loading: boolean; // Add loading prop
}

const HabitsSection: React.FC<HabitsSectionProps> = ({isOwner, isReadOnly = false, habits: propHabits, loading}) => {
    const habits = propHabits ? propHabits : (isOwner ? mockHabitsData : mockPublicHabitsData);

    const todayHabits = habits.filter(h => h.pile_state === 'today');
    const yesterdayHabits = habits.filter(h => h.pile_state === 'yesterday');
    const pileHabits = habits.filter(h => h.pile_state === 'lively' || h.pile_state === 'junked' || h.pile_state === 'pile' || h.pile_state === 'active');

    const HabitChipComponent = isOwner ? HabitChipPrivate : HabitChipPublic;

    const [showAllPileHabits, setShowAllPileHabits] = useState(false);
    const initialVisibleHabits = 4; // Approximately 2 lines of chips

    const habitsToDisplay = showAllPileHabits ? pileHabits : pileHabits.slice(0, initialVisibleHabits);
    const hasMoreHabits = pileHabits.length > initialVisibleHabits;

    const handleHabitUpdate = async (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => {
        try {
            await updateHabit(habitId, {name, is_public: isPublic, goal_value: goalValue, goal_unit: goalUnit});
            toast.success('Habit updated');
        } catch (error) {
            console.error('Failed to update habit:', error);
            toast.error('Failed to update habit');
        }
    };

    const handleHabitDelete = async (habitId: string) => {
        try {
            await deleteHabit(habitId);
            toast.success('Habit deleted');
        } catch (error) {
            console.error('Failed to delete habit:', error);
            toast.error('Failed to delete habit');
        }
    };

    const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);

    const handleCreateHabit = () => {
        setIsCreateHabitModalOpen(false);
        toast.success('Habit created!');
        // TODO: Implement habit refresh logic here, e.g., call a prop function like onHabitCreated from OwnerProfileView
    };

    const handleHabitComplete = async (habitId: string, data: CompletionData) => {
        try {
            await completeHabit(habitId, data);
            toast.success('Habit completed! 🔥');
        } catch (error) {
            console.error('Failed to complete habit:', error);
            toast.error('Failed to complete habit');
        }
    };

    // Define no-op functions with correct signatures for read-only mode
    const noopOnHabitUpdated = (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => {
    };
    const noopOnHabitDeleted = (habitId: string) => {
    };
    const noopOnHabitCompleted = (habitId: string, data: CompletionData) => {
    };

    if (loading) {
        return (<div className="section mb-10">
                <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Habits</h2>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-32"/>
                    <Skeleton className="h-10 w-40"/>
                    <Skeleton className="h-10 w-24"/>
                    <Skeleton className="h-10 w-36"/>
                    <Skeleton className="h-10 w-28"/>
                    <Skeleton className="h-10 w-48"/>
                </div>
            </div>);
    }

    return (<div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Habits</h2>
                {isOwner && !isReadOnly && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-card hover:bg-primary/20 hover:text-primary border-border hover:border-primary shadow-sm"
                                    onClick={() => setIsCreateHabitModalOpen(true)}
                                    title="Add New Habit"
                                >
                                    <PlusCircle className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add New Habit</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {isOwner ? (<>
                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col gap-4">
                    {/* Today Column - Mobile */}
                    <div className="relative overflow-hidden rounded-xl shadow">
                        <div className="p-4 bg-background border border-primary rounded-xl z-10 relative">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Today</h3>
                            <div className="flex flex-wrap gap-2">
                                {todayHabits.length > 0 ? todayHabits.map(h => (<HabitChipComponent key={h.id} habit={h}
                                                                                                    onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                                                                    onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                                                                    onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                                                                    columnId="today"/>)) :
                                    <p className="text-muted-foreground text-sm">No habits for today.</p>}
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-[inherit] z-20">
                            <MovingBorder duration={8000} rx="6" ry="6">
                                <div
                                    className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                            </MovingBorder>
                        </div>
                    </div>

                    {/* Yesterday Column - Mobile */}
                    <div
                        className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Yesterday</h3>
                        <div className="flex flex-wrap gap-2">
                            {yesterdayHabits.length > 0 ? yesterdayHabits.map(h => (
                                    <HabitChipComponent key={h.id} habit={h}
                                                        onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                        onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                        onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                        columnId="yesterday"/>)) :
                                <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                        </div>
                    </div>

                    {/* The Pile Column - Mobile */}
                    <div
                        className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">The Pile</h3>
                        <div className="flex flex-wrap gap-2">
                            {habitsToDisplay.length > 0 ? habitsToDisplay.map(h => (
                                    <HabitChipComponent key={h.id} habit={h}
                                                        onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                        onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                        onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                        columnId="pile"/>)) :
                                <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                        </div>
                        {hasMoreHabits && (<Button
                            variant="ghost"
                            onClick={() => setShowAllPileHabits(!showAllPileHabits)}
                            className="mt-2 w-full"
                        >
                            {showAllPileHabits ? 'Show Less' : 'Show More'}
                        </Button>)}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Today Column */}
                    <div className="relative overflow-hidden rounded-xl shadow">
                        <div className="p-4 bg-background border border-primary rounded-xl z-10 relative">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Today</h3>
                            <div className="flex flex-wrap gap-2">
                                {todayHabits.length > 0 ? todayHabits.map(h => (<HabitChipComponent key={h.id} habit={h}
                                                                                                    onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                                                                    onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                                                                    onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                                                                    columnId="today"/>)) :
                                    <p className="text-muted-foreground text-sm">No habits for today.</p>}
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-[inherit] z-20">
                            <MovingBorder duration={8000} rx="6" ry="6">
                                <div
                                    className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                            </MovingBorder>
                        </div>
                    </div>

                    {/* Yesterday Column */}
                    <div
                        className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Yesterday</h3>
                        <div className="flex flex-wrap gap-2">
                            {yesterdayHabits.length > 0 ? yesterdayHabits.map(h => (
                                    <HabitChipComponent key={h.id} habit={h}
                                                        onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                        onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                        onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                        columnId="yesterday"/>)) :
                                <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                        </div>
                    </div>

                    {/* The Pile Column */}
                    <div
                        className="p-4 bg-background border border-card-border rounded-xl shadow md:col-span-full lg:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">The Pile</h3>
                        <div className="flex flex-wrap gap-2">
                            {pileHabits.length > 0 ? pileHabits.map(h => (<HabitChipComponent key={h.id} habit={h}
                                                                                              onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
                                                                                              onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
                                                                                              onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
                                                                                              columnId="pile"/>)) :
                                <p className="text-muted-foreground text-sm">The Pile is empty.</p>}
                        </div>
                    </div>
                </div>
            </>) : (// Public view for habits
                <div className="habit-grid flex flex-wrap gap-4">
                    {habits.filter(h => h.is_public).map((habit) => (<HabitChipPublic key={habit.id} habit={habit}/>))}
                </div>)}

            {isOwner && !isReadOnly && (
                <HabitCreatorModal
                    isOpen={isCreateHabitModalOpen}
                    onClose={() => setIsCreateHabitModalOpen(false)}
                    onHabitCreated={handleCreateHabit}
                />
            )}
        </div>);
};

export default HabitsSection;