"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/"); // Redirect to login page after logout
    } else {
      console.error("Error logging out:", error.message);
      // Optionally, display an error message to the user
    }
  };

  return (
    <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-gray-700">
      Logout
    </Button>
  );
}
