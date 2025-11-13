import { supabase } from './client';

export interface UserProfile {
  id: string;
  email: string;
  bio: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string | null;
}

export const getUserProfile = async (userId: string): Promise<{ data: UserProfile | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
};

export const updateUserBio = async (userId: string, bio: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('users')
    .update({ bio })
    .eq('id', userId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
};
