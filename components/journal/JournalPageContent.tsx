'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lock, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { fetchJournalEntryByDate, upsertJournalEntry } from '@/lib/supabase/journal';
import { CustomMarkdownEditor as MarkdownEditor } from '@/components/shared/CustomMarkdownEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { JournalEntry, ActivityLogEntry } from '@/lib/supabase/types'; // Import JournalEntry and ActivityLogEntry
import { ACTIVITIES_PER_PAGE } from '@/lib/constants'; // Import the constant


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
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'public' | 'private'>(isOwner ? 'private' : 'public');
  const [content, setContent] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]); // New state for activity log
  const [isLoading, setIsLoading] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedContentRef = useRef('');
  
  const debouncedContent = useDebounce(content, 1000); // Debounce content for 1 second

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

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

  const saveEntry = useCallback(async (currentContent: string) => {
    if (!canEdit) return;
    setAutosaveStatus('saving');
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await upsertJournalEntry({
        user_id: profileUserId,
        entry_date: dateStr,
        is_public: isPublic,
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
  }, [date, isPublic, profileUserId, canEdit]);

  useEffect(() => {
    // Only trigger autosave if content has changed due to user input
    // (i.e., debouncedContent is different from the last saved content from the DB)
    // and if the current user has edit permissions.
    if (canEdit && debouncedContent !== lastSavedContentRef.current) {
      saveEntry(debouncedContent);
    }
  }, [debouncedContent, canEdit, saveEntry]);

  // Sort activities by timestamp in descending order (most recent on top)
  const sortedActivityLog = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const startIndex = (currentPage - 1) * ACTIVITIES_PER_PAGE;
  const endIndex = startIndex + ACTIVITIES_PER_PAGE;
  const paginatedActivityLog = sortedActivityLog.slice(startIndex, endIndex);

  const actions = paginatedActivityLog.filter(item => item.type === 'action');
  const habits = paginatedActivityLog.filter(item => item.type === 'habit');
  const targets = paginatedActivityLog.filter(item => item.type === 'target');
  
  const totalPages = Math.ceil(activityLog.length / ACTIVITIES_PER_PAGE);


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
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {isOwner && (
                    <TooltipProvider>
                        <div className="flex items-center bg-card rounded-full p-2 shadow-md border border-primary gap-x-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('private')}
                                        className={cn(
                                            "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
                                            "ring-2 ring-primary ring-offset-background", // Added solid ring styles
                                            activeTab === 'private'
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground" // Adjusted for solid ring non-active state
                                        )}
                                        disabled={!isOwner} // Disable if not owner
                                    >
                                        <Lock className="h-4 w-4" />
                                        <span className={cn(
                                            "ml-2",
                                            activeTab === 'private' ? "inline-block" : "hidden",
                                            "lg:inline-block"
                                        )}>
                                            Private
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Private Journal</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('public')}
                                        className={cn(
                                            "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
                                            "ring-2 ring-primary ring-offset-background", // Added solid ring styles
                                            activeTab === 'public'
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground" // Adjusted for solid ring non-active state
                                        )}
                                        disabled={!isOwner && activeTab === 'private'} // Disable if not owner and public tab is active
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span className={cn(
                                            "ml-2",
                                            activeTab === 'public' ? "inline-block" : "hidden",
                                            "lg:inline-block"
                                        )}>
                                            Public
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Public Journal</p>
                                </TooltipContent>
                            </Tooltip>

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
                    </TooltipProvider>
                )}
            </div>
        </div>

        {/* Activity Log Section (Read-Only) */}
        <div className="activity-log-section p-4 bg-muted/40 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Daily Activity Log</h2>
            {activityLog.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activities logged for this day yet.</p>
            ) : (
                <div className="space-y-4">
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
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                size="sm"
                            >
                                Next
                            </Button>
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
                />
            )}
        </div>
    </div>
  );
}
