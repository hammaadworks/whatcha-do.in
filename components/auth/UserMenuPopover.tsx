import React from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import InsightsTrigger from '@/components/shared/InsightsTrigger';
import { User as AuthUser } from '@/hooks/useAuth';
import { cn } from "@/lib/utils"; // Import cn utility
import { useKeyboardShortcuts } from '@/components/shared/KeyboardShortcutsProvider'; // Import the new hook
import KeyboardShortcut from '@/components/shared/KeyboardShortcut'; // Import the new shared KeyboardShortcut component

interface UserMenuPopoverProps {
  user: AuthUser | null;
}

const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ user }) => {
  // Extract isInsightsOpen and toggleInsightsModal from the hook
  const { toggleShortcutsModal, isInsightsOpen, toggleInsightsModal } = useKeyboardShortcuts();

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
            <div className="flex justify-between items-center px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">
              View Profile
              <KeyboardShortcut keys={["P"]} />
            </div>
          </Link>
          <div className="flex justify-between items-center px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md cursor-pointer"
               onClick={toggleShortcutsModal}>
            Keyboard Shortcuts
            <KeyboardShortcut keys={["/"]} />
          </div>

          {user?.username && ( // Conditionally render InsightsTrigger if user is logged in
            <InsightsTrigger username={user.username} open={isInsightsOpen} onOpenChange={toggleInsightsModal} />
          )}

          <div className="my-2 border-t border-border" />
          <LogoutButton />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenuPopover;