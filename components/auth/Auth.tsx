"use client";

import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth";
import Login from "./Login";

export default function Auth() {
  const { session, setSession } = useAuthStore();

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!session) {
    return <Login />;
  }

  return (
    <div>
      <h1>Welcome back!</h1>
      <button
        onClick={handleLogout}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Logout
      </button>
    </div>
  );
}
