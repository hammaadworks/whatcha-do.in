import { redirect } from "next/navigation";
import {  createServer } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase =  createServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
