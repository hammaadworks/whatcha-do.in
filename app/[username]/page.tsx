import { notFound } from 'next/navigation';
import { getUserByUsernameServer } from '@/lib/supabase/user.server';
import { PublicUserDisplay } from '@/lib/supabase/types'; // Correct import for PublicUserDisplay
import PrivatePage from '@/components/profile/PrivatePage.tsx'; // Import the new client component

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // If Next.js is re-running this page for its notFound() flow,
  // we immediately stop and call notFound() again without hitting the database.
  if (username === 'not-found') {
    notFound();
  }

  const user: PublicUserDisplay | null = await getUserByUsernameServer(username); // Fetch user data on server

  if (!user) {
    // If user does not exist, Next.js will render the not-found page
    // This handles the /xyz expected: user not found scenario.
    notFound();
  }

  // Pass the fetched user data to the Client Component
  return (
    <PrivatePage username={username} initialProfileUser={user} />
  );
}