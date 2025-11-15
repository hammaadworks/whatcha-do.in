import React from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton"; // Import LogoutButton

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies(); // This returns a Promise<ReadonlyRequestCookies>

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => { // Mark as async
          const resolvedCookieStore = await cookieStore; // Await here
          return resolvedCookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => { // Mark as async
          const resolvedCookieStore = await cookieStore; // Await here
          resolvedCookieStore.set(name, value, options);
        },
        remove: async (name: string, options: CookieOptions) => { // Mark as async
          const resolvedCookieStore = await cookieStore; // Await here
          resolvedCookieStore.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">whatcha-doin Dashboard</h1>
        <LogoutButton />
      </nav>
      <main className="p-4">
        {children}
      </main>
    </>
  );
}
