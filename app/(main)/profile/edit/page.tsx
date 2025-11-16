import {  createServer } from '@/lib/supabase/server';
import EditBioForm from '@/components/profile/EditBioForm';
import { redirect } from 'next/navigation';

export default async function ProfileEditPage() {
  const supabase =  createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('bio')
    .eq('id', user.id)
    .single();

  return <EditBioForm bio={profile?.bio ?? ''} />;
}