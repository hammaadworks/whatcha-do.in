'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown'; // Ensure ReactMarkdown is imported
import { JournalEntry } from '@/lib/supabase/types'; // Assuming JournalEntry type exists
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface JournalSectionProps {
  isOwner: boolean;
  journalEntries: JournalEntry[]; // New prop
  loading: boolean; // Add loading prop
}

const JournalSection: React.FC<JournalSectionProps> = ({ isOwner, journalEntries, loading }) => {
  if (loading) {
    return (
      <div className="section mb-10">
        <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Journal</h2>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-11/12" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Use the prop journalEntries instead of mock data
  const displayEntries = journalEntries; // Assuming sorting is handled elsewhere or not critical for display

  return (
    <div className="section mb-10">
      <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Journal</h2>
      <div className="space-y-6">
        {displayEntries.length > 0 ? (
          displayEntries.map((entry) => (
            <div key={entry.id} className="journal-entry bg-card border border-card-border rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-primary mb-1">{entry.entry_date}</h3> {/* Display date as title */}
              <div className="text-base leading-relaxed text-foreground m-0">
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No journal entries yet.</p>
        )}
      </div>
    </div>
  );
};

export default JournalSection;
