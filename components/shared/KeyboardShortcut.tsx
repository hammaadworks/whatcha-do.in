'use client';

import React, { useState, useEffect } from 'react';

interface KeyboardShortcutProps {
  keys: string[];
  // isMac: boolean; // Will derive this internally
  // isMobile: boolean; // Will derive this internally
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys }) => {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
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
      <kbd className="kbd kbd-sm bg-muted px-1 py-0.5 rounded-sm">
        {modifier}
      </kbd>
      {plusSign} {/* Display the plus sign */}
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
