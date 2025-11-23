'use client';

import { PublicUserDisplay } from '@/lib/supabase/types';

type PublicProfileViewProps = {
  user: PublicUserDisplay;
};

export function PublicProfileView({ user }: PublicProfileViewProps) {
  return (
    <div>
      <h1>Public Profile of {user.username}</h1>
      {/* Placeholder for public profile content */}
    </div>
  );
}