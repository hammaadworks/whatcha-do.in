"use client";

import React from "react";
import BioSection from "@/components/profile/sections/BioSection";
import IdentitySection from "@/components/profile/sections/IdentitySection";
import TargetsSection from "@/components/profile/sections/TargetsSection";
import { Habit, PublicUserDisplay, Identity, ActionNode } from "@/lib/supabase/types";
import { User } from "@/packages/auth/hooks/useAuth";
import { CollapsibleSectionWrapper } from "@/components/ui/collapsible-section-wrapper";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

interface MeSectionProps {
  isCollapsible: boolean;
  isReadOnly: boolean;
  username: string;
  isOwner: boolean;
  profileToDisplay: PublicUserDisplay | User;
  ownerHabits: Habit[];
  identities?: (Identity & { backingCount: number })[];
  targets?: ActionNode[]; // Add targets prop
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
                                               isOwner,
                                               profileToDisplay,
                                               ownerHabits,
                                               identities,
                                               targets,
                                               onBioUpdate,
                                               onActivityLogged,
                                               timezone,
                                               isFolded,
                                               toggleFold
                                             }) => {
  const { resolvedTheme } = useTheme();
  const gradientColor = "var(--primary)";

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
            isOwner={isOwner}
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
            <IdentitySection 
                isOwner={isOwner} 
                isReadOnly={isReadOnly} 
                ownerHabits={ownerHabits} 
                identities={identities}
                onHabitUpdated={onActivityLogged} 
            />
        </MagicCard>
        
        <MagicCard 
            className="p-6" 
            gradientColor={gradientColor}
        >
            <TargetsSection
              isOwner={isOwner}
              isReadOnly={isReadOnly}
              timezone={timezone}
              targets={targets}
              onActivityLogged={onActivityLogged}
            />
        </MagicCard>
      </div>
    </div>
  </CollapsibleSectionWrapper>);
};

export default MeSection;