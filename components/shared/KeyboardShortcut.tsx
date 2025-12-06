'use client';

import React, { useState, useEffect } from 'react';

interface KeyboardShortcutProps {
  keys: string[];
  showModifier?: boolean; // Optional prop to show/hide modifier
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, showModifier = true }) => {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Assuming 768px as mobile breakpoint
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) return null;

  const modifier = isMac ? "⌥" : "Alt"; // Option for Mac, Alt for others
  const plusSign = " + "; // The plus sign

  return (
    <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
      {showModifier && (
        <>
          <kbd className="kbd kbd-sm bg-muted px-1 py-0.5 rounded-sm">
            {modifier}
          </kbd>
          {plusSign}
        </>
      )}
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="kbd kbd-sm bg-muted px-1 py-0.5 rounded-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && plusSign} {/* Add plus sign between multiple keys if any */}
        </React.Fragment>
      ))}
    </span>
  );
};

export default KeyboardShortcut;
