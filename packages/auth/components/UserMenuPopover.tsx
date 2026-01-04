import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Smartphone, BarChart3, LogOut, Keyboard, ChevronRight } from 'lucide-react';
import InsightsTrigger from '@/components/shared/InsightsTrigger';
import { User as AuthUser } from '@/packages/auth/hooks/useAuth';
import { useKeyboardShortcuts } from '@/components/shared/KeyboardShortcutsProvider';
import { DeviceConnectionModal } from '@/packages/auth/components/DeviceConnectionModal';
import { createClient } from "@/packages/auth/lib/supabase/client";
import KeyboardShortcut from "@/components/shared/KeyboardShortcut.tsx";

interface UserMenuPopoverProps {
  user: AuthUser | null;
}

const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ user }) => {
  const { toggleShortcutsModal } = useKeyboardShortcuts();
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    } else {
        router.push("/");
    }
  };

  const initial = user.username ? user.username.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 overflow-hidden"
          >
            <Avatar className="h-10 w-10 border border-border">
              {/* <AvatarImage src={user.avatar_url} alt={user.username || 'User'} /> */}
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">{initial}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 mr-4" align="end">
            <div className="flex items-center gap-3 p-4 bg-muted/30">
              <Avatar className="h-10 w-10 border border-border">
                {/* <AvatarImage src={user.avatar_url} alt={user.username || 'User'} /> */}
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{initial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{user.username || 'User'}</span>
                    {user.is_pro && <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-none">PRO</Badge>}
                </div>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="p-1">
                <Link href={`/${user.username}`} onClick={() => setIsPopoverOpen(false)}>
                  <div className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group">
                    <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span>Profile</span>
                    </div>
                    <KeyboardShortcut keys={["."]} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                  </div>
                </Link>

                <div 
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group"
                    onClick={() => {
                        toggleShortcutsModal();
                        setIsPopoverOpen(false);
                    }}
                >
                    <div className="flex items-center">
                        <Keyboard className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span>Shortcuts</span>
                    </div>
                    <KeyboardShortcut keys={["/"]} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                </div>

                <div 
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group"
                    onClick={() => {
                        setIsDeviceModalOpen(true);
                        setIsPopoverOpen(false);
                    }}
                >
                    <div className="flex items-center">
                        <Smartphone className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span>Mobile Login</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                </div>
                
                 {user?.username && (
                  <InsightsTrigger username={user.username} >
                    <div className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group">
                        <div className="flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span>Insights</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                    </div>
                  </InsightsTrigger>
                )}
            </div>
            
            <Separator />
            
            <div className="p-1">
                 <div 
                    className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-red-500/10 hover:text-red-600 text-red-600 cursor-pointer transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </div>
            </div>
        </PopoverContent>
      </Popover>

      <DeviceConnectionModal 
        open={isDeviceModalOpen} 
        onOpenChange={setIsDeviceModalOpen} 
      />
    </>
  );
};

export default UserMenuPopover;