'use client';

import { PublicUserDisplay } from '@/lib/supabase/types';
import ProfileLayout from '@/components/profile/ProfileLayout';
import ActionsSection from '@/components/profile/sections/ActionsSection';
import HabitsSection from '@/components/profile/sections/HabitsSection';
import JournalSection from '@/components/profile/sections/JournalSection';
import MotivationsSection from '@/components/profile/sections/MotivationsSection';

type PublicProfileViewProps = {
  user: PublicUserDisplay;
};

export function PublicPage({ user }: Readonly<PublicProfileViewProps>) {
  return (
    <ProfileLayout
      username={user.username || ''}
      bio={user.bio ?? null}
      isOwner={false}
    >
      <ActionsSection isOwner={false} />
      <HabitsSection isOwner={false} />
      <JournalSection isOwner={false} />
      <MotivationsSection username={user.username || ''} />
    </ProfileLayout>
  );
}
