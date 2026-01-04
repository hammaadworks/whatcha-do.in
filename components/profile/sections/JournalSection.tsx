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
    CloudCheck,
    Smile,
    Briefcase,
    Timer,
    StickyNote,
    ChevronLeft,
    ChevronRight
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
import {useAuth} from '@/packages/auth/hooks/useAuth';
import {ShineBorder} from "@/components/ui/shine-border";
import {useDebounce} from '@/hooks/useDebounce';
import {CollapsibleSectionWrapper} from '@/components/ui/collapsible-section-wrapper';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';
import { uploadJournalMedia, getSignedUrlForPath } from '@/lib/supabase/storage';

interface JournalSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean;
    journalEntries: JournalEntry[];
    loading: boolean;
    isCollapsible?: boolean;
    isFolded?: boolean; // New prop, now optional
    toggleFold?: () => void; // New prop, now optional
    onEntrySaved?: () => void;
}

const ActivityItem = ({ entry }: { entry: ActivityLogEntry }) => {
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const time = format(new Date(entry.timestamp), 'h:mm a');
    
    // Determine Icon and Color
    let Icon = CheckCircle2;
    let iconColor = "text-chart-4";
    let bgColor = "bg-chart-4/10";
    
    if (entry.type === 'habit') {
        Icon = Zap;
        iconColor = "text-chart-5";
        bgColor = "bg-chart-5/10";
    } else if (entry.type === 'target') {
        Icon = Target;
        iconColor = "text-destructive";
        bgColor = "bg-destructive/10";
    }

    // Extract known details
    const { mood, work_value, time_taken, time_taken_unit, notes } = entry.details || {};

    return (
        <div className="group flex items-start gap-3 p-3 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200">
            <div className={cn("p-2 rounded-full shrink-0 mt-0.5", bgColor, iconColor)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{entry.description}</span>
                </div>
                
                {/* Details Row */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                   {/* Time */}
                   <span className="flex items-center gap-1 text-xs font-mono opacity-70">
                        <Clock className="w-3 h-3" />
                        {time}
                   </span>
                   
                   {(mood !== undefined || work_value !== undefined || time_taken !== undefined || notes) && (
                       <span className="text-border">|</span>
                   )}

                   {mood !== undefined && (
                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
                           <Smile className="w-3 h-3" /> Mood: {mood}
                       </span>
                   )}
                   
                   {work_value !== undefined && (
                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
                           <Briefcase className="w-3 h-3" /> Work: {work_value}
                       </span>
                   )}
                   
                   {time_taken !== undefined && (
                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
                           <Timer className="w-3 h-3" /> {time_taken} {time_taken_unit || 'min'}
                       </span>
                   )}

                   {notes && (
                       <button 
                           onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                           className={cn(
                               "flex items-start gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 hover:bg-muted/80 transition-all text-left cursor-pointer group-hover:border-border/80",
                               isNoteExpanded ? "max-w-full" : "max-w-[200px]"
                           )}
                           title={isNoteExpanded ? "Click to collapse" : "Click to expand"}
                       >
                           <StickyNote className="w-3 h-3 shrink-0 mt-0.5" /> 
                           <span className={cn(isNoteExpanded ? "whitespace-pre-wrap break-words" : "truncate")}>
                               {notes}
                           </span>
                       </button>
                   )}
                </div>
            </div>
        </div>
    )
}

const JournalSection: React.FC<JournalSectionProps> = ({isOwner, isReadOnly = false, journalEntries, loading, isCollapsible = false, isFolded, toggleFold, onEntrySaved}) => {
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
    const [activityPage, setActivityPage] = useState(1);
    const ACTIVITY_PAGE_SIZE = 5;

    // Track if content is user-edited or loaded
    const isUserTyping = useRef(false);

    // Reset pagination when date or tab changes
    useEffect(() => {
        setActivityPage(1);
    }, [selectedDate, activeTab]);

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
        isUserTyping.current = false;
    }, [selectedDate, activeTab, journalEntries, getCurrentEntry]);

    const saveEntry = useCallback(async (currentContent: string, dateToSave: Date, isPublicToSave: boolean) => {
        if (!user || isReadOnly) return;

        const trimmedContent = currentContent.trim();
        // If empty and not in DB, skip? No, user might delete content.
        
        setAutosaveStatus('saving');
        try {
            const dateStr = format(dateToSave, 'yyyy-MM-dd');

            await upsertJournalEntry({
                user_id: user.id, entry_date: dateStr, is_public: isPublicToSave, content: trimmedContent
            });

            lastSavedContentRef.current = currentContent;
            setAutosaveStatus('saved');
            
            // Notify parent to refresh data (which updates the calendar dots)
            if (onEntrySaved) {
                onEntrySaved();
            }
        } catch (error) {
            console.error('Failed to save journal:', error);
            setAutosaveStatus('error');
            toast.error('Failed to autosave journal');
        }
    }, [user, isReadOnly, onEntrySaved]);

    const handleUpload = useCallback(async (file: File): Promise<string> => {
        if (!user) throw new Error("You must be logged in to upload media.");
        const isPublic = activeTab === 'public';
        const { path } = await uploadJournalMedia(file, user.id, isPublic);
        return `![Image](${path})`;
    }, [user, activeTab]);

    const resolveImage = useCallback(async (src: string): Promise<string | null> => {
        if (src.startsWith('storage://')) {
            return await getSignedUrlForPath(src);
        }
        return src;
    }, []);

    // Processing state effect (1s debounce)
    useEffect(() => {
        if (isOwner && !isReadOnly && debouncedProcessing !== lastSavedContentRef.current) {
             if (autosaveStatus !== 'saving') {
                 setAutosaveStatus('processing');
             }
        }
    }, [debouncedProcessing, isOwner, isReadOnly, lastSavedContentRef]);

    // Saving effect (5s debounce)
    useEffect(() => {
        // Prevent overwrite: Only save if debounced value matches current content
        // This handles the race condition where tab switches but debounce fires with old content
        if (debouncedSaving !== entryContent) {
            return; 
        }

        if (isOwner && !isReadOnly && debouncedSaving !== lastSavedContentRef.current) {
            // Safe to save using current state vars because we verified content matches
            saveEntry(debouncedSaving, selectedDate, activeTab === 'public');
        }
    }, [debouncedSaving, isOwner, isReadOnly, saveEntry, selectedDate, activeTab, entryContent]);

    // Explicit handle for tab change to force save
    const handleTabChange = async (newTab: string) => {
        const tab = newTab as 'public' | 'private';
        if (tab === activeTab) return;

        // Force save current content before switching if it changed
        if (entryContent !== lastSavedContentRef.current) {
            await saveEntry(entryContent, selectedDate, activeTab === 'public');
        }
        
        setActiveTab(tab);
    };

    // Explicit handle for date change to force save
    const handleDateSelect = async (date: Date | undefined) => {
        if (!date) return;
        
        if (entryContent !== lastSavedContentRef.current) {
            await saveEntry(entryContent, selectedDate, activeTab === 'public');
        }
        
        setSelectedDate(date);
        setIsMainDatePickerOpen(false);
    };

    // Sort logs by timestamp descending (newest first)
    const sortedLogs = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination Logic
    const totalActivityPages = Math.ceil(sortedLogs.length / ACTIVITY_PAGE_SIZE);
    const paginatedLogs = sortedLogs.slice((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE);

    const handlePrevPage = () => setActivityPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setActivityPage(p => Math.min(totalActivityPages, p + 1));

    const JOURNAL_VIEW_OPTIONS = [
        { id: 'public', label: 'Public Journal', icon: Globe },
        { id: 'private', label: 'Private Journal', icon: Lock },
    ];

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
                <div className="flex items-center gap-2">
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
                                />
                                <span className="relative z-10 inline-flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 duration-[3000ms]"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    <span className="font-mono tracking-tight">
                                        {selectedDate ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(selectedDate) : <span>Pick a date</span>}
                                    </span>
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                                modifiers={{hasEntry: hasEntryMatcher}}
                                modifiersClassNames={{
                                    hasEntry: 'text-primary font-bold opacity-100',
                                }}
                                classNames={{
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full text-muted-foreground opacity-50 hover:opacity-100 hover:text-foreground",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            }
        >
            <div className="w-full">
                {isOwner && (
                <div className="flex items-center justify-between gap-4 mb-4 w-full">
                    <ToggleButtonGroup
                        options={JOURNAL_VIEW_OPTIONS}
                        selectedValue={activeTab}
                        onValueChange={handleTabChange}
                        className="flex-1"
                        itemClassName="flex-1 justify-center"
                    />

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
                )}

                <div 
                    className={cn(
                        "rounded-xl p-6 relative mb-4 overflow-hidden transition-all duration-500",
                        activeTab === 'private' 
                            ? "bg-primary/[0.03] dark:bg-primary/[0.1] border-2 border-primary/20 dark:border-primary/30" // Private: Warm/Theme Tint (Dark mode boosted)
                            : "bg-accent/[0.05] border-2 border-accent/20" // Public: Accent Tint
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
                            activeTab === 'private' ? "caret-primary" : "caret-accent" // Caret Color Cue
                        )}>
                            <CustomMarkdownEditor
                                value={entryContent}
                                onChange={setEntryContent}
                                placeholder={activeTab === 'private' ? "Private thoughts..." : "Public thoughts..."}
                                className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent"
                                textareaClassName={activeTab === 'private' ? "caret-primary !text-foreground" : "caret-accent !text-foreground"}
                                onUpload={handleUpload}
                                resolveImageUrl={resolveImage}
                                watermark={
                                    <div className="opacity-[0.05] dark:opacity-[0.08] flex items-center justify-center w-full h-full">
                                        {activeTab === 'private' ? (
                                            <Lock className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-primary" />
                                        ) : (
                                            <Globe className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-accent" />
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
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-1 gap-2">
                               {paginatedLogs.map((entry, index) => (
                                   <ActivityItem key={entry.id + index} entry={entry} />
                               ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalActivityPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{(activityPage - 1) * ACTIVITY_PAGE_SIZE + 1}</span> to{' '}
                                        <span className="font-medium text-foreground">
                                            {Math.min(activityPage * ACTIVITY_PAGE_SIZE, sortedLogs.length)}
                                        </span>{' '}
                                        of <span className="font-medium text-foreground">{sortedLogs.length}</span> results
                                    </span>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevPage}
                                            disabled={activityPage === 1}
                                            className="h-8 px-2 gap-1 text-xs"
                                        >
                                            <ChevronLeft className="h-3 w-3" />
                                            Prev
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
                                            disabled={activityPage === totalActivityPages}
                                            className="h-8 px-2 gap-1 text-xs"
                                        >
                                            Next
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CollapsibleSectionWrapper>);
};

export default JournalSection;