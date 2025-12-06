"use client";

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import KeyboardShortcut from './KeyboardShortcut'; // Import KeyboardShortcut
import { Plus } from 'lucide-react'; // For a possible icon on the Add button

interface AddActionFormProps {
  onSave: (description: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  autoFocusOnMount?: boolean;
  triggerKey?: string; // Add triggerKey prop
}

export const AddActionForm = React.forwardRef<
  { focusInput: () => void; clearInput: () => void; isInputFocused: () => boolean; isInputEmpty: () => boolean; blurInput: () => void; },
  AddActionFormProps
>(({ onSave, onCancel, className, placeholder = "Add a new action...", autoFocusOnMount = true, triggerKey = 'A' }, ref) => {
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
    clearInput: () => {
      setDescription('');
    },
    isInputFocused: () => {
      return inputRef.current === document.activeElement;
    },
    isInputEmpty: () => {
      return description === '';
    },
    blurInput: () => {
      inputRef.current?.blur();
    },
  }));

  useEffect(() => {
    if (autoFocusOnMount) {
      inputRef.current?.focus();
    }
  }, [autoFocusOnMount]);

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
      setDescription('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if it were in a form tag
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault(); // Prevent default browser escape behavior
      onCancel();
    }
  };

  const isInputFocused = inputRef.current === document.activeElement;

  // Determine keyboard symbols based on OS (simplified check)
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const AltKey = () => <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{isMac ? '⌥' : 'Alt'}</kbd>;
  const Key = ({ char }: { char: string }) => <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{char}</kbd>;

  return (
    <div className={cn(
      "flex items-center space-x-2 py-2 transition-all duration-200 relative", 
      className
    )}>
      <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full border bg-background text-foreground shadow-sm rounded-md px-3 py-2 text-base h-10",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isInputFocused ? "border-primary" : "border-input"
            )}
          />
          {/* Custom Rich Placeholder */}
          {description === '' && (
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-muted-foreground text-sm whitespace-nowrap overflow-hidden">
                  {isInputFocused ? (
                      <span className="flex items-center gap-1 opacity-50">
                          Use <Key char="↑" /> <Key char="↓" /> to navigate, <AltKey/> + <Key char="/" /> for shortcuts
                      </span>
                  ) : (
                      <span className="flex items-center gap-1 opacity-50">
                          <AltKey/> + <Key char={triggerKey} /> to register actions
                      </span>
                  )}
              </div>
          )}
      </div>
      
      {description !== '' && (
        <>
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={!description.trim()}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add</span>
          </Button>
          <Button onClick={onCancel} variant="ghost" size="sm">Cancel</Button>
        </>
      )}
    </div>
  );
});

AddActionForm.displayName = 'AddActionForm';