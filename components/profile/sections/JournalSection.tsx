'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import {JournalEntry, ActivityLogEntry} from '@/lib/supabase/types';
import {
    Calendar as CalendarIcon,
    Globe,
    Lock,
    CheckCircle2,
    Target,
    Zap,
    Clock,
    Smile,
    Briefcase,
    Timer,
    StickyNote
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {EditorWithControls} from '@/components/shared/EditorWithControls';
import {Calendar} from '@/components/shared/Calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format} from 'date-fns';
import {upsertJournalEntry} from '@/lib/supabase/journal';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {useAuth} from '@/packages/auth/hooks/useAuth';
import {ShineBorder} from "@/components/ui/shine-border";
import {CollapsibleSectionWrapper} from '@/components/ui/collapsible-section-wrapper';
import { useSimulatedTime } from '@/components/layout/SimulatedTimeProvider';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';

import { PaginationControls } from '@/components/shared/PaginationControls';

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
    let bgColor = "bg-chart-4/20";
    
    if (entry.type === 'habit') {
        Icon = Zap;
        iconColor = "text-chart-5";
        bgColor = "bg-chart-5/20";
    } else if (entry.type === 'target') {
        Icon = Target;
        iconColor = "text-destructive";
        bgColor = "bg-destructive/20";
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
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const mainDatePickerButtonRef = useRef<HTMLButtonElement>(null);
    const [isMainDatePickerOpen, setIsMainDatePickerOpen] = useState(false);
    const [activityPage, setActivityPage] = useState(1);
    const [isDirty, setIsDirty] = useState(false);
    const ACTIVITY_PAGE_SIZE = 5;

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

    // Derived state for current content
    const currentEntry = getCurrentEntry();
    const initialContent = currentEntry?.content || '';

    useEffect(() => {
        setActivityLog(currentEntry?.activity_log || []);
    }, [currentEntry]);

    const handleSave = async (content: string) => {
        if (!user || isReadOnly) return;
        const trimmedContent = content.trim();
        
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const isPublic = activeTab === 'public';

            await upsertJournalEntry({
                user_id: user.id, entry_date: dateStr, is_public: isPublic, content: trimmedContent
            });

            // Notify parent to refresh data (which updates the calendar dots)
            if (onEntrySaved) {
                onEntrySaved();
            }
        } catch (error) {
            console.error('Failed to save journal:', error);
            // EditorWithControls handles UI toast for error usually, but we throw to let it know?
            // EditorWithControls expects onSave to be a Promise. If it rejects, it shows error toast.
            throw error;
        }
    };

    // Explicit handle for tab change
    const handleTabChange = async (newTab: string) => {
        const tab = newTab as 'public' | 'private';
        if (tab === activeTab) return;

        if (isDirty) {
            const confirmSwitch = window.confirm("You have unsaved changes. Switch tabs anyway?");
            if (!confirmSwitch) return;
        }
        
        setActiveTab(tab);
    };

    // Explicit handle for date change
    const handleDateSelect = async (date: Date | undefined) => {
        if (!date) return;
        
        if (isDirty) {
            const confirmSwitch = window.confirm("You have unsaved changes. Switch date anyway?");
            if (!confirmSwitch) return;
        }
        
        setSelectedDate(date);
        setIsMainDatePickerOpen(false);
    };

    // Sort logs by timestamp descending (newest first)
    const sortedLogs = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination Logic
    const totalActivityPages = Math.ceil(sortedLogs.length / ACTIVITY_PAGE_SIZE);
    const paginatedLogs = sortedLogs.slice((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE);

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
            isFolded={isFolded}
            toggleFold={toggleFold}
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
                    </div>
                )}

                <div 
                    className={cn(
                        "rounded-xl p-6 relative mb-4 overflow-hidden transition-all duration-500",
                        activeTab === 'private' 
                            ? "bg-primary/[0.03] dark:bg-primary/[0.1] border-2 border-primary/20 dark:border-primary/30" // Private: Warm/Theme Tint (Dark mode boosted)
                            : "bg-accent/[0.05] border-2 border-accent/20" // Public: Accent Tint
                    )}
                >
                    {isOwner && !isReadOnly ? (
                        <div className={cn("h-full flex flex-col gap-4 relative z-10", 
                            activeTab === 'private' ? "caret-primary" : "caret-accent" // Caret Color Cue
                        )}>
                            <EditorWithControls
                                initialContent={initialContent}
                                onSave={handleSave}
                                userId={user?.id || ''}
                                isOwner={true}
                                uploadIsPublic={activeTab === 'public'}
                                placeholder={activeTab === 'private' ? "Private thoughts..." : "Public thoughts..."}
                                className="min-h-[200px] border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent"
                                onDirtyChange={setIsDirty}
                                watermark={
                                    <div className="opacity-[0.05] dark:opacity-[0.08] flex items-center justify-center w-full h-full">
                                        {activeTab === 'private' ? (
                                            <Lock className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-primary" />
                                        ) : (
                                            <Globe className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-accent" />
                                        )}
                                    </div>
                                }
                                style={{
                                    backgroundImage: activeTab === 'private'
                                        ? `radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)` 
                                        : `linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)`,
                                    backgroundSize: '24px 24px'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words relative z-10">
                            {initialContent ? (
                                <ReactMarkdown>{initialContent}</ReactMarkdown>
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

                            <PaginationControls 
                                currentPage={activityPage}
                                totalPages={totalActivityPages}
                                onPageChange={setActivityPage}
                                totalItems={sortedLogs.length}
                                pageSize={ACTIVITY_PAGE_SIZE}
                            />
                        </div>
                    )}
                </div>
            </div>
        </CollapsibleSectionWrapper>);
};

export default JournalSection;