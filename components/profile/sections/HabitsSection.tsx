'use client';

import React from 'react';
import { Habit } from '@/lib/supabase/types';
import { HabitChipPrivate } from '@/components/habits/HabitChipPrivate';
import { HabitChipPublic } from '@/components/habits/HabitChipPublic';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockHabitsData, mockPublicHabitsData } from '@/lib/mock-data';

interface HabitsSectionProps {
  isOwner: boolean;
}

const HabitsSection: React.FC<HabitsSectionProps> = ({ isOwner }) => {
  const habits = isOwner ? mockHabitsData : mockPublicHabitsData;

  const todayHabits = habits.filter(h => h.pile_state === 'today');
  const yesterdayHabits = habits.filter(h => h.pile_state === 'yesterday');
  const pileHabits = habits.filter(h => h.pile_state === 'lively' || h.pile_state === 'junked' || h.pile_state === 'pile' || h.pile_state === 'active');

  const HabitChipComponent = isOwner ? HabitChipPrivate : HabitChipPublic;

  return (
    <div className="section mb-10">
      <h2 className="text-2xl font-extrabold border-b border-card-border pb-4 mb-6 text-foreground">Habits</h2>

      {isOwner ? (
        // Owner view with Accordion and Grid for private habits
        <>
          <div className="md:hidden"> {/* Accordion for mobile */}
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Today</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                  {todayHabits.length > 0 ? todayHabits.map(h => (
                    <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="today" />
                  )) : <p className="text-muted-foreground text-sm">No habits for today.</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Yesterday</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                  {yesterdayHabits.length > 0 ? yesterdayHabits.map(h => (
                    <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="yesterday" />
                  )) : <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>The Pile</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                  {pileHabits.length > 0 ? pileHabits.map(h => (
                    <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="pile" />
                  )) : <p className="text-muted-foreground text-sm">The Pile is empty.</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4"> {/* Grid for desktop */}
            {/* Today Column */}
            <div className="p-4 bg-background border border-card-border rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Today</h3>
              <div className="flex flex-wrap gap-2">
                {todayHabits.length > 0 ? todayHabits.map(h => (
                  <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="today" />
                )) : <p className="text-muted-foreground text-sm">No habits for today.</p>}
              </div>
            </div>

            {/* Yesterday Column */}
            <div className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Yesterday</h3>
              <div className="flex flex-wrap gap-2">
                {yesterdayHabits.length > 0 ? yesterdayHabits.map(h => (
                  <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="yesterday" />
                )) : <p className="text-muted-foreground text-sm">No habits from yesterday.</p>}
              </div>
            </div>

            {/* The Pile Column */}
            <div className="p-4 bg-background border border-card-border rounded-xl shadow md:col-span-full lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-foreground">The Pile</h3>
              <div className="flex flex-wrap gap-2">
                {pileHabits.length > 0 ? pileHabits.map(h => (
                  <HabitChipComponent key={h.id} habit={h} onHabitUpdated={() => {}} onHabitDeleted={() => {}} columnId="pile" />
                )) : <p className="text-muted-foreground text-sm">The Pile is empty.</p>}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Public view for habits
        <div className="habit-grid flex flex-wrap gap-4">
          {habits.filter(h => h.is_public).map((habit) => (
            <HabitChipPublic key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsSection;
