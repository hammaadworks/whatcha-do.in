'use client';

import { useState } from 'react';
import { updateUserBio, type UserProfile } from '@/lib/supabase/user';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function EditBioForm({ profile }: { profile: UserProfile | null }) {
  const [bio, setBio] = useState(profile?.bio || '');
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await updateUserBio(user.id, bio);
      if (error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success('Bio updated successfully!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={5}
        cols={40}
      />
      <br />
      <button type="submit">Save Bio</button>
    </form>
  );
}
