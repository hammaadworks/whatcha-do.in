'use client';

import React from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import InsightsTrigger from '@/components/shared/InsightsTrigger';
import { User as AuthUser } from '@/hooks/useAuth';
import { cn } from "@/lib/utils"; // Import cn utility

interface UserMenuPopoverProps {
  user: AuthUser | null;
}

const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0",
          )}
        >
          <User className="h-6 w-6" strokeWidth={2.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="p-2">
          <Link href={`/${user.username}`}>
            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md">
              View Profile
            </div>
          </Link>
          {user.username && (
            <InsightsTrigger username={user.username}>
              <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                View Insights
              </div>
            </InsightsTrigger>
          )}
          <Link href="/settings">
            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md">
              Settings
            </div>
          </Link>
          <div className="my-2 border-t border-primary/50 dark:border-primary/70" />
          <LogoutButton />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenuPopover;