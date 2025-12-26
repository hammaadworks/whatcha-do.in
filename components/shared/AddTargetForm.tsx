"use client";

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import KeyboardShortcut from './KeyboardShortcut';
import { Plus } from 'lucide-react';

interface AddTargetFormProps {
  onSaveTarget: (targetDescription: string) => void;
  onCancel: () => void;
  className?: string;
  targetPlaceholder?: string;
  autoFocusOnMount?: boolean;
  targetTriggerKey?: string;
}

export interface AddTargetFormHandle {
  focusInput: () => void;
  clearInput: () => void;
  isInputFocused: () => boolean;
  isInputEmpty: () => boolean;
  blurInput: () => void;
}

/**
 * A form component for adding new targets.
 * Supports keyboard shortcuts, focus management, and an imperative handle.
 */
export const AddTargetForm = React.forwardRef<
  AddTargetFormHandle,
  AddTargetFormProps
>(({ onSaveTarget, onCancel, className, targetPlaceholder = "Add a new target...", autoFocusOnMount = true, targetTriggerKey = 'T' }, ref) => {
  const [targetDescription, setTargetDescription] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
    clearInput: () => {
      setTargetDescription('');
    },
    isInputFocused: () => {
      return isFocused;
    },
    isInputEmpty: () => {
      return targetDescription === '';
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
    if (targetDescription.trim()) {
      onSaveTarget(targetDescription.trim());
      setTargetDescription('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

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
            value={targetDescription}
            onChange={(e) => setTargetDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full border bg-background text-foreground shadow-sm rounded-md px-3 py-2 text-base h-10",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isFocused ? "border-primary" : "border-input"
            )}
          />
          {/* Custom Rich Placeholder */}
          {targetDescription === '' && (
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-muted-foreground text-sm whitespace-nowrap overflow-hidden">
                  {isFocused ? (
                      <span className="flex items-center gap-1 opacity-50">
                          Use <Key char="↑" /> <Key char="↓" /> to navigate, <AltKey/> + <Key char="/" /> for shortcuts
                      </span>
                  ) : (
                      <span className="flex items-center gap-1 opacity-50">
                          <AltKey/> + <Key char={targetTriggerKey} /> to register targets
                      </span>
                  )}
              </div>
          )}
      </div>
      
      {targetDescription !== '' && (
        <>
          <Button 
            onClick={handleSave} 
            size="sm" 
            disabled={!targetDescription.trim()}
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

AddTargetForm.displayName = 'AddTargetForm';
