"use client";

import React from 'react';
import BioSection from '@/components/profile/sections/BioSection';
import IdentitySection from '@/components/profile/sections/IdentitySection';
import TargetsSection from '@/components/profile/sections/TargetsSection';
import {Habit, PublicUserDisplay} from '@/lib/supabase/types';
import {User} from '@/hooks/useAuth';
import { CollapsibleSectionWrapper } from '@/components/ui/collapsible-section-wrapper';

interface CoreIdentitySectionProps {
    isCollapsible: boolean;
    isReadOnly: boolean;
    username: string;
    profileToDisplay: PublicUserDisplay | User;
    ownerHabits: Habit[];
    onBioUpdate: (newBio: string) => Promise<void>;
    onActivityLogged: () => Promise<void>;
    timezone: string;
    isFolded: boolean; // New prop
    toggleFold: () => void; // New prop
}

const CoreIdentitySection: React.FC<CoreIdentitySectionProps> = ({
                                                                                   isCollapsible,
                                                                                   isReadOnly,
                                                                                   username,
                                                                                   profileToDisplay,
                                                                                   ownerHabits,
                                                                                   onBioUpdate,
                                                                                   onActivityLogged,
                                                                                   timezone,
                                                                                   isFolded, // Destructure new prop
                                                                                   toggleFold, // Destructure new prop
                                                                               }) => {
    return (
        <CollapsibleSectionWrapper 
            title="Me" 
            isCollapsible={isCollapsible}
            isFolded={isFolded} // Pass new prop
            toggleFold={toggleFold} // Pass new prop
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <IdentitySection isOwner={true} isReadOnly={isReadOnly} ownerHabits={ownerHabits}/>
                    <TargetsSection
                        isOwner={true}
                        isReadOnly={isReadOnly}
                        timezone={timezone}
                        onActivityLogged={onActivityLogged}
                    />
                </div>
            </div>
        </CollapsibleSectionWrapper>
    );
};

export default CoreIdentitySection;
