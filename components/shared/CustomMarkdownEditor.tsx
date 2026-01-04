'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import { 
    Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
    List, ListOrdered, Quote, Heading1, Image as ImageIcon, 
    Columns, Eye, Sparkles, FileText
} from 'lucide-react';
// import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';

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
  onUpload?: (file: File) => Promise<string>;
  resolveImageUrl?: (src: string) => Promise<string | null>;
  isPro?: boolean;
  onProAlert?: () => void;
}

type ViewMode = 'edit' | 'split' | 'preview';

const AsyncImage = ({ src, alt, resolve }: { src: string, alt?: string, resolve?: (src: string) => Promise<string | null> }) => {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(resolve ? null : src);

    useEffect(() => {
        if (!resolve || !src) return;
        if (!src.startsWith('storage://')) {
            setResolvedSrc(src);
            return;
        }

        let active = true;
        resolve(src).then(url => {
            if (active) setResolvedSrc(url || src);
        });
        return () => { active = false; };
    }, [src, resolve]);

    if (!resolvedSrc) return <span className="block animate-pulse bg-muted w-full h-48 rounded-md" />; 
    
    return <img src={resolvedSrc} alt={alt} className="rounded-md max-w-full h-auto my-4 border bg-card shadow-sm" loading="lazy" />;
}

