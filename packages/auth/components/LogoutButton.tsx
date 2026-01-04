"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/packages/auth/lib/supabase/client";
import { LogOut } from 'lucide-react'; // Import LogOut icon

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/"); // Redirect to logins page after logout
    } else {
      console.error("Error logging out:", error.message);
      // Optionally, display an error message to the user
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center px-4 py-2 text-sm text-primary hover:bg-accent hover:text-accent-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </button>
  );
}
