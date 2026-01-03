"use client";

import { ActionNode, Habit, Identity, JournalEntry, PublicUserDisplay } from "@/lib/supabase/types"; // Import ActionNode, Habit, JournalEntry, Identity
import ProfileLayout from "@/components/profile/ProfileLayout";
import ActionsSection from "@/components/profile/sections/ActionsSection";
import { HabitsSection } from "@/components/profile/sections/HabitsSection";
import JournalSection from "@/components/profile/sections/JournalSection";
import MotivationsSection from "@/components/profile/sections/MotivationsSection";
import IdentitySection from "@/components/profile/sections/IdentitySection"; // Import
import TargetsSection from "@/components/profile/sections/TargetsSection"; // Import
import BioSection from "@/components/profile/sections/BioSection";

import { ViewSelector } from "@/components/profile/ViewSelector";
import { getReferenceDateUI, getTodayISO } from "@/lib/date.ts";
import { useBrandTheme } from "@/components/theme/BrandThemeProvider";
import { THEMES } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth"; // To check if viewer is logged in and owner
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";

type PublicProfileViewProps = {
  user: PublicUserDisplay;
  publicActions: ActionNode[];
  publicHabits: Habit[];
  publicJournalEntries: JournalEntry[];
  publicIdentities: (Identity & { backingCount: number })[];
  publicTargets: ActionNode[];
  privateCount?: number;
  showViewSelector?: boolean;
};

export function PublicPage({
                             user,
                             publicActions,
                             publicHabits,
                             publicJournalEntries,
                             publicIdentities,
                             publicTargets,
                             privateCount = 0,
                             showViewSelector = true
                           }: Readonly<PublicProfileViewProps>) {
  // Canonical Time Logic
  const timezone = user?.timezone || "UTC";
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);
  const todayISO = getTodayISO(timezone, refDate);
  
  const { theme } = useBrandTheme();
  const activeThemeObj = THEMES.find(t => t.id === theme);
  const { user: viewer } = useAuth();

  const headerContent = showViewSelector ? (
    <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-4">
       {/* Theme Badge */}
       {activeThemeObj && (
         <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-700">
           <Palette className="w-3 h-3" />
           <span>Theme: <span className="font-semibold text-foreground">{activeThemeObj.name}</span></span>
           {viewer?.username !== user.username && (
               <Link 
                    href={`?theme-preview=${activeThemeObj.id}`} 
                    scroll={false} 
                    replace
                    passHref
                >
                 <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-xs text-primary">
                   Use this
                 </Button>
               </Link>
           )}
         </div>
       )}
      <ViewSelector />
    </div>
  ) : null;

  return (
    <div className="relative pt-8 lg:pt-4 w-full max-w-6xl">
      <ProfileLayout
        username={user.username || ""}
        isOwner={false}
        timezone={user.timezone} // Pass timezone
        headerContent={headerContent}
      >
        {/* Top row: Bio and Identity AND Targets wrapped in one div for Section Layout consistency */}
        <div className="flex flex-col gap-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BioSection
                username={user.username || ""}
                bio={user.bio ?? null}
                isOwner={false}
                isReadOnly={true}
              />
            </div>
            <div>
              <IdentitySection
                isOwner={false}
                isReadOnly={true}
                identities={publicIdentities}
                ownerHabits={[]}
              />
            </div>
          </div>

          <div className="">
            <TargetsSection
              isOwner={false}
              isReadOnly={true}
              timezone={user.timezone || "UTC"}
              targets={publicTargets}
            />
          </div>
        </div>

        <ActionsSection
          isOwner={false}
          actions={publicActions}
          loading={false} // Always false for public page sections
          privateCount={privateCount} // Pass privateCount
        />
        <HabitsSection
          isOwner={false}
          habits={publicHabits}
          loading={false} // Always false for public page sections
          todayISO={todayISO}
        />
        <JournalSection
          isOwner={false}
          journalEntries={publicJournalEntries} // Pass public journal entries
          loading={false} // Always false for public page sections
        />
        <MotivationsSection
          username={user.username || ""}
          isOwner={false} // Always false for public page sections
          loading={false} // Always false for public page sections
        />
      </ProfileLayout>
    </div>
  );
}