export function CustomMarkdownEditor({
    value, 
    onChange, 
    className, 
    textareaClassName,
    placeholder, 
    readOnly, 
    minHeight = 200, 
    fullHeight = false,
    watermark,
    onUpload,
    resolveImageUrl,
    isPro = false,
    onProAlert
}: CustomMarkdownEditorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [viewMode, setViewMode] = useState<ViewMode>(readOnly ? 'preview' : 'edit');
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorHeight, setEditorHeight] = useState(minHeight);

  useEffect(() => {
    if (readOnly) {
      setViewMode('preview');
    }
  }, [readOnly]);

  useEffect(() => {
    if (fullHeight || readOnly || viewMode === 'preview') return;

    const adjustHeight = () => {
      if (editorRef.current) {
        const textarea = editorRef.current.querySelector('textarea');
        if (textarea) {
          textarea.style.height = 'auto';
          const newHeight = textarea.scrollHeight;
          setEditorHeight(Math.max(newHeight + 20, minHeight));
        }
      }
    };

    adjustHeight();
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

  const insertText = useCallback((before: string, after: string = '') => {
    if (!editorRef.current) return;
    const textarea = editorRef.current.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousValue = textarea.value;
    const selectedText = previousValue.substring(start, end);

    const newValue = previousValue.substring(0, start) + before + selectedText + after + previousValue.substring(end);
    onChange(newValue);

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
    const newValue = textarea.value.substring(0, lineStart) + prefix + textarea.value.substring(lineStart);
    onChange(newValue);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }, 0);
  }, [onChange]);

  const handleImageClick = () => {
      if (!isPro && onProAlert) {
          onProAlert();
          return;
      }

      if (onUpload) {
          fileInputRef.current?.click();
      } else {
          insertText('![alt text](', ')');
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUpload) return;
      await processUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && onUpload) {
          await processUpload(file);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const processUpload = async (file: File) => {
      const toastId = toast.loading("Uploading asset...");
      try {
          if (!onUpload) return;

          const path = await onUpload(file);
          insertText(`\n${path}\n`); 
          toast.success("Asset uploaded", { id: toastId });
      } catch (err: any) {
          console.error(err);
          toast.error(err.message || "Upload failed", { id: toastId });
      }
  };

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

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
                p: ({node, ...props}) => <p {...props} className="mb-4 leading-relaxed last:mb-0 text-lg" />,
                strong: ({node, ...props}) => <strong {...props} className="text-primary font-bold" />,
                h1: ({node, ...props}) => <h1 {...props} className="text-foreground text-4xl font-extrabold mt-8 mb-6 tracking-tight border-b pb-2" />,
                h2: ({node, ...props}) => <h2 {...props} className="text-foreground text-3xl font-bold mt-8 mb-4 tracking-tight" />,
                h3: ({node, ...props}) => <h3 {...props} className="text-foreground text-2xl font-semibold mt-6 mb-3" />,
                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-6 text-xl font-serif" />,
                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-6 space-y-2 my-4 text-lg" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-6 space-y-2 my-4 text-lg" />,
                code: ({node, ...props}) => {
                    // @ts-ignore
                    const isInline = props.inline || !String(props.children).includes('\n');
                    return isInline 
                        ? <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium" /> 
                        : <code {...props} className="block bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4 shadow-inner" />;
                },
                img: ({node, src, alt, ...props}) => {
                    return <AsyncImage src={String(src || '')} alt={alt} resolve={resolveImageUrl} />;
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

  const VIEW_OPTIONS = [
      { id: 'edit', label: 'Write', icon: FileText },
      { id: 'split', label: 'Split', icon: Columns },
      { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <>
      {isMobile ? (
        <div 
            ref={editorRef} 
            className={cn(
                "group flex flex-col w-full rounded-xl overflow-hidden transition-all duration-300", 
                fullHeight ? "h-full" : undefined,
                className
            )} 
            style={!fullHeight && !readOnly && viewMode !== 'preview' ? { height: editorHeight + 50 } : undefined} 
            data-color-mode={theme}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

        {!readOnly && (
            <div className={cn(
                "flex flex-col gap-2 p-2 shrink-0 sticky top-0 z-20 transition-all duration-200 bg-transparent"
            )}>
                 {/* Top Row: Toolbar + View Toggle */}
                <div className="flex items-center justify-between w-full">
                     {/* Toggle Button Group - Centered */}
                     <div className="flex-1 flex justify-center">
                        <ToggleButtonGroup 
                            options={VIEW_OPTIONS}
                            selectedValue={viewMode}
                            onValueChange={(val) => setViewMode(val as ViewMode)}
                            className="origin-center" 
                        />
                     </div>
                </div>

                {/* Bottom Row: Formatting Tools */}
                 <div className="flex flex-wrap items-center gap-1 sm:gap-0.5 justify-center bg-card/50 p-1 rounded-lg border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton icon={Bold} label="Bold" onClick={() => insertText('**', '**')} />
                            <ToolbarButton icon={Italic} label="Italic" onClick={() => insertText('*', '*')} />
                            <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => insertText('~~', '~~')} />
                        </div>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton icon={Heading1} label="Heading" onClick={() => insertBlock('# ')} />
                            <ToolbarButton icon={Quote} label="Quote" onClick={() => insertBlock('> ')} />
                            <ToolbarButton icon={Code} label="Code Block" onClick={() => insertText('```\n', '\n```')} />
                        </div>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton icon={List} label="Bullet List" onClick={() => insertBlock('- ')} />
                            <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertBlock('1. ')} />
                            <ToolbarButton icon={LinkIcon} label="Link" onClick={() => insertText('[', '](url)')} />
                        </div>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        {/* Mobile Add Media Button inside toolbar */}
                         <div className="flex items-center">
                            <ToolbarButton icon={ImageIcon} label="Add Media" onClick={handleImageClick} />
                         </div>
                 </div>
            </div>
        )}

        <div className={cn(
            "flex-1 overflow-hidden relative grid bg-card transition-all duration-300",
            viewMode === 'split' ? "grid-cols-2 divide-x" : "grid-cols-1",
            fullHeight ? "h-full" : "min-h-[200px]"
        )}>
            <div className={cn(
                "relative h-full flex flex-col",
                viewMode === 'preview' ? "hidden" : "block",
            )}>
                 {watermark && !value && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden p-10">
                        {watermark}
                    </div>
                 )}
                 <textarea
                    className={cn(
                        "w-full h-full resize-none border-none focus:outline-none p-6",
                        "bg-transparent text-foreground placeholder:text-muted-foreground",
                        "font-sans text-lg leading-relaxed whitespace-pre-wrap break-words overflow-y-auto",
                        "!select-text !cursor-text pointer-events-auto", // FORCE SELECTION
                        textareaClassName
                    )}
                    placeholder={placeholder || "Start writing..."}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                 />
            </div>

            <div className={cn(
                "relative h-full overflow-hidden bg-muted/10",
                viewMode === 'edit' ? "hidden" : "block",
                viewMode === 'preview' && "col-span-1"
            )}>
                {renderMarkdownPreview(value)}
            </div>
        </div>

        {!readOnly && (
            <div className={cn(
                "flex items-center justify-end px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t",
            )}>
                <span className="font-mono">{wordCount} words</span>
            </div>
        )}
        </div>
      ) : (
        <TooltipProvider>
          <div 
              ref={editorRef} 
              className={cn(
                  "group flex flex-col w-full rounded-xl overflow-hidden transition-all duration-300", 
                  fullHeight ? "h-full" : undefined,
                  className
              )} 
              style={!fullHeight && !readOnly && viewMode !== 'preview' ? { height: editorHeight + 50 } : undefined} 
              data-color-mode={theme}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
          >
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

          {!readOnly && (
              <div className={cn(
                  "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between p-2 shrink-0 sticky top-0 z-20 transition-all duration-200 bg-transparent"
              )}>
                  {/* Formatting Tools - Left */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {/* ... (Existing Formatting Tools) ... */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-0.5">
                          <div className="flex items-center gap-0.5">
                              <ToolbarButton icon={Bold} label="Bold" onClick={() => insertText('**', '**')} />
                              <ToolbarButton icon={Italic} label="Italic" onClick={() => insertText('*', '*')} />
                              <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => insertText('~~', '~~')} />
                          </div>
                          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                          <div className="flex items-center gap-0.5">
                              <ToolbarButton icon={Heading1} label="Heading" onClick={() => insertBlock('# ')} />
                              <ToolbarButton icon={Quote} label="Quote" onClick={() => insertBlock('> ')} />
                              <ToolbarButton icon={Code} label="Code Block" onClick={() => insertText('```\n', '\n```')} />
                          </div>
                          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                          <div className="flex items-center gap-0.5">
                              <ToolbarButton icon={List} label="Bullet List" onClick={() => insertBlock('- ')} />
                              <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertBlock('1. ')} />
                              <ToolbarButton icon={LinkIcon} label="Link" onClick={() => insertText('[', '](url)')} />
                          </div>
                      </div>
                  </div>

                  {/* Spacer to push ToggleButtonGroup to center */}
                  <div className="flex-1 hidden sm:block" /> 

                  {/* Centered ToggleButtonGroup */}
                  <ToggleButtonGroup 
                      options={VIEW_OPTIONS}
                      selectedValue={viewMode}
                      onValueChange={(val) => setViewMode(val as ViewMode)}
                      className="origin-center" 
                  />
                  
                  {/* Spacer to push right-most controls to far right */}
                  <div className="flex-1 hidden sm:block" />

                  {/* Right-most controls: Desktop "Add Media" Button */}
                  <div className="flex items-center gap-2 pb-2 sm:pb-0 sm:ml-auto">
                      {/* Desktop "Add Media" Button */}
                       <div className="hidden sm:block">
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-2 ml-1 text-primary hover:text-primary-foreground hover:bg-primary border-primary/20 bg-primary/5 transition-all shadow-sm group"
                                      onClick={handleImageClick}
                                      type="button"
                                  >
                                      <ImageIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                      <span className="hidden sm:inline font-medium text-xs">Add Media</span>
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                  <p>{isPro ? "Upload Images or Video" : "Upgrade to Pro to upload media"}</p>
                              </TooltipContent>
                          </Tooltip>
                       </div>
                  </div>
              </div>
          )}

          <div className={cn(
              "flex-1 overflow-hidden relative grid bg-card transition-all duration-300",
              viewMode === 'split' ? "grid-cols-2 divide-x" : "col-span-1",
              fullHeight ? "h-full" : "min-h-[200px]"
          )}>
              <div className={cn(
                  "relative h-full flex flex-col",
                  viewMode === 'preview' ? "hidden" : "block",
              )}>
                   {watermark && !value && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden p-10">
                          {watermark}
                      </div>
                   )}
                   <textarea
                    className={cn(
                        "w-full h-full resize-none border-none focus:outline-none p-6",
                        "bg-transparent text-foreground placeholder:text-muted-foreground",
                        "font-sans text-lg leading-relaxed whitespace-pre-wrap break-words overflow-y-auto",
                        "!select-text !cursor-text pointer-events-auto", // FORCE SELECTION
                        textareaClassName
                    )}
                    placeholder={placeholder || "Start writing..."}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                 />
              </div>

              <div className={cn(
                  "relative h-full overflow-hidden bg-muted/10",
                  viewMode === 'edit' ? "hidden" : "block",
                  viewMode === 'preview' && "col-span-1"
              )}>
                  {renderMarkdownPreview(value)}
              </div>
          </div>

          {!readOnly && (
              <div className={cn(
                  "flex items-center justify-end px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t",
              )}>
                  <span className="font-mono">{wordCount} words</span>
              </div>
          )}
          </div>
        </TooltipProvider>
      )}
    </>
  );
}