"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddActionFormProps {
  onSave: (description: string) => void;
  onCancel: () => void;
  className?: string;
}

export const AddActionForm: React.FC<AddActionFormProps> = ({ onSave, onCancel, className }) => {
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
      setDescription('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 p-2 rounded-md bg-card border border-card-border", className)}>
      <Input
        ref={inputRef}
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a new action..."
        className="flex-1"
      />
      <Button onClick={handleSave} size="sm">Save</Button>
      <Button onClick={onCancel} variant="ghost" size="sm">Cancel</Button>
    </div>
  );
};