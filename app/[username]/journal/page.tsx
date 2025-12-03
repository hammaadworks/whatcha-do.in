import { notFound } from 'next/navigation';
import { getUserByUsernameServer } from '@/lib/supabase/user.server';
import { createServerSideClient } from '@/lib/supabase/server';
import { JournalPageContent } from '@/components/journal/JournalPageContent';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function JournalPage({ params }: PageProps) {
    const { username } = await params;

    // Fetch the profile user
    const profileUser = await getUserByUsernameServer(username);

    if (!profileUser) {
        notFound();
    }

    // Fetch authenticated user
    const supabase = await createServerSideClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const isOwner = authUser?.id === profileUser.id;

    return (
        <div className="container mx-auto py-6 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{profileUser.username}&apos;s Journal</h1>
                <p className="text-muted-foreground">
                    {isOwner 
                        ? "Record your thoughts, reflect on your day, and track your progress." 
                        : `Viewing ${profileUser.username}'s public journal entries.`}
                </p>
            </div>
            
            <JournalPageContent 
                profileUserId={profileUser.id} 
                isOwner={isOwner} 
            />
        </div>
    );
}
