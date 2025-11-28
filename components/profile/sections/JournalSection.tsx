'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { mockJournalEntries, mockPublicJournalEntries } from '@/lib/mock-data';

interface JournalSectionProps {
  isOwner: boolean;
}

const JournalSection: React.FC<JournalSectionProps> = ({ isOwner }) => {
  const journalEntries = isOwner ? mockJournalEntries : mockPublicJournalEntries;

  return (
    <div className="section mb-10">
      <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Journal</h2>
      <div className="space-y-6">
        {journalEntries.map((entry) => (
          <div key={entry.id} className="journal-entry bg-background border border-card-border rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-primary mb-1">{entry.title}</h3>
            <div className="date text-sm text-muted-foreground mb-4">{entry.date}</div>
            <div className="text-base leading-relaxed text-foreground m-0">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalSection;
