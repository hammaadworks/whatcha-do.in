"use client";

import React from "react";
import BioSection from "@/components/profile/sections/BioSection";
import IdentitySection from "@/components/profile/sections/IdentitySection";
import TargetsSection from "@/components/profile/sections/TargetsSection";
import { Habit, PublicUserDisplay } from "@/lib/supabase/types";
import { User } from "@/hooks/useAuth";
import { CollapsibleSectionWrapper } from "@/components/ui/collapsible-section-wrapper";
import { MagicCard } from "@/components/ui/magic-card"; // Import MagicCard
import { useTheme } from "next-themes"; // Import useTheme

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
  const primaryGradientFrom = `hsl(var(--primary))`;
  const accentGradientTo = `hsl(var(--accent))`;


  return (<CollapsibleSectionWrapper
    title="Me"
    isCollapsible={isCollapsible}
    isFolded={isFolded}
    toggleFold={toggleFold}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bio Section */}
      <div className="lg:col-span-1 h-full">
        <BioSection
          username={username}
          bio={profileToDisplay.bio ?? null}
          isOwner={true}
          isReadOnly={isReadOnly}
          onBioUpdate={onBioUpdate}
        />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <IdentitySection isOwner={true} isReadOnly={isReadOnly} ownerHabits={ownerHabits} onHabitUpdated={onActivityLogged} />
        <TargetsSection
          isOwner={true}
          isReadOnly={isReadOnly}
          timezone={timezone}
          onActivityLogged={onActivityLogged}
        />
      </div>
    </div>
  </CollapsibleSectionWrapper>);
};

export default MeSection;