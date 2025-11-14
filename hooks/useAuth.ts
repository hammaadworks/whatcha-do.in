"use client";

import {useEffect} from "react";
import {supabaseClient} from "@/lib/supabase/client";
import {create} from "zustand";

interface AuthState {
    user: any | null;
    session: any | null;
    loading: boolean;
    setSession: (session: any | null) => void;
    setUser: (user: any | null) => void;
    setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,
    setSession: (session) => set({session, user: session?.user || null}),
    setUser: (user) => set({user}),
    setLoading: (loading) => set({loading}),
}));

export const useAuth = () => {
    const {user, session, loading, setSession, setLoading} = useAuthStore();

    useEffect(() => {
        const getSession = async () => {
            const {
                data: {session},
            } = await supabaseClient.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession().then(_ => {});

        const {data: authListener} = supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [setSession, setLoading]);

    return {user, session, loading};
};
