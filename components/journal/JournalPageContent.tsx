'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lock, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { fetchJournalEntryByDate, upsertJournalEntry } from '@/lib/supabase/journal';
import { CustomMarkdownEditor as MarkdownEditor } from '@/components/shared/CustomMarkdownEditor';
import { Calendar } from '@/components/shared/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { JournalEntry, ActivityLogEntry } from '@/lib/supabase/types';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';
import { uploadJournalMedia, getSignedUrlForPath } from '@/lib/supabase/storage';


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
        // Custom formatting for mood_score and work_value/duration_value to make it more readable
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
  
  const [date, setDate] = useState<Date>(simulatedDate || new Date());
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public'); // Default to public
  const [content, setContent] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]); // New state for activity log
  const [isLoading, setIsLoading] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedContentRef = useRef('');
  
  const debouncedContent = useDebounce(content, 1000); // Debounce content for 1 second

  // Update date when simulatedDate changes (e.g. time travel)
  useEffect(() => {
    if (simulatedDate) {
      setDate(simulatedDate);
    }
  }, [simulatedDate]);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage, setActivitiesPerPage] = useState(10); // Default for small screens

  // Effect to determine activitiesPerPage based on screen size
  useEffect(() => {
    const handleResize = () => {
      setActivitiesPerPage(window.innerWidth >= 1024 ? 20 : 10); // 20 for lg and up, 10 for smaller
    };

    // Set initial value
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
        const entry: JournalEntry | null = await fetchJournalEntryByDate(profileUserId, dateStr, isPublic); // Cast to JournalEntry
        
        const newContent = entry?.content || '';
        setContent(newContent);
        lastSavedContentRef.current = newContent;
        setActivityLog(entry?.activity_log || []); // Set the activity log
        setCurrentPage(1); // Reset to first page on new entry load
      } catch (error) {
        console.error(error);
        toast.error('Failed to load journal entry');
      } finally {
        setIsLoading(false);
      }
    }
    loadEntry();
  }, [date, activeTab, profileUserId, isPublic]);

  const saveEntry = useCallback(async (currentContent: string, dateToSave: Date, isPublicToSave: boolean) => {
    if (!canEdit) return;
    setAutosaveStatus('saving');
    try {
      const dateStr = format(dateToSave, 'yyyy-MM-dd');
      await upsertJournalEntry({
        user_id: profileUserId,
        entry_date: dateStr,
        is_public: isPublicToSave,
        content: currentContent,
      });
      lastSavedContentRef.current = currentContent;
      setAutosaveStatus('saved');
      // Briefly show "Saved!" then revert to idle
      setTimeout(() => setAutosaveStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to autosave');
      setAutosaveStatus('error');
    }
  }, [profileUserId, canEdit]);

  const handleUpload = useCallback(async (file: File): Promise<string> => {
      if (!isOwner) throw new Error("Permission denied");
      const isPublic = activeTab === 'public';
      const { path } = await uploadJournalMedia(file, profileUserId, isPublic);
      return `![Image](${path})`;
  }, [isOwner, activeTab, profileUserId]);

  const resolveImage = useCallback(async (src: string): Promise<string | null> => {
      if (src.startsWith('storage://')) {
          return await getSignedUrlForPath(src);
      }
      return src;
  }, []);

  useEffect(() => {
    // Only trigger autosave if content has changed due to user input
    // and matches the current state (preventing stale overwrites)
    if (canEdit && debouncedContent !== lastSavedContentRef.current && debouncedContent === content) {
      saveEntry(debouncedContent, date, isPublic);
    }
  }, [debouncedContent, canEdit, saveEntry, content, date, isPublic]);

  const handleTabChange = async (newTab: string) => {
      const tab = newTab as 'public' | 'private';
      if (tab === activeTab) return;

      // Force save current content if changed
      if (content !== lastSavedContentRef.current) {
          await saveEntry(content, date, isPublic);
      }
      setActiveTab(tab);
  };

  const handleDateSelect = async (newDate: Date | undefined) => {
      if (!newDate) return;
      if (content !== lastSavedContentRef.current) {
          await saveEntry(content, date, isPublic);
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
  
  const totalPages = Math.ceil(activityLog.length / activitiesPerPage);

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

                            {/* Autosave Status Feedback */}
                            {canEdit && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                                    {autosaveStatus === 'saving' && (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    )}
                                    {autosaveStatus === 'saved' && (
                                        <span>Saved!</span>
                                    )}
                                    {autosaveStatus === 'error' && (
                                        <span className="text-destructive">Autosave Error</span>
                                    )}
                                </div>
                            )}
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
            {isLoading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    Loading entry...
                </div>
            ) : (
                <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder={canEdit ? "Write your daily reflections here..." : "No entry for this day."}
                    readOnly={!canEdit}
                    className="h-full border-0"
                    onUpload={handleUpload}
                    resolveImageUrl={resolveImage}
                    fullHeight
                />
            )}
        </div>
    </div>
  );
}
