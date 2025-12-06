import {createServerSideClient} from './server';

export async function fetchPublicIdentitiesServer(userId: string) {
    const supabase = await createServerSideClient();

    // Fetch public identities
    // We also need to know how many PUBLIC habits back them.
    // This complex join/count might be easier if we just fetch and process, or use a view.
    // For now, let's fetch identities and then maybe separate query or smart select.

    // Supabase select with count on filtering relation?
    // habits(count) where is_public=true?
    // Syntax: habit_identities(count, habits!inner(is_public))? 
    // Complex inner join logic.

    // Simpler approach:
    // Fetch public identities.
    // For each, fetch count of linked habits that are public.

    const {data, error} = await supabase
        .from('identities')
        .select(`
            *,
            habit_identities!inner (
                habits!inner (
                    is_public
                )
            )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .eq('habit_identities.habits.is_public', true)
        .order('created_at', {ascending: false});

    // The above query performs an INNER JOIN, so it ONLY returns identities that HAVE public habits.
    // But we want ALL public identities, even if they have 0 habits (or 0 public habits).
    // So !inner is wrong for identities->habit_identities.

    // Let's try standard select and client-side count (server-side processing).
    // Or just separate queries.

    const {data: identities, error: idError} = await supabase
        .from('identities')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', {ascending: false});

    if (idError) {
        console.error('Error fetching public identities:', idError);
        return [];
    }

    if (!identities || identities.length === 0) return [];

    // Now fetch counts. 
    // We need counts of public habits for these identities.
    const identityIds = identities.map(i => i.id);

    const {data: links, error: linkError} = await supabase
        .from('habit_identities')
        .select(`
            identity_id,
            habits!inner (
                is_public
            )
        `)
        .in('identity_id', identityIds)
        .eq('habits.is_public', true);

    if (linkError) {
        console.error('Error fetching identity links:', linkError);
        return identities.map(i => ({...i, backingCount: 0}));
    }

    // Count map
    const counts: Record<string, number> = {};
    links?.forEach((link: any) => {
        const id = link.identity_id;
        counts[id] = (counts[id] || 0) + 1;
    });

    return identities.map(identity => ({
        ...identity, backingCount: counts[identity.id] || 0
    }));
}
