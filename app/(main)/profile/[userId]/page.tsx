"use client"

import { getPublicProfileData } from '@/lib/supabase/user';
import PublicProfileView from '@/components/profile/PublicProfileView';
import * as React from "react";

type Props = {
  params: {
    userId: string;
  };
};

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  const { data: profile, error } = await getPublicProfileData(userId);

  if (error || !profile) {
    return <div>Error loading profile.</div>;
  }

  return <PublicProfileView profile={profile} />;
}
