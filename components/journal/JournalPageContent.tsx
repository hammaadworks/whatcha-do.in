'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Lock, Globe, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { fetchJournalEntryByDate, upsertJournalEntry } from '@/lib/supabase/journal';
import { MarkdownEditor } from './MarkdownEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface JournalPageContentProps {
  profileUserId: string;
  isOwner: boolean;
}

export function JournalPageContent({ profileUserId, isOwner }: JournalPageContentProps) {
  const [date, setDate] = useState<Date>(new Date());
  // If owner, default to Private. If visitor, force Public (and hide Private option).
  const [activeTab, setActiveTab] = useState<'public' | 'private'>(isOwner ? 'private' : 'public');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // To track if content has changed from DB
  const [dbContent, setDbContent] = useState('');

  const isPublic = activeTab === 'public';
  const canEdit = isOwner; // Only owner can edit

  // Fetch entry on date or tab change
  useEffect(() => {
    async function loadEntry() {
      setIsLoading(true);
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        // If visitor tries to access private tab (shouldn't happen due to UI, but safety check), force public fetch logic or fail?
        // Actually RLS protects it, but let's just fetch what we asked for.
        const entry = await fetchJournalEntryByDate(profileUserId, dateStr, isPublic);
        const newContent = entry?.content || '';
        setContent(newContent);
        setDbContent(newContent);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load journal entry');
      } finally {
        setIsLoading(false);
      }
    }
    loadEntry();
  }, [date, activeTab, profileUserId, isPublic]);

  // Save function
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

  // Manual Save
  const handleManualSave = () => {
    saveEntry(content);
  };

  // Keyboard Shortcut Save
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
                        disabled={!isOwner} // If not owner, only public exists, so it's effectively just a label
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

        {/* Editor Area */}
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
                    placeholder={canEdit ? "Write your journal entry here..." : "No entry for this day."}
                    readOnly={!canEdit}
                    className="h-full border-0"
                />
            )}
        </div>
    </div>
  );
}
