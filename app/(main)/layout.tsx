import React from "react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton"; // Import LogoutButton
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
