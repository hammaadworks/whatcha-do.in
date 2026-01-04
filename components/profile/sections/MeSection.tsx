"use client";

import React from "react";
import BioSection from "@/components/profile/sections/BioSection";
import IdentitySection from "@/components/profile/sections/IdentitySection";
import TargetsSection from "@/components/profile/sections/TargetsSection";
import { Habit, PublicUserDisplay } from "@/lib/supabase/types";
import { User } from "@/packages/auth/hooks/useAuth";
import { CollapsibleSectionWrapper } from "@/components/ui/collapsible-section-wrapper";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

interface MeSectionProps {
  isCollapsible: boolean;
  isReadOnly: boolean;
  username: string;
  profileToDisplay: PublicUserDisplay | User;
  ownerHabits: Habit[];
  onBioUpdate: (newBio: string) => Promise<void>;
  onActivityLogged: () => Promise<void>;
  timezone: string;
  isFolded: boolean;
  toggleFold: () => void;
}

const MeSection: React.FC<MeSectionProps> = ({
                                               isCollapsible,
                                               isReadOnly,
                                               username,
                                               profileToDisplay,
                                               ownerHabits,
                                               onBioUpdate,
                                               onActivityLogged,
                                               timezone,
                                               isFolded,
                                               toggleFold
                                             }) => {
  const { resolvedTheme } = useTheme();
  const gradientColor = resolvedTheme === "dark" ? "#262626" : "#D9D9D955";

  return (<CollapsibleSectionWrapper
    title="Me"
    isCollapsible={isCollapsible}
    isFolded={isFolded}
    toggleFold={toggleFold}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bio Section - Takes full height of the first column */}
      <div className="lg:col-span-1 h-full">
        <MagicCard 
            className="h-full flex flex-col p-6" 
            gradientColor={gradientColor}
        >
          <BioSection
            userId={profileToDisplay.id}
            username={username}
            bio={profileToDisplay.bio ?? null}
            isOwner={true}
            isReadOnly={isReadOnly}
            onBioUpdate={onBioUpdate}
          />
        </MagicCard>
      </div>

      {/* Right Column: Identity and Targets */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <MagicCard 
            className="p-6" 
            gradientColor={gradientColor}
        >
            <IdentitySection isOwner={true} isReadOnly={isReadOnly} ownerHabits={ownerHabits} onHabitUpdated={onActivityLogged} />
        </MagicCard>
        
        <MagicCard 
            className="p-6" 
            gradientColor={gradientColor}
        >
            <TargetsSection
              isOwner={true}
              isReadOnly={isReadOnly}
              timezone={timezone}
              onActivityLogged={onActivityLogged}
            />
        </MagicCard>
      </div>
    </div>
  </CollapsibleSectionWrapper>);
};

export default MeSection;