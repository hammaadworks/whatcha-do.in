'use client';

import React, {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {JournalEntry} from '@/lib/supabase/types';
import {Calendar as CalendarIcon, Check, Globe, Loader2, Lock, Plus} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format} from 'date-fns';
import {upsertJournalEntry} from '@/lib/supabase/journal';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {useAuth} from '@/hooks/useAuth';

interface JournalSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean;
    journalEntries: JournalEntry[];
    loading: boolean;
}

const JournalSection: React.FC<JournalSectionProps> = ({isOwner, isReadOnly = false, journalEntries, loading}) => {
    const {user} = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'private' | 'public'>(isOwner ? 'private' : 'public');
    const [entryContent, setEntryContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Helper to find entry for selected date and tab
    const getCurrentEntry = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const isPublic = activeTab === 'public';
        return journalEntries.find(e => e.entry_date === dateStr && e.is_public === isPublic);
    };

    // Matcher for days with entries
    const hasEntryMatcher = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isPublic = activeTab === 'public';
        return journalEntries.some(e => e.entry_date === dateStr && e.is_public === isPublic);
    };

    useEffect(() => {
        const entry = getCurrentEntry();
        setEntryContent(entry?.content || '');
    }, [selectedDate, activeTab, journalEntries]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const isPublic = activeTab === 'public';

            await upsertJournalEntry({
                user_id: user.id, entry_date: dateStr, is_public: isPublic, content: entryContent
            });

            toast.success('Journal saved');
            // Note: Parent component should ideally refresh journalEntries or we update locally?
            // OwnerProfileView fetches them. We might need a refresh mechanism.
            // For now, this saves to DB. The UI might lag until re-fetch.
            // In a real app, we'd use React Query or similar for auto-invalidation.
        } catch (error) {
            console.error('Failed to save journal:', error);
            toast.error('Failed to save journal');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (<div className="section mb-10">
                <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Journal</h2>
                <Skeleton className="h-64 w-full"/>
            </div>);
    }

    // If not owner, force public tab
    // if (!isOwner && activeTab !== 'public') setActiveTab('public');
    // (Handled by initial state and TabsTrigger disabling)

    return (<div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Journal</h2>

                <div className="flex items-center gap-2"> {/* Wrapper for date picker and new add button */}
                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
                                    hasEntry: 'text-primary font-bold opacity-100', // Default day style will be set via className or we rely on base style.
                                    // But we want to "grey" others.
                                    // We can use a matcher for "noEntry"? Or style all days as grey and let "hasEntry" override.
                                }}
                                // Override base day class to be muted/grey
                                classNames={{
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full text-muted-foreground opacity-50 hover:opacity-100 hover:text-foreground",
                                    day_today: "bg-accent text-accent-foreground border-2 border-primary opacity-100",
                                    day_selected: "bg-primary text-primary-foreground opacity-100 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                }}
                            />
                        </PopoverContent>
                    </Popover>

                    {isOwner && !isReadOnly && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-card hover:bg-primary/20 hover:text-primary border-border hover:border-primary shadow-sm"
                                        onClick={() => {
                                            setSelectedDate(new Date());
                                            if (isOwner) setActiveTab('private');
                                        }}
                                        title="Add New Journal Entry"
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add New Journal Entry</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'private' | 'public')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="private" disabled={!isOwner}>
                        <Lock className="w-4 h-4 mr-2"/> Private Journal
                    </TabsTrigger>
                    <TabsTrigger value="public">
                        <Globe className="w-4 h-4 mr-2"/> Public Journal
                    </TabsTrigger>
                </TabsList>

                <div className="min-h-[300px] bg-card border border-card-border rounded-xl p-6 relative">
                    {isOwner && !isReadOnly ? (<div className="h-full flex flex-col gap-4">
                            <Textarea
                                value={entryContent}
                                onChange={(e) => setEntryContent(e.target.value)}
                                placeholder={`Write your ${activeTab} thoughts for today...`}
                                className="min-h-[200px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed"
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> :
                                        <Check className="h-4 w-4 mr-2"/>}
                                    Save Entry
                                </Button>
                            </div>
                        </div>) : (<div
                            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words">
                            {entryContent ? (<ReactMarkdown>{entryContent}</ReactMarkdown>) : (
                                <p className="text-muted-foreground italic">No entry for this date.</p>)}
                        </div>)}
                </div>
            </Tabs>
        </div>);
};

export default JournalSection;
