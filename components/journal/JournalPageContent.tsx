'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { fetchJournalEntryByDate, upsertJournalEntry } from '@/lib/supabase/journal';
import { EditorWithControls } from '@/components/shared/EditorWithControls';
import { Calendar } from '@/components/shared/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { JournalEntry, ActivityLogEntry } from '@/lib/supabase/types';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';
import { useAuth } from '@/packages/auth/hooks/useAuth';


interface JournalPageContentProps {
  profileUserId: string;
  isOwner: boolean;
}

// Helper function to format activity log entries for display
const formatActivityLogEntry = (entry: ActivityLogEntry): string => {
  const time = format(new Date(entry.timestamp), 'hh:mm a');
  const details = entry.details ? Object.entries(entry.details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
        if (key === 'mood_score') return `Mood: ${value}/100`;
        if (key === 'work_value' && entry.details?.duration_unit) return `${value} ${entry.details.duration_unit}`;
        if (key === 'duration_value' && entry.details?.duration_unit) return `${value} ${entry.details.duration_unit}`;
        return `${key}: ${value}`;
    })
    .join(', ') : '';
  const detailString = details ? ` (${details})` : '';

  return `- [${entry.status === 'completed' ? 'x' : ' '}] ${time} ${entry.description}${detailString}`;
};


export function JournalPageContent({ profileUserId, isOwner }: JournalPageContentProps) {
  const { simulatedDate } = useSimulatedTime();
  const { user } = useAuth();
  
  const [date, setDate] = useState<Date>(simulatedDate || new Date());
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public'); // Default to public
  const [loadedContent, setLoadedContent] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Update date when simulatedDate changes (e.g. time travel)
  useEffect(() => {
    if (simulatedDate) {
      setDate(simulatedDate);
    }
  }, [simulatedDate]);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage, setActivitiesPerPage] = useState(10); 

  useEffect(() => {
    const handleResize = () => {
      setActivitiesPerPage(window.innerWidth >= 1024 ? 20 : 10);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPublic = activeTab === 'public';
  const canEdit = isOwner;

  useEffect(() => {
    async function loadEntry() {
      setIsLoading(true);
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry: JournalEntry | null = await fetchJournalEntryByDate(profileUserId, dateStr, isPublic);
        
        const newContent = entry?.content || '';
        setLoadedContent(newContent);
        setActivityLog(entry?.activity_log || []);
        setCurrentPage(1); 
      } catch (error) {
        console.error(error);
        toast.error('Failed to load journal entry');
      } finally {
        setIsLoading(false);
      }
    }
    loadEntry();
  }, [date, activeTab, profileUserId, isPublic]);

  const handleSaveEntry = async (currentContent: string) => {
    if (!canEdit) return;
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await upsertJournalEntry({
        user_id: profileUserId,
        entry_date: dateStr,
        is_public: isPublic,
        content: currentContent,
      });
      // Optionally update loadedContent to reflect the save, ensuring internal state remains consistent if we were to re-initialize
      setLoadedContent(currentContent);
    } catch (error) {
        // Error handling is managed by EditorWithControls for UI, but we re-throw to let it know save failed if needed.
        // Actually EditorWithControls handles the toast.
        throw error;
    }
  };

  const handleTabChange = async (newTab: string) => {
      const tab = newTab as 'public' | 'private';
      if (tab === activeTab) return;

      if (isDirty) {
         const confirmSwitch = window.confirm("You have unsaved changes. Switch tabs anyway?");
         if (!confirmSwitch) return;
      }
      setActiveTab(tab);
  };

  const handleDateSelect = async (newDate: Date | undefined) => {
      if (!newDate) return;
      if (isDirty) {
          const confirmSwitch = window.confirm("You have unsaved changes. Switch date anyway?");
          if (!confirmSwitch) return;
      }
      setDate(newDate);
  };

  // Sort activities by timestamp in descending order (most recent on top)
  const sortedActivityLog = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const paginatedActivityLog = sortedActivityLog.slice(startIndex, endIndex);

  const actions = paginatedActivityLog.filter(item => item.type === 'action');
  const habits = paginatedActivityLog.filter(item => item.type === 'habit');
  const targets = paginatedActivityLog.filter(item => item.type === 'target');
  
  const JOURNAL_VIEW_OPTIONS = [
      { id: 'public', label: 'Public', icon: Globe },
      { id: 'private', label: 'Private', icon: Lock },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-5xl mx-auto space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-4">
                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {isOwner && (
                    <div className="flex items-center gap-4">
                        <ToggleButtonGroup
                            options={JOURNAL_VIEW_OPTIONS}
                            selectedValue={activeTab}
                            onValueChange={handleTabChange}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Activity Log Section (Read-Only) */}
        <div className="activity-log-section p-4 bg-muted/40 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Daily Activity Log</h2>
            {activityLog.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activities logged for this day yet.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {actions.length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-1 text-primary">Actions</h3>
                            <ul className="list-none pl-0 space-y-1">
                                {actions.map((action, index) => (
                                    <li key={action.id || index} className="text-sm text-foreground/80">
                                        {formatActivityLogEntry(action)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {habits.length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-1 text-primary">Habits</h3>
                            <ul className="list-none pl-0 space-y-1">
                                {habits.map((habit, index) => (
                                    <li key={habit.id || index} className="mb-1 text-sm text-foreground/80">
                                        {formatActivityLogEntry(habit)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {targets.length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-1 text-primary">Targets</h3>
                            <ul className="list-none pl-0 space-y-1">
                                {targets.map((target, index) => (
                                    <li key={target.id || index} className="mb-1 text-sm text-foreground/80">
                                        {formatActivityLogEntry(target)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* User Editable Journal Content */}
        <div className="flex-1 bg-card rounded-lg border shadow-sm overflow-hidden">
             <EditorWithControls 
                initialContent={loadedContent}
                onSave={handleSaveEntry}
                userId={profileUserId}
                isOwner={isOwner}
                placeholder={canEdit ? "Write your daily reflections here..." : "No entry for this day."}
                uploadIsPublic={isPublic}
                isLoading={isLoading}
                onDirtyChange={setIsDirty}
             />
        </div>
    </div>
  );
}
