'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import { 
    Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
    List, ListOrdered, Quote, Heading1, Image as ImageIcon, 
    Columns, Eye, EyeOff, Maximize2, Sparkles, FileText
} from 'lucide-react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface CustomMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  fullHeight?: boolean;
  textareaClassName?: string;
  watermark?: React.ReactNode;
}

type ViewMode = 'edit' | 'split' | 'preview';

export function CustomMarkdownEditor({ 
    value, 
    onChange, 
    className, 
    textareaClassName,
    placeholder, 
    readOnly, 
    minHeight = 200, 
    fullHeight = false,
    watermark
}: CustomMarkdownEditorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [viewMode, setViewMode] = useState<ViewMode>(readOnly ? 'preview' : 'edit');
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(minHeight);

  // Sync view mode with readOnly prop
  useEffect(() => {
    if (readOnly) {
      setViewMode('preview');
    }
  }, [readOnly]);

  // Adjust height for non-fullHeight mode
  useEffect(() => {
    if (fullHeight || readOnly || viewMode === 'preview') return;

    const adjustHeight = () => {
      if (editorRef.current) {
        const textarea = editorRef.current.querySelector('textarea');
        if (textarea) {
          textarea.style.height = 'auto';
          const newHeight = textarea.scrollHeight;
          setEditorHeight(Math.max(newHeight, minHeight));
        }
      }
    };

    adjustHeight();
    // Observe changes
    const observer = new MutationObserver(adjustHeight);
    if (editorRef.current) {
      observer.observe(editorRef.current, { childList: true, subtree: true, attributes: true });
    }
    window.addEventListener('resize', adjustHeight);

    return () => {
      window.removeEventListener('resize', adjustHeight);
      observer.disconnect();
    };
  }, [value, minHeight, fullHeight, readOnly, viewMode]);


  // --- Text Insertion Logic for Custom Toolbar ---
  const insertText = useCallback((before: string, after: string = '') => {
    if (!editorRef.current) return;
    const textarea = editorRef.current.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousValue = textarea.value;
    const selectedText = previousValue.substring(start, end);

    const newValue = 
        previousValue.substring(0, start) + 
        before + selectedText + after + 
        previousValue.substring(end);

    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [onChange]);

  const insertBlock = useCallback((prefix: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    
    const newValue = 
        textarea.value.substring(0, lineStart) + 
        prefix + 
        textarea.value.substring(lineStart);
    
    onChange(newValue);
    
    setTimeout(() => {
        textarea.focus();
        // Move cursor to end of inserted prefix
        textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }, 0);
  }, [onChange]);


  const ToolbarButton = ({ icon: Icon, label, onClick, active = false }: { icon: any, label: string, onClick: () => void, active?: boolean }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant={active ? "secondary" : "ghost"}
                size="icon"
                className={cn("h-8 w-8", active && "bg-muted text-foreground")}
                onClick={onClick}
                type="button"
            >
                <Icon className="h-4 w-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
            <p>{label}</p>
        </TooltipContent>
    </Tooltip>
  );

  const renderMarkdownPreview = (content: string) => (
    <div className={cn(
        "w-full h-full overflow-auto p-6 prose dark:prose-invert max-w-none bg-card/50",
        fullHeight ? "min-h-full" : "min-h-[200px]"
    )}>
      {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={{
                a: ({node, ...props}) => <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" />,
                p: ({node, ...props}) => <p {...props} className="mb-4 leading-relaxed last:mb-0" />,
                strong: ({node, ...props}) => <strong {...props} className="text-primary font-bold" />,
                h1: ({node, ...props}) => <h1 {...props} className="text-foreground text-3xl font-extrabold mt-8 mb-4 tracking-tight border-b pb-2" />,
                h2: ({node, ...props}) => <h2 {...props} className="text-foreground text-2xl font-bold mt-6 mb-3 tracking-tight" />,
                h3: ({node, ...props}) => <h3 {...props} className="text-foreground text-xl font-semibold mt-5 mb-2" />,
                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4" />,
                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-6 space-y-1 my-4" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-6 space-y-1 my-4" />,
                code: ({node, ...props}) => {
                    // @ts-ignore
                    const isInline = props.inline || !String(props.children).includes('\n');
                    return isInline 
                        ? <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium" /> 
                        : <code {...props} className="block bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4" />
                }
            }}
          >
            {content}
          </ReactMarkdown>
      ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 italic">
             <Sparkles className="h-8 w-8 mb-2" />
             <p>Nothing here yet...</p>
          </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
        <div 
            ref={editorRef} 
            className={cn(
                "group flex flex-col w-full rounded-xl border border-input bg-background shadow-sm overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                fullHeight ? "h-full" : undefined,
                className
            )} 
            style={!fullHeight && !readOnly && viewMode !== 'preview' ? { height: editorHeight + 50 } : undefined} // +50 for toolbar approx
            data-color-mode={theme}
        >
        {/* Custom Toolbar */}
        {!readOnly && (
            <div className="flex items-center justify-between p-1.5 border-b bg-muted/20 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-2">
                    {/* Formatting */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton icon={Bold} label="Bold" onClick={() => insertText('**', '**')} />
                        <ToolbarButton icon={Italic} label="Italic" onClick={() => insertText('*', '*')} />
                        <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => insertText('~~', '~~')} />
                    </div>
                    
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    
                    {/* Elements */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton icon={Heading1} label="Heading" onClick={() => insertBlock('# ')} />
                        <ToolbarButton icon={Quote} label="Quote" onClick={() => insertBlock('> ')} />
                        <ToolbarButton icon={Code} label="Code Block" onClick={() => insertText('```\n', '\n```')} />
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Lists & Links */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton icon={List} label="Bullet List" onClick={() => insertBlock('- ')} />
                        <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertBlock('1. ')} />
                        <ToolbarButton icon={LinkIcon} label="Link" onClick={() => insertText('[', '](url)')} />
                        <ToolbarButton icon={ImageIcon} label="Image" onClick={() => insertText('![alt text](', ')')} />
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex items-center gap-1 pl-2 border-l bg-background/50 rounded-lg ml-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "h-7 px-2 text-xs gap-1.5 rounded-md transition-colors flex items-center justify-center",
                                    viewMode === 'edit'
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                                onClick={() => setViewMode('edit')}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span className={cn("hidden sm:inline", viewMode !== 'edit' && "sr-only lg:not-sr-only")}>Write</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Mode</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "h-7 px-2 text-xs gap-1.5 rounded-md transition-colors items-center justify-center hidden sm:flex",
                                    viewMode === 'split'
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                                onClick={() => setViewMode('split')}
                            >
                                <Columns className="h-3.5 w-3.5" />
                                <span className={cn("hidden lg:inline", viewMode !== 'split' && "sr-only lg:not-sr-only")}>Split</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Split View</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "h-7 px-2 text-xs gap-1.5 rounded-md transition-colors flex items-center justify-center",
                                    viewMode === 'preview'
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                                onClick={() => setViewMode('preview')}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                <span className={cn("hidden sm:inline", viewMode !== 'preview' && "sr-only lg:not-sr-only")}>Preview</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Preview Mode</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className={cn(
            "flex-1 overflow-hidden relative grid bg-card",
            viewMode === 'split' ? "grid-cols-2 divide-x" : "grid-cols-1",
            fullHeight ? "h-full" : "min-h-[200px]" // Ensure this container fills height if fullHeight is true
        )}>
            {/* Editor Pane */}
            <div className={cn(
                "relative h-full flex flex-col",
                viewMode === 'preview' ? "hidden" : "block"
            )}>
                 {watermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden p-10">
                        {watermark}
                    </div>
                 )}
                 <MDEditor
                    value={value}
                    onChange={(val) => onChange(val || '')}
                    className="w-full h-full border-none !shadow-none !bg-transparent" // Added !bg-transparent
                    visibleDragbar={false}
                    hideToolbar={true}
                    height="100%" // Explicitly set height to 100%
                    preview="edit"
                    style={{ backgroundColor: 'transparent' }} // Inline style fallback
                    textareaProps={{
                        placeholder: placeholder || "Start writing...",
                        className: cn("focus:outline-none !font-mono !text-sm leading-relaxed p-4 h-full bg-transparent z-10 relative", textareaClassName) // Ensure textarea fills height and accepts custom classes
                    }}
                 />
            </div>

            {/* Preview Pane */}
            <div className={cn(
                "relative h-full overflow-hidden bg-muted/10",
                viewMode === 'edit' ? "hidden" : "block",
                viewMode === 'preview' && "col-span-1"
            )}>
                {renderMarkdownPreview(value)}
            </div>
        </div>
        </div>
    </TooltipProvider>
  );
}