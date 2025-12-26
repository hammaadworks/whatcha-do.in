"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AuthCodeErrorPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5); // Initial countdown from 5 seconds

  useEffect(() => {
    // Extract error message from URL fragment
    if (typeof window !== "undefined") {
      const fragment = window.location.hash;
      const params = new URLSearchParams(fragment.substring(1)); // Remove '#'
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        const decodedError = decodeURIComponent(errorDescription);
        console.log("Error Description:", decodedError);
        setErrorMessage(decodedError);
        toast.error(decodedError); // Still show a sonner toast for consistency
      } else {
        console.log("Error Description: Unknown authentication error");
        const unknownError = "An unknown authentication error occurred.";
        setErrorMessage(unknownError);
        toast.error(unknownError);
      }
    }

    // Start countdown timer
    const redirectTimer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // Clear interval and redirect after 5 seconds
    const finalRedirectTimer = setTimeout(() => {
      clearInterval(redirectTimer);
      router.replace("/logins");
    }, 5000); // Redirect after 5 seconds

    // Cleanup timers on component unmount
    return () => {
      clearInterval(redirectTimer);
      clearTimeout(finalRedirectTimer);
    };
  }, [router]); // Depend on router

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
      {errorMessage ? (
        <p className="text-lg text-secondary-foreground text-center">{errorMessage}</p>
      ) : (
        <p className="text-lg text-secondary-foreground text-center">Loading error details...</p>
      )}
      <p className="mt-8 text-sm text-muted-foreground">
        Redirecting to <span className="text-primary font-medium">login page</span> in {countdown} second{countdown !== 1 ? "s" : ""}...
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        If you are not redirected automatically, please click{" "}
        <a href="/logins" className="text-primary hover:underline">here</a>.
      </p>
    </div>
  );
}
