'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lock, Globe, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { fetchJournalEntryByDate, upsertJournalEntry } from '@/lib/supabase/journal';
import { CustomMarkdownEditor as MarkdownEditor } from '@/components/shared/CustomMarkdownEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { JournalEntry, ActivityLogEntry } from '@/lib/supabase/types'; // Import JournalEntry and ActivityLogEntry

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
  const [isSaving, setIsSaving] = useState(false);
  
  const [dbContent, setDbContent] = useState('');

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
        setDbContent(newContent);
        setActivityLog(entry?.activity_log || []); // Set the activity log
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
    setIsSaving(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await upsertJournalEntry({
        user_id: profileUserId,
        entry_date: dateStr,
        is_public: isPublic,
        content: currentContent,
      });
      setDbContent(currentContent);
      toast.success('Saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [date, isPublic, profileUserId, canEdit]);

  const handleManualSave = () => {
    saveEntry(content);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canEdit && content !== dbContent) {
            handleManualSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, content, dbContent, handleManualSave]);

  const hasUnsavedChanges = content !== dbContent;

  const actions = activityLog.filter(item => item.type === 'action');
  const habits = activityLog.filter(item => item.type === 'habit');
  const targets = activityLog.filter(item => item.type === 'target');


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

                {/* Tabs */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                    {isOwner && (
                         <button
                            onClick={() => setActiveTab('private')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeTab === 'private' 
                                    ? "bg-background text-foreground shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Lock className="h-3 w-3" />
                            Private
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('public')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            activeTab === 'public' 
                                ? "bg-background text-foreground shadow-sm" 
                                    : isOwner ? "text-muted-foreground hover:text-foreground" : "bg-background text-foreground shadow-sm cursor-default"
                        )}
                        disabled={!isOwner}
                    >
                        <Globe className="h-3 w-3" />
                        Public
                    </button>
                </div>
            </div>

             {/* Save Status / Button */}
             {canEdit && (
                 <div className="flex items-center gap-2">
                     {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
                     <Button 
                        onClick={handleManualSave} 
                        disabled={isSaving || !hasUnsavedChanges}
                        size="sm"
                     >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                     </Button>
                 </div>
             )}
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
