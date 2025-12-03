'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Edit, Columns, Eye } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

type ViewMode = 'edit' | 'split' | 'preview';

export function MarkdownEditor({ value, onChange, className, placeholder, readOnly }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(readOnly ? 'preview' : 'split');

  // Force preview if readOnly
  React.useEffect(() => {
    if (readOnly) {
      setViewMode('preview');
    }
  }, [readOnly]);

  return (
    <div className={cn("flex flex-col h-full w-full border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('edit')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'edit' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"
            )}
            title="Edit Only"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={cn(
              "p-1.5 rounded-md transition-colors hidden sm:block", // Hide split on small screens
              viewMode === 'split' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"
            )}
            title="Split View"
          >
            <Columns className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'preview' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"
            )}
            title="Preview Only"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground px-2">
          Markdown Supported
        </div>
      </div>
      )}

      {/* Content */}
      <div className={cn("flex-1 overflow-hidden relative", readOnly && "bg-transparent border-0")}>
        {viewMode === 'edit' && !readOnly && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full resize-none border-0 rounded-none p-4 focus-visible:ring-0"
            placeholder={placeholder}
          />
        )}

        {viewMode === 'preview' && (
          <div className="w-full h-full overflow-auto p-4 prose dark:prose-invert max-w-none">
            <ReactMarkdown>{value || (readOnly ? '*No entry for this day.*' : '*No content*')}</ReactMarkdown>
          </div>
        )}

        {viewMode === 'split' && !readOnly && (
          <div className="flex w-full h-full divide-x">
            <div className="w-1/2 h-full">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full resize-none border-0 rounded-none p-4 focus-visible:ring-0"
                placeholder={placeholder}
              />
            </div>
            <div className="w-1/2 h-full overflow-auto p-4 prose dark:prose-invert max-w-none bg-muted/10">
              <ReactMarkdown>{value || '*No content*'}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
