import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export const createServer = async () => {
    const cookieStore = await cookies();

    // Replit Secrets may have the values swapped, so we validate and swap if needed
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Check if they're swapped (URL should start with https://, key with eyJ)
    if (supabaseUrl.startsWith('eyJ') && supabaseAnonKey.startsWith('https://')) {
        console.log('⚠️  Swapping URL and KEY (they were reversed)');
        [supabaseUrl, supabaseAnonKey] = [supabaseAnonKey, supabaseUrl];
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                async getAll() {
                    return cookieStore.getAll();
                },
                async setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({name, value, options}) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};
