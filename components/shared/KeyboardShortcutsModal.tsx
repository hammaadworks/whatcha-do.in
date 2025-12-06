'use client';

import React from 'react';
import BaseModal from './BaseModal';
import { Button } from '@/components/ui/button';
import KeyboardShortcut from './KeyboardShortcut';
import { Globe, ListTodo, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShortcutRow: React.FC<{ label: string; keys: string[]; showModifier?: boolean }> = ({ 
  label, 
  keys, 
  showModifier = true 
}) => (
  <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 group hover:bg-muted/30 rounded-md px-2 transition-colors">
    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    <KeyboardShortcut keys={keys} showModifier={showModifier} />
  </div>
);

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ open, onOpenChange }) => {
  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Keyboard Shortcuts"
      description="Navigate and interact with the application using these shortcuts."
      footerContent={<Button type="button" onClick={() => onOpenChange(false)}>Got it!</Button>}
      className="max-w-4xl" // Make modal wider
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
        {/* Global Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-border pb-2">
            <Globe className="w-4 h-4" />
            <h4 className="font-semibold text-sm uppercase tracking-wider">Global Navigation</h4>
          </div>
          <div className="space-y-1">
            <ShortcutRow label="Open Shortcuts" keys={["/"]} />
            <ShortcutRow label="View Profile" keys={["P"]} />
            <ShortcutRow label="View Insights" keys={["I"]} />
            <ShortcutRow label="Open Settings" keys={["S"]} />
            <ShortcutRow label="Toggle Theme" keys={["C"]} />
            <ShortcutRow label="Add Action" keys={["A"]} />
            <ShortcutRow label="Add Target" keys={["T"]} />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-border pb-2">
            <ListTodo className="w-4 h-4" />
            <h4 className="font-semibold text-sm uppercase tracking-wider">Action & Target Items <span className="text-xs text-muted-foreground normal-case font-normal">(when focused)</span></h4>
          </div>
          <div className="space-y-1">
            <ShortcutRow label="Toggle Completion" keys={["Enter"]} showModifier={false} />
            <ShortcutRow label="Edit Content" keys={["Space"]} showModifier={false} />
            <ShortcutRow label="Add Below (Edit)" keys={["Shift", "Enter"]} showModifier={false} />
            <ShortcutRow label="Toggle Public/Private" keys={["P"]} showModifier={false} />
            <ShortcutRow label="Delete Item" keys={["Del"]} showModifier={false} />
            
            {/* Grouping Navigation */}
            <div className="pt-2 mt-2 border-t border-border/40">
               <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Hierarchy & Movement</p>
               <ShortcutRow label="Indent Item" keys={["Tab"]} showModifier={false} />
               <ShortcutRow label="Outdent Item" keys={["Shift", "Tab"]} showModifier={false} />
               <ShortcutRow label="Move Item Up" keys={["Shift", "↑"]} showModifier={false} />
               <ShortcutRow label="Move Item Down" keys={["Shift", "↓"]} showModifier={false} />
               <ShortcutRow label="Navigate Up" keys={["↑"]} showModifier={false} />
               <ShortcutRow label="Navigate Down" keys={["↓"]} showModifier={false} />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default KeyboardShortcutsModal;
