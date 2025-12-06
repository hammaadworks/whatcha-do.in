'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks'; // Import remarkBreaks
import { cn } from '@/lib/utils';
import { Columns, Edit, Eye } from 'lucide-react'; // Only keep icons used for the toggle button
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery'; // Import the hook

interface CustomMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number; // Added minHeight prop
}

type ViewMode = 'edit' | 'split'; // Renamed 'split' to represent split or preview on mobile

// Type guard to check if a command is a group command
function isGroupCommand(command: commands.ICommand): command is commands.ICommand & { group: commands.ICommand[] } {
    return (command as any).group !== undefined && Array.isArray((command as any).group);
}

export function CustomMarkdownEditor({ value, onChange, className, placeholder, readOnly, minHeight = 200, fullHeight = false }: CustomMarkdownEditorProps & { fullHeight?: boolean }) {
  const isMobile = useMediaQuery('(max-width: 768px)'); // Detect screens smaller than 768px
  const [viewMode, setViewMode] = useState<ViewMode>(
    readOnly ? 'edit' : (isMobile ? 'edit' : 'split')
  );
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null); // Ref for the MDEditor container
  const [editorHeight, setEditorHeight] = useState(minHeight);

  // Force edit view if readOnly, and adjust default for mobile
  React.useEffect(() => {
    if (readOnly) {
      setViewMode('edit');
    } else if (isMobile && viewMode === 'split') {
      // If switched to mobile and in split mode, go to edit
      setViewMode('edit');
    }
  }, [readOnly, isMobile, viewMode]); // Added viewMode to dependencies

  const handleOnChange = (value?: string) => {
    onChange(value || '');
  }

  const customCommandsFilter = (command: commands.ICommand, isExtra: boolean): false | commands.ICommand => {
    // Filter out the fullscreen command
    if (command.name === 'fullscreen') {
      return false;
    }
    return command;
  };

  const getCustomCommands = (cmds: commands.ICommand[]): commands.ICommand[] => {
    return cmds.map(cmd => {
      let newCmd: commands.ICommand = { ...cmd };
      // If it's a group command, recurse into its group array
      if (isGroupCommand(newCmd)) {
        newCmd.group = getCustomCommands(newCmd.group);
      }
      // If it's an individual command and has a custom icon, apply it
      if (newCmd.name) { // Use original icons
        // newCmd.icon = customIconMap[newCmd.name]; // No custom icons for now
      }
      return newCmd;
    });
  };

  // Define the toolbar commands using the commands object
  const toolbarCommands: commands.ICommand[] = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.group(
      [commands.title1, commands.title2, commands.title3, commands.title4, commands.title5, commands.title6],
      {
        name: 'title',
        groupName: 'title',
        buttonProps: { 'aria-label': 'Insert title' }
      }
    ),
    commands.divider,
    commands.link,
    commands.quote,
    commands.code,
    commands.codeBlock,
    commands.image,
    commands.orderedListCommand,
    commands.unorderedListCommand,
  ];

  const renderMarkdownPreview = (content: string) => (
    <div className="w-full h-full overflow-auto p-4 prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
            a: ({node, ...props}) => <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" />,
            p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
            strong: ({node, ...props}) => <strong {...props} className="text-primary font-bold" />,
            h1: ({node, ...props}) => <h1 {...props} className="text-primary text-3xl font-bold mt-6 mb-2" />,
            h2: ({node, ...props}) => <h2 {...props} className="text-primary text-2xl font-bold mt-5 mb-2" />,
            h3: ({node, ...props}) => <h3 {...props} className="text-primary text-xl font-bold mt-4 mb-2" />,
            h4: ({node, ...props}) => <h4 {...props} className="text-primary text-lg font-bold mt-3 mb-1" />,
            h5: ({node, ...props}) => <h5 {...props} className="text-primary text-base font-bold mt-2 mb-1" />,
            h6: ({node, ...props}) => <h6 {...props} className="text-primary text-sm font-bold mt-1 mb-1" />,
        }}
      >
        {content || '*No content*'}
      </ReactMarkdown>
    </div>
  );

  React.useEffect(() => {
    if (fullHeight || readOnly) return; // Skip auto-height if fullHeight or readOnly

    const adjustHeight = () => {
      if (editorRef.current) {
        const textarea = editorRef.current.querySelector('textarea');
        if (textarea) {
          textarea.style.height = 'auto'; // Temporarily set to auto
          const newHeight = textarea.scrollHeight;
          setEditorHeight(Math.max(newHeight, minHeight));
        }
      }
    };

    adjustHeight(); // Initial adjustment
    const observer = new MutationObserver(adjustHeight); // Adjust on DOM changes (e.g., paste)
    if (editorRef.current) {
      observer.observe(editorRef.current, { childList: true, subtree: true, attributes: true });
    }
    window.addEventListener('resize', adjustHeight); // Adjust on window resize

    return () => {
      window.removeEventListener('resize', adjustHeight);
      observer.disconnect();
    };
  }, [value, minHeight, editorRef, fullHeight, readOnly]);


  return (
    <div ref={editorRef} style={readOnly || fullHeight ? (fullHeight ? {height: '100%'} : undefined) : { height: editorHeight }} className={cn("flex flex-col w-full border rounded-md overflow-hidden", className)} data-color-mode={theme}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'split' : 'edit')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'edit' ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"
            )}
            title={viewMode === 'edit' ? (isMobile ? "Show Preview" : "Show Split View") : "Show Edit View"}
          >
            {viewMode === 'edit' ? (isMobile ? <Eye className="h-4 w-4" /> : <Columns className="h-4 w-4" />) : <Edit className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-xs text-muted-foreground px-2">
          Markdown Supported
        </div>
      </div>
      )}

      {/* Content */}
      <div className={cn("flex-1 overflow-hidden relative")}> {/* Removed h-full from here to allow dynamic height */}
        {readOnly ? (
           renderMarkdownPreview(value)
        ) : (
           <>
            {(viewMode === 'edit') && ( // Always render editor if readOnly or in edit mode
              <MDEditor
                value={value}
                onChange={handleOnChange}
                className="w-full h-full"
                textareaProps={{
                    placeholder: placeholder,
                    style: { minHeight: minHeight, height: 'auto' } // Ensure textarea can grow
                }}
                commands={toolbarCommands} // Use original commands
                commandsFilter={customCommandsFilter}
                preview="edit" // Always show only editor in this mode
              />
            )}
            {isMobile && viewMode === 'split' && renderMarkdownPreview(value)}
            {!isMobile && viewMode === 'split' && ( // Show split view for large screens
               <MDEditor
                  value={value}
                  onChange={handleOnChange}
                  className="w-full h-full"
                  textareaProps={{
                    placeholder: placeholder,
                    style: { minHeight: minHeight, height: 'auto' } // Ensure textarea can grow
                  }}
                  commands={toolbarCommands} // Use original commands
                  commandsFilter={customCommandsFilter}
                  preview="live" // Show split view
               />
            )}
           </>
        )}
      </div>
    </div>
  );
}