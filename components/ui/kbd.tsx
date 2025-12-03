import * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-100 bg-neutral-200 px-1.5 font-mono text-[10px] font-medium text-neutral-900 opacity-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50",
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = "Kbd";

export { Kbd };
