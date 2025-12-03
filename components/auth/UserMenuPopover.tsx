import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import InsightsTrigger from '@/components/shared/InsightsTrigger';
import { User as AuthUser } from '@/hooks/useAuth';
import { cn } from "@/lib/utils"; // Import cn utility
import { useKeyboardShortcuts } from '@/components/shared/KeyboardShortcutsProvider'; // Import the new hook

// Helper component for Keyboard Shortcuts
const KeyboardShortcut: React.FC<{ keys: string[]; isMac: boolean; isMobile: boolean }> = ({ keys, isMac, isMobile }) => {
  if (isMobile) return null;

  const modifier = isMac ? "⌥" : "Alt"; // Option for Mac, Alt for others
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
      <kbd className="kbd kbd-sm bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm">
        {modifier}
      </kbd>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="kbd kbd-sm bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
};

interface UserMenuPopoverProps {
  user: AuthUser | null;
  // onOpenKeyboardShortcuts: () => void; // Removed this prop
}

const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ user /* Removed onOpenKeyboardShortcuts from destructuring */ }) => {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toggleShortcutsModal } = useKeyboardShortcuts(); // Use the hook

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Assuming 768px as mobile breakpoint
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0",
          )}
        >
          <User className="h-6 w-6" strokeWidth={2.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="p-2">
          <Link href={`/${user.username}`}>
            <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md">
              View Profile
              <KeyboardShortcut keys={["P"]} isMac={isMac} isMobile={isMobile} />
            </div>
          </Link>
          {user.username && (
            <InsightsTrigger username={user.username}>
              <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                View Insights
                <KeyboardShortcut keys={["I"]} isMac={isMac} isMobile={isMobile} />
              </div>
            </InsightsTrigger>
          )}
          <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer"
               onClick={toggleShortcutsModal}> {/* Use toggleShortcutsModal */}
            Keyboard Shortcuts
            <KeyboardShortcut keys={["/"]} isMac={isMac} isMobile={isMobile} /> {/* Updated to / */}
          </div>

          <div className="my-2 border-t border-primary/50 dark:border-primary/70" />
          <LogoutButton />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenuPopover;