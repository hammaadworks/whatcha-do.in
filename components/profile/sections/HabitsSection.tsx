'use client';

import React, {useState} from 'react';
import {HabitChipPrivate} from '@/components/habits/HabitChipPrivate';
import {HabitChipPublic} from '@/components/habits/HabitChipPublic';
import {mockHabitsData, mockPublicHabitsData} from '@/lib/mock-data';
import {MovingBorder} from '@/components/ui/moving-border';
import {Button} from '@/components/ui/button'; // Assuming a Button component exists

interface HabitsSectionProps {
    isOwner: boolean;
}

const HabitsSection: React.FC<HabitsSectionProps> = ({isOwner}) => {
    const habits = isOwner ? mockHabitsData : mockPublicHabitsData;

    const todayHabits = habits.filter(h => h.pile_state === 'today');
    const yesterdayHabits = habits.filter(h => h.pile_state === 'yesterday');
    const pileHabits = habits.filter(h => h.pile_state === 'lively' || h.pile_state === 'junked' || h.pile_state === 'pile' || h.pile_state === 'active');

    const HabitChipComponent = isOwner ? HabitChipPrivate : HabitChipPublic;

    const [showAllPileHabits, setShowAllPileHabits] = useState(false);
    const initialVisibleHabits = 4; // Approximately 2 lines of chips

    const habitsToDisplay = showAllPileHabits ? pileHabits : pileHabits.slice(0, initialVisibleHabits);
    const hasMoreHabits = pileHabits.length > initialVisibleHabits;

    return (<div className="section mb-10">
            <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Habits</h2>

            {isOwner ? (// Owner view with Accordion and Grid for private habits
                <>
                    <div className="md:hidden flex flex-col gap-4"> {/* Mobile layout */}
                        {/* Today Column - Mobile */}
                        <div className="relative overflow-hidden rounded-xl shadow">
                            <div className="p-4 bg-background border border-primary rounded-xl z-10 relative">
                                <h3 className="text-xl font-semibold mb-4 text-foreground">Today</h3>
                                <div className="flex flex-wrap gap-2">
                                    {todayHabits.length > 0 ? todayHabits.map(h => (
                                            <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                            }} onHabitDeleted={() => {
                                            }} columnId="today"/>)) :
                                        <p className="text-muted-foreground text-sm">No habits for today.</p>}
                                </div>
                            </div>
                            {/* This is the MovingBorder effect overlay */}
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
                                        <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                        }} onHabitDeleted={() => {
                                        }} columnId="yesterday"/>)) :
                                    <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                            </div>
                        </div>

                        {/* The Pile Column - Mobile */}
                        <div
                            className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">The Pile</h3>
                            <div className="flex flex-wrap gap-2">
                                {habitsToDisplay.length > 0 ? habitsToDisplay.map(h => (
                                        <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                        }} onHabitDeleted={() => {
                                        }} columnId="pile"/>)) :
                                    <p className="text-muted-foreground text-sm">The Pile is empty.</p>}
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

                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4"> {/* Grid for desktop */}
                        {/* Today Column */}
                        <div className="relative overflow-hidden rounded-xl shadow">
                            {/* This is the actual content of the Today box, with its static border */}
                            <div className="p-4 bg-background border border-primary rounded-xl z-10 relative">
                                <h3 className="text-xl font-semibold mb-4 text-foreground">Today</h3>
                                <div className="flex flex-wrap gap-2">
                                    {todayHabits.length > 0 ? todayHabits.map(h => (
                                            <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                            }} onHabitDeleted={() => {
                                            }} columnId="today"/>)) :
                                        <p className="text-muted-foreground text-sm">No habits for today.</p>}
                                </div>
                            </div>
                            {/* This is the MovingBorder effect overlay */}
                            <div className="absolute inset-0 rounded-[inherit] z-20">
                                <MovingBorder duration={8000} rx="6" ry="6">
                                    <div
                                        className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                                    {/* The red square */}
                                </MovingBorder>
                            </div>
                        </div>

                        {/* Yesterday Column */}
                        <div
                            className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Yesterday</h3>
                            <div className="flex flex-wrap gap-2">
                                {yesterdayHabits.length > 0 ? yesterdayHabits.map(h => (
                                        <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                        }} onHabitDeleted={() => {
                                        }} columnId="yesterday"/>)) :
                                    <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                            </div>
                        </div>

                        {/* The Pile Column */}
                        <div
                            className="p-4 bg-background border border-card-border rounded-xl shadow md:col-span-full lg:col-span-2">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">The Pile</h3>
                            <div className="flex flex-wrap gap-2">
                                {pileHabits.length > 0 ? pileHabits.map(h => (
                                        <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {
                                        }} onHabitDeleted={() => {
                                        }} columnId="pile"/>)) :
                                    <p className="text-muted-foreground text-sm">The Pile is empty.</p>}
                            </div>
                        </div>
                    </div>
                </>) : (// Public view for habits
                <div className="habit-grid flex flex-wrap gap-4">
                    {habits.filter(h => h.is_public).map((habit) => (<HabitChipPublic key={habit.id} habit={habit}/>))}
                </div>)}
        </div>);
};

export default HabitsSection;
