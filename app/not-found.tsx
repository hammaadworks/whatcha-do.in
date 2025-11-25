import { headers } from 'next/headers'; // Import headers
import PageNotFoundContent from '@/components/not-found/PageNotFoundContent'; // Client Component
import UserNotFoundContent from '@/components/not-found/UserNotFoundContent'; // Client Component
import { createServerSideClient } from '@/lib/supabase/server'; // Import the server-side Supabase client

export default async function NotFound() {
  const heads = await headers();
  const reason = heads.get('x-reason');

  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user; // Check if user object exists

  if (reason === 'user-not-found') {
    return <UserNotFoundContent isLoggedIn={isLoggedIn} />;
  }

  // Default to PageNotFoundContent if no specific reason or reason is not user-not-found
  return <PageNotFoundContent isLoggedIn={isLoggedIn} />;
}