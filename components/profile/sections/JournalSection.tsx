'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import {JournalEntry, ActivityLogEntry} from '@/lib/supabase/types';
import {
    Calendar as CalendarIcon,
    Globe,
    Loader2,
    Lock,
    CheckCircle2,
    Target,
    Zap,
    Clock,
    CloudCheck
} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {CustomMarkdownEditor} from '@/components/shared/CustomMarkdownEditor';
import {Calendar} from '@/components/shared/Calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format} from 'date-fns';
import {upsertJournalEntry} from '@/lib/supabase/journal';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {useAuth} from '@/hooks/useAuth';
import {ShineBorder} from "@/components/ui/shine-border";
import {useDebounce} from '@/hooks/useDebounce';
import {CollapsibleSectionWrapper} from '@/components/ui/collapsible-section-wrapper';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';

interface JournalSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean;
    journalEntries: JournalEntry[];
    loading: boolean;
    isCollapsible?: boolean;
    isFolded?: boolean; // New prop, now optional
    toggleFold?: () => void; // New prop, now optional
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

const JournalSection: React.FC<JournalSectionProps> = ({isOwner, isReadOnly = false, journalEntries, loading, isCollapsible = false, isFolded, toggleFold}) => {
    const {user} = useAuth();
    const { simulatedDate } = useSimulatedTime();
    const [selectedDate, setSelectedDate] = useState<Date>(simulatedDate || new Date());
    const [activeTab, setActiveTab] = useState<'private' | 'public'>('public'); // Default to public
    const [entryContent, setEntryContent] = useState('');
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'processing' | 'saving' | 'saved' | 'error'>('saved');
    const lastSavedContentRef = useRef('');
    const debouncedProcessing = useDebounce(entryContent, 1000);
    const debouncedSaving = useDebounce(entryContent, 5000);
    const mainDatePickerButtonRef = useRef<HTMLButtonElement>(null);
    const [isMainDatePickerOpen, setIsMainDatePickerOpen] = useState(false);

    // Update selectedDate when simulatedDate changes
    useEffect(() => {
        if (simulatedDate) {
            setSelectedDate(simulatedDate);
        }
    }, [simulatedDate]);

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
        setAutosaveStatus('saved'); // When a new entry is loaded, it is "saved"
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
        } catch (error) {
            console.error('Failed to save journal:', error);
            setAutosaveStatus('error');
            toast.error('Failed to autosave journal');
        }
    }, [user, isReadOnly, selectedDate, activeTab]);

    // Processing state effect (1s debounce)
    useEffect(() => {
        if (isOwner && !isReadOnly && debouncedProcessing !== lastSavedContentRef.current) {
             if (autosaveStatus !== 'saving') {
                 setAutosaveStatus('processing');
             }
        }
    }, [debouncedProcessing, isOwner, isReadOnly, lastSavedContentRef]); // removed autosaveStatus from deps to avoid loops

    // Saving effect (5s debounce)
    useEffect(() => {
        // Only save if content changed from what's in DB (lastSavedContentRef)
        // and user is owner/not read-only
        if (isOwner && !isReadOnly && debouncedSaving !== lastSavedContentRef.current) {
            saveEntry(debouncedSaving);
        }
    }, [debouncedSaving, isOwner, isReadOnly, saveEntry]);

    // Sort logs by timestamp descending (newest first)
    const sortedLogs = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (loading) {
        return (
            <CollapsibleSectionWrapper title="Journal" isCollapsible={isCollapsible}>
                <Skeleton className="h-64 w-full"/>
            </CollapsibleSectionWrapper>
        );
    }

    return (
        <CollapsibleSectionWrapper
            title="Journal"
            isCollapsible={isCollapsible}
            isFolded={isFolded} // Pass new prop
            toggleFold={toggleFold} // Pass new prop
            rightElement={
                <div className="flex items-center gap-2"> {/* Wrapper for date picker and new add button */}
                    {/* Date Picker */}
                    <Popover open={isMainDatePickerOpen} onOpenChange={setIsMainDatePickerOpen}>
                        <PopoverTrigger asChild>
                                                                                                                                                                                                                                                    <Button
                                                                                                                                                                                                                       ref={mainDatePickerButtonRef}
                                                                                                                                                                                                                       variant="ghost"
                                                                                                                                                                                                                       className={cn("relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-12 w-fit", !selectedDate && "text-muted-foreground")}
                                                                                                                                                                                                                   >
                                                                                                                                                                                                                       <ShineBorder
                                                                                                                                                                                                                           borderWidth={1}
                                                                                                                                                                                                                           duration={8}
                                                                                                                                                                                                                           shineColor={["hsl(var(--primary))", "hsl(var(--primary-foreground))"]}
                                                                                                                                                                                                                           className="rounded-full"
                                                                                                                                                                                                                       />                                                                                                                                                          <span className="relative z-10 inline-flex items-center gap-2">
                                                                                                                                                              <span className="relative flex h-2 w-2">
                                                                                                                                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-[3000ms]"></span>
                                                                                                                                                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                                                                                                                              </span>
                                                                                                                                                              <span className="font-mono tracking-tight">                                                                        {selectedDate ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(selectedDate) : <span>Pick a date</span>}
                                                                    </span>                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
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
            }
        >
            <div className="w-full">
                {isOwner && (
                <TooltipProvider>
                    <div className="flex items-center justify-between gap-4 mb-4 w-full">
                        <div className="flex-1 flex items-center bg-card rounded-full p-1 shadow-md border border-primary gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('public')}
                                        className={cn(
                                            "flex-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center transition-all",
                                            activeTab === 'public'
                                                ? "bg-blue-600 text-white shadow-sm" // Blue active state
                                                : "hover:bg-accent/50 text-muted-foreground"
                                        )}
                                    >
                                        <Globe className="h-4 w-4 mr-2"/>
                                        <span>Public Journal</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Public Journal</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('private')}
                                        disabled={!isOwner}
                                        className={cn(
                                            "flex-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center transition-all",
                                            activeTab === 'private'
                                                ? "bg-card text-foreground border border-border/50 shadow-sm" // Match editor scheme
                                                : "hover:bg-accent/50 text-muted-foreground"
                                        )}
                                    >
                                        <Lock className="h-4 w-4 mr-2"/>
                                        <span>Private Journal</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Private Journal</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Autosave Status Feedback */}
                        {isOwner && !isReadOnly && (
                            <div
                                className="flex items-center justify-end gap-2 text-sm font-medium shrink-0 min-w-[100px] text-muted-foreground">
                                {autosaveStatus === 'processing' && (
                                    <div className="flex items-center gap-2 text-muted-foreground/80">
                                        <span className="relative flex h-2 w-2">
                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-[1000ms]"></span>
                                           <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/50"></span>
                                        </span>
                                        <span>Processing...</span>
                                    </div>
                                )}
                                {autosaveStatus === 'saving' && (
                                    <div className="flex items-center gap-2 text-primary">
                                        <span className="relative flex h-2 w-2">
                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-300"></span>
                                           <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        <span>Saving...</span>
                                    </div>
                                )}
                                {(autosaveStatus === 'saved' || autosaveStatus === 'idle') && (
                                    <div className="flex items-center gap-2 text-primary/80">
                                        <CloudCheck className="h-4 w-4"/>
                                        <span>Saved</span>
                                    </div>
                                )}
                                {autosaveStatus === 'error' && (
                                    <span className="text-destructive">Error</span>
                                )}
                            </div>
                        )}
                    </div>
                </TooltipProvider>
                )}

                <div 
                    className={cn(
                        "rounded-xl p-6 relative mb-4 overflow-hidden transition-all duration-500",
                        activeTab === 'private' 
                            ? "bg-primary/[0.03] dark:bg-primary/[0.1] border-2 border-primary/20 dark:border-primary/30" // Private: Warm/Theme Tint (Dark mode boosted)
                            : "bg-blue-500/[0.03] dark:bg-blue-900/[0.2] border-2 border-blue-500/20 dark:border-blue-400/30" // Public: Cool/Blue Tint (Dark mode boosted)
                    )}
                    style={{
                        backgroundImage: activeTab === 'private'
                            ? `radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)` // Dot Pattern (slightly higher opacity for visibility)
                            : `linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)`, // Grid Pattern
                        backgroundSize: '24px 24px'
                    }}
                >
                    {isOwner && !isReadOnly ? (
                        <div className={cn("h-full flex flex-col gap-4 relative z-10", 
                            activeTab === 'private' ? "caret-primary" : "caret-blue-500 dark:caret-blue-400" // Caret Color Cue
                        )}>
                            <CustomMarkdownEditor
                                value={entryContent}
                                onChange={setEntryContent}
                                placeholder={activeTab === 'private' ? "Private thoughts..." : "Public thoughts..."}
                                className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent"
                                textareaClassName={activeTab === 'private' ? "caret-primary !text-foreground" : "caret-blue-500 dark:caret-blue-400 !text-foreground"}
                                watermark={
                                    <div className="opacity-[0.05] dark:opacity-[0.08] flex items-center justify-center w-full h-full">
                                        {activeTab === 'private' ? (
                                            <Lock className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-primary" />
                                        ) : (
                                            <Globe className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-blue-500 dark:text-blue-400" />
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words relative z-10">
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
        </CollapsibleSectionWrapper>);
};

export default JournalSection;
