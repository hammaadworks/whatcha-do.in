'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BaseModal from './BaseModal'; // Import the new BaseModal
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

interface KeyboardShortcutsModalProps {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ children, open, onOpenChange }) => {

  const [isMac, setIsMac] = useState(false);



  useEffect(() => {

    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

  }, []); // Run once on mount



  const modifierKey = isMac ? "⌥" : "Alt";

  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Keyboard Shortcuts"
      description="Navigate and interact with the application using these shortcuts."
      footerContent={<Button type="button" onClick={() => onOpenChange(false)}>Got it!</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <h4 className="text-sm font-semibold">Global</h4>
                      <div className="flex items-center justify-between">
                        <span>Open Shortcuts</span>
                        <div className="flex space-x-1 items-center">
                          <Kbd>{modifierKey}</Kbd>
                          <span>+</span>
                          <Kbd>/</Kbd>
                        </div>
                      </div>          <div className="flex items-center justify-between">
            <span>View Profile</span>
            <div className="flex space-x-1 items-center">
              <Kbd>{modifierKey}</Kbd>
              <span>+</span>
              <Kbd>P</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>View Insights</span>
            <div className="flex space-x-1 items-center">
              <Kbd>{modifierKey}</Kbd>
              <span>+</span>
              <Kbd>I</Kbd>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h4 className="text-sm font-semibold">Action Items (when focused)</h4>
          <div className="flex items-center justify-between">
            <span>Move Item Up</span>
            <div className="flex space-x-1 items-center">
              <Kbd>{modifierKey}</Kbd>
              <span>+</span>
              <Kbd>↑</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Move Item Down</span>
            <div className="flex space-x-1 items-center">
              <Kbd>{modifierKey}</Kbd>
              <span>+</span>
              <Kbd>↓</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Indent Item</span>
            <div className="flex space-x-1">
              <Kbd>Tab</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Outdent Item</span>
            <div className="flex space-x-1 items-center">
              <Kbd>Shift</Kbd>
              <span>+</span>
              <Kbd>Tab</Kbd>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default KeyboardShortcutsModal;
