'use client';

import React, {useState} from 'react';
import {updateUserBio} from '@/lib/supabase/user';
import {supabase} from '@/lib/supabase/client';
import toast from 'react-hot-toast';

function EditBioForm({bio}: { bio: string }) {
    const [newBio, setNewBio] = useState(bio);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {
            data: {user},
        } = await supabase.auth.getUser();

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
        <form onSubmit={handleSubmit} className="p-4">
      <textarea
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          rows={4}
          cols={50}
          className="w-full bg-input border-input text-foreground rounded-md p-2 mb-4"
      />
            <button type="submit" className="bg-primary text-primary-foreground py-2 px-4 rounded-md">Save</button>
        </form>
    );
}

export default EditBioForm