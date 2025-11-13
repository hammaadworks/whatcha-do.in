import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/user';
import { EditBioForm } from '@/components/profile/EditBioForm';
import { redirect } from 'next/navigation';

export default async function EditProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await getUserProfile(user.id);

  return (
    <div>
      <h1>Edit Profile</h1>
      <EditBioForm profile={profile} />
    </div>
  );
}
