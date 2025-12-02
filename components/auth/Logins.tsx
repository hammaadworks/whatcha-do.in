"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { DEFAULT_POST_LOGIN_REDIRECT } from "@/lib/constants";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export default function Logins() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogins = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address to proceed.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${DEFAULT_POST_LOGIN_REDIRECT}`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      setError(error.message);
    } else {
      console.log("Magic link sent successfully:", data);
      setIsSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex w-full flex-col items-center p-2 pb-0">
      <BlurFade delay={0.25} inView>
        <MagicCard
          className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl"
          gradientColor="#88888822"
        >
          <div className="flex flex-col p-4 md:p-6">
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {isSuccess ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Mail className="h-6 w-6 text-primary" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {isSuccess ? "Check Your Inbox" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSuccess
                  ? "We've sent a secure magic link to your email."
                  : "Your journey to consistency starts here. Enter your email to begin."}
              </p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleLogins} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <div className="absolute left-9 top-1/2 -translate-y-1/2 h-5 w-px bg-gray-300 dark:bg-gray-700" /> {/* Delimiter */}
                    <Input
                      type="email"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-11 bg-background/50 border-input focus:ring-2 focus:ring-primary/50 transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-medium" // Removed explicit text-white
                  background="var(--primary)"
                  shimmerColor="rgba(255, 255, 0.4)"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Continue with Magic Link"
                  )}
                </ShimmerButton>
              </form>
            ) : (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Check Your Inbox</h3>
                  <p className="text-muted-foreground max-w-[250px] mx-auto">
                    We&apos;ve sent a secure magic link to <span className="font-medium text-foreground">{email}</span>. Click the link in your email to instantly access your dashboard and continue building your identity.
                  </p>
                </div>
                <ShimmerButton
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 w-full h-10 text-sm"
                  background="hsl(var(--secondary))"
                  shimmerColor="rgba(255, 255, 255, 0.2)"
                  style={{ color: "hsl(var(--secondary-foreground))" }}
                >
                  Try a different email
                </ShimmerButton>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>
                    By clicking continue, you agree to our{" "}
                        <a href="/legal/terms.html" className="underline hover:text-primary">Terms of Service</a> and{" "}
                        <a href="/legal/privacy.html" className="underline hover:text-primary">Privacy Policy</a>
                    .
                </p>
            </div>
          </div>
        </MagicCard>
      </BlurFade>
    </div>
  );
}