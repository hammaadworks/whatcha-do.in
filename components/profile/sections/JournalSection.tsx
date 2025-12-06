'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import {JournalEntry, ActivityLogEntry} from '@/lib/supabase/types';
import {Calendar as CalendarIcon, Globe, Loader2, Lock, CheckCircle2, Target, Zap, Clock} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {CustomMarkdownEditor} from '@/components/shared/CustomMarkdownEditor';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format} from 'date-fns';
import {upsertJournalEntry} from '@/lib/supabase/journal';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {useAuth} from '@/hooks/useAuth';
import {ShineBorder} from "@/components/ui/shine-border";
import {useDebounce} from '@/hooks/useDebounce';

interface JournalSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean;
    journalEntries: JournalEntry[];
    loading: boolean;
}

const ActivityItem = ({ entry }: { entry: ActivityLogEntry }) => {
    const time = format(new Date(entry.timestamp), 'h:mm a');
    
    // Determine Icon and Color
    let Icon = CheckCircle2;
    let iconColor = "text-blue-500";
    let bgColor = "bg-blue-500/10";
    
    if (entry.type === 'habit') {
        Icon = Zap;
        iconColor = "text-amber-500";
        bgColor = "bg-amber-500/10";
    } else if (entry.type === 'target') {
        Icon = Target;
        iconColor = "text-rose-500";
        bgColor = "bg-rose-500/10";
    }

    // Parse details for display
    const details = entry.details ? Object.entries(entry.details)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
             let formattedValue = value;
             if (key === 'mood_score') formattedValue = `Mood: ${value}/100`;
             else if (key === 'work_value' && entry.details?.duration_unit) formattedValue = `${value} ${entry.details.duration_unit}`;
             else if (key === 'duration_value' && entry.details?.duration_unit) formattedValue = `${value} ${entry.details.duration_unit}`;
             
             return { key, value: formattedValue };
        }) : [];

    return (
        <div className="group flex items-center gap-3 p-3 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200">
            <div className={cn("p-2 rounded-full shrink-0", bgColor, iconColor)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium truncate">{entry.description}</span>
                </div>
                
                {/* Details Row */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                   {/* Time */}
                   <span className="flex items-center gap-1 text-xs font-mono opacity-70">
                        <Clock className="w-3 h-3" />
                        {time}
                   </span>
                   {details.length > 0 && <span className="text-border">|</span>}
                   {details.map((d, i) => (
                       <span key={i} className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
                          {d.value}
                       </span>
                   ))}
                </div>
            </div>
        </div>
    )
}

const JournalSection: React.FC<JournalSectionProps> = ({isOwner, isReadOnly = false, journalEntries, loading}) => {
    const {user} = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'private' | 'public'>(isOwner ? 'private' : 'public');
    const [entryContent, setEntryContent] = useState('');
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const lastSavedContentRef = useRef('');
    const debouncedContent = useDebounce(entryContent, 5000);
    const mainDatePickerButtonRef = useRef<HTMLButtonElement>(null);
    const [isMainDatePickerOpen, setIsMainDatePickerOpen] = useState(false);

    // Helper to find entry for selected date and tab
    const getCurrentEntry = useCallback(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const isPublic = activeTab === 'public';
        return journalEntries.find(e => e.entry_date === dateStr && e.is_public === isPublic);
    }, [selectedDate, activeTab, journalEntries]);

    // Matcher for days with entries
    const hasEntryMatcher = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isPublic = activeTab === 'public';
        return journalEntries.some(e => e.entry_date === dateStr && e.is_public === isPublic);
    };

    useEffect(() => {
        const entry = getCurrentEntry();
        const newContent = entry?.content || '';
        setEntryContent(newContent);
        setActivityLog(entry?.activity_log || []);
        lastSavedContentRef.current = newContent;
    }, [selectedDate, activeTab, journalEntries, getCurrentEntry]);

    const saveEntry = useCallback(async (currentContent: string) => {
        if (!user || isReadOnly) return;

        setAutosaveStatus('saving');
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const isPublic = activeTab === 'public';

            await upsertJournalEntry({
                user_id: user.id, entry_date: dateStr, is_public: isPublic, content: currentContent
            });

            lastSavedContentRef.current = currentContent;
            setAutosaveStatus('saved');
            // Removed setTimeout to keep "Saved!" persistent until next change
        } catch (error) {
            console.error('Failed to save journal:', error);
            setAutosaveStatus('error');
            toast.error('Failed to autosave journal');
        }
    }, [user, isReadOnly, selectedDate, activeTab]);

    useEffect(() => {
        // Only save if content changed from what's in DB (lastSavedContentRef)
        // and user is owner/not read-only
        if (isOwner && !isReadOnly && debouncedContent !== lastSavedContentRef.current) {
            saveEntry(debouncedContent);
        }
    }, [debouncedContent, isOwner, isReadOnly, saveEntry]);

    // Sort logs by timestamp descending (newest first)
    const sortedLogs = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (loading) {
        return (<div className="section mb-10">
                <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Journal</h2>
                <Skeleton className="h-64 w-full"/>
            </div>);
    }

    return (<div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Journal</h2>

                <div className="flex items-center gap-2"> {/* Wrapper for date picker and new add button */}
                    {/* Date Picker */}
                    <Popover open={isMainDatePickerOpen} onOpenChange={setIsMainDatePickerOpen}>
                        <PopoverTrigger asChild>
                                                             <Button
                                ref={mainDatePickerButtonRef}
                                variant="ghost"
                                className={cn("relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-transparent bg-background/80 backdrop-blur-sm text-sm font-medium text-muted-foreground shadow-sm hover:bg-accent/50 hover:text-muted-foreground transition-colors cursor-pointer select-none h-12 w-fit", !selectedDate && "text-muted-foreground")}
                            >
                                <ShineBorder
                                    borderWidth={1}
                                    duration={8}
                                    shineColor={["hsl(var(--primary))", "hsl(var(--primary-foreground))"]}
                                    className="rounded-full"
                                />
                                <span className="relative z-10 inline-flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-[3000ms]"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                                                     <span className="font-mono tracking-tight">
                                                                        {selectedDate ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(selectedDate) : <span>Pick a date</span>}
                                                                    </span>                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                                modifiers={{hasEntry: hasEntryMatcher}}
                                modifiersClassNames={{
                                    hasEntry: 'text-primary font-bold opacity-100',
                                }}
                                classNames={{
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full text-muted-foreground opacity-50 hover:opacity-100 hover:text-foreground",
                                    day_today: "bg-accent text-accent-foreground border-2 border-primary opacity-100",
                                    day_selected: "bg-primary text-primary-foreground opacity-100 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="w-full">
                <TooltipProvider>
                    <div className="flex items-center justify-between gap-4 mb-4 w-full">
                        <div className="flex-1 flex items-center bg-card rounded-full p-1 shadow-md border border-primary gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('private')}
                                        disabled={!isOwner}
                                        className={cn(
                                            "flex-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center transition-colors",
                                            activeTab === 'private'
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent/50 text-muted-foreground"
                                        )}
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        <span>Private Journal</span>
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
                                            "flex-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center transition-colors",
                                            activeTab === 'public'
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent/50 text-muted-foreground"
                                        )}
                                    >
                                        <Globe className="h-4 w-4 mr-2" />
                                        <span>Public Journal</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Public Journal</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Autosave Status Feedback */}
                        {isOwner && !isReadOnly && (
                            <div className="flex items-center justify-end gap-2 text-sm font-medium shrink-0 min-w-[100px]">
                                {autosaveStatus === 'saving' && (
                                    <div className="flex items-center gap-2 text-primary animate-pulse">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                )}
                                {autosaveStatus === 'saved' && (
                                    <div className="flex items-center gap-2 text-primary">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span>Saved</span>
                                    </div>
                                )}
                                {autosaveStatus === 'error' && (
                                    <span className="text-destructive">Error saving</span>
                                )}
                            </div>
                        )}
                    </div>
                </TooltipProvider>

                <div className="bg-card border border-card-border rounded-xl p-6 relative mb-4">
                    {isOwner && !isReadOnly ? (
                        <div className="h-full flex flex-col gap-4">
                            <CustomMarkdownEditor
                                value={entryContent}
                                onChange={setEntryContent}
                                placeholder={`Write your ${activeTab} thoughts for today...`}
                                className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed"
                                fullHeight
                            />
                        </div>
                    ) : (
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words">
                            {entryContent ? (
                                <ReactMarkdown>{entryContent}</ReactMarkdown>
                            ) : (
                                <p className="text-muted-foreground italic">No entry for this date.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity Log Section */}
                <div className="activity-log-section p-4 bg-muted/40 rounded-lg border shadow-sm">
                    <h2 className="flex justify-between items-center text-lg font-semibold mb-3 text-muted-foreground">
                        <span>{activeTab === 'private' ? 'Private' : 'Public'} Activity Log</span>
                        <span 
                            className="text-sm font-medium text-muted-foreground cursor-pointer hover:underline text-primary"
                            onClick={() => {
                                if (mainDatePickerButtonRef.current) {
                                    mainDatePickerButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    setTimeout(() => setIsMainDatePickerOpen(true), 300); 
                                }
                            }}
                        >
                            {format(selectedDate, 'MMM dd, yyyy')}
                        </span>
                    </h2>
                    {sortedLogs.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No activities logged for this day yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                           {sortedLogs.map((entry, index) => (
                               <ActivityItem key={entry.id + index} entry={entry} />
                           ))}
                        </div>
                    )}
                </div>
            </div>
        </div>);
};

export default JournalSection;
