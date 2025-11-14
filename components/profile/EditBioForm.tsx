'use client';

import React, {useState} from 'react';
import {updateUserBio} from '@/lib/supabase/user';
import {supabaseClient} from '@/lib/supabase/client';
import toast from 'react-hot-toast';

function EditBioForm({bio}: { bio: string }) {
    const [newBio, setNewBio] = useState(bio);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {
            data: {user},
        } = await supabaseClient.auth.getUser();

        if (user) {
            const {error} = await updateUserBio(user.id, newBio);
            if (error) {
                toast.error('Failed to update bio.');
            } else {
                toast.success('Bio updated successfully!');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
      <textarea
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          rows={4}
          cols={50}
      />
            <button type="submit">Save</button>
        </form>
    );
}

export default EditBioForm