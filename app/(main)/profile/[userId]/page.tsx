import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/user';
import { notFound } from 'next/navigation';

type Props = {
  params: { userId: string };
};

export default async function PublicProfilePage({ params }: Props) {
  const supabase = createClient();
  const { data: profile } = await getUserProfile(params.userId);

  if (!profile) {
    notFound();
  }

  return (
    <div>
      <h1>Public Profile</h1>
      <p>Email: {profile.email}</p>
      <p>Bio: {profile.bio || 'No bio yet.'}</p>
    </div>
  );
}
