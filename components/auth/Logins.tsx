"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight } from "lucide-react";

const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export default function Logins() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogins = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      setError(error.message);
    } else {
      console.log("Magic link sent successfully:", data);
      setMessage("Please check your email for a magic link.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4"> {/* Added padding for inner content */}
      <div className="text-center mb-6">
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 inline-flex mb-4">
          <ArrowRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Sign in with email
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email below to receive a magic link to sign in or sign up.
        </p>
      </div>

      <form onSubmit={handleLogins} className="space-y-4 w-full">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-10 bg-input border-input text-foreground shadow-inner"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full py-2 px-4 rounded-md text-sm font-medium h-10 shadow-md"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </Button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-success-foreground">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-center text-sm text-destructive-foreground">
          {error}
        </p>
      )}
    </div>
  );
}