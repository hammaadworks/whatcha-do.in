import React from "react";
import { redirect } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader"; // Import AppHeader
import {  createServer } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase =  createServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader isAuthenticated={true} /> {/* Use AppHeader and pass isAuthenticated */}
      <main className="p-4">
        {children}
      </main>
    </>
  );
}