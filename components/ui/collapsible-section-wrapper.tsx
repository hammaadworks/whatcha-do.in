import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionWrapperProps {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  isFolded?: boolean; // New prop for external control
  toggleFold?: () => void; // New prop for external control
}

export const CollapsibleSectionWrapper: React.FC<CollapsibleSectionWrapperProps> = ({
  title,
  children,
  rightElement,
  isCollapsible = false,
  defaultOpen = true,
  isFolded: externalIsFolded, // Rename to avoid conflict with internal state
  toggleFold: externalToggleFold, // Rename to avoid conflict
}) => {
  // Use internal state if external props are not provided
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  // Determine effective isOpen and toggle function
  const currentIsOpen = externalIsFolded !== undefined ? !externalIsFolded : internalIsOpen; // if externalIsFolded is true, section is folded so content is not open.
  
  const effectiveToggle = useCallback(() => {
    if (isCollapsible) {
      if (externalToggleFold) {
        externalToggleFold(); // Use external toggler if provided
      } else {
        setInternalIsOpen((prev) => !prev); // Otherwise, use internal toggler
      }
    }
  }, [isCollapsible, externalToggleFold]);

  return (
    <div className="section mb-10">
      <div
        className={cn(
          "flex justify-between items-center border-b border-primary pb-4 mb-6 select-none",
          isCollapsible && "cursor-pointer group"
        )}
        onClick={effectiveToggle} // Use the effective toggle
      >
        <h2 className="text-2xl font-extrabold text-primary group-hover:opacity-80 transition-opacity">{title}</h2>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            {rightElement}
          </div>
          {isCollapsible && (
            <ChevronDown
              className={cn(
                'transition-transform duration-300 h-6 w-6 text-primary',
                currentIsOpen ? 'rotate-180' : 'animate-chevron-pulse' // Apply animation when closed
              )}
            />
          )}
        </div>
      </div>
      {/* Conditionally apply 'hidden' class based on currentIsOpen */}
      <div className={cn(
        "animate-in slide-in-from-top-2 fade-in duration-300",
        isCollapsible && !currentIsOpen && "hidden" // Hide if collapsible and not open
      )}>
        {children}
      </div>
    </div>
  );
};
