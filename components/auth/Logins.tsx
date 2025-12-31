"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Mail, MailOpen } from "lucide-react";
import { DEFAULT_POST_LOGIN_REDIRECT } from "@/lib/constants";
import { Button } from "@/components/ui/button"; // Import the Button component
import { MagicCard } from "@/components/ui/magic-card";
import { PrimaryCtaButton } from "@/components/ui/primary-cta-button"; // Added PrimaryCtaButton import
import { BlurFade } from "@/components/ui/blur-fade";

const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

const openMailClient = (client: "gmail" | "outlook" | "yahoo" | "generic", userEmail: string) => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  let url = "";

  switch (client) {
    case "gmail":
      if (isIOS) url = "googlegmail://";
      else if (isAndroid) url = "intent://#Intent;package=com.google.android.gm;scheme=googlegmail;end;";
      else url = `mail.google.com{userEmail || ''}`;
      break;
    case "outlook":
      url = isIOS ? "ms-outlook://" : "outlook.live.com";
      break;
    case "yahoo":
      url = isIOS ? "ymail://" : "mail.yahoo.com";
      break;
    default:
      window.location.href = "mailto:";
      return;
  }

  // Direct redirection for apps; browsers handle the rest
  if (url) {
    window.location.href = url;

    // Simple fallback for web after a delay if it's a mobile device
    if (isIOS || isAndroid) {
      setTimeout(() => {
        const webFallback = client === "gmail" ? "https://mail.google.com" : "https://mail.yahoo.com";
        window.open(webFallback, "_blank");
      }, 2000);
    }
  }
};

export default function Logins() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientTimezone, setClientTimezone] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Detect client's timezone when the component mounts
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setClientTimezone(timezone);
    } catch (e) {
      console.error("Could not detect client timezone:", e);
      setClientTimezone("UTC"); // Fallback to UTC
    }

    if (searchParams.get("loginError") === "true") {
      setError("Login failed. Please check your magic link or try again.");
    }
  }, [searchParams, setError]);

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

    const emailRedirectTo = `${window.location.origin}/auth/callback?timezone=${encodeURIComponent(clientTimezone || "UTC")}&next=${encodeURIComponent(DEFAULT_POST_LOGIN_REDIRECT)}`;
    console.log("Sending magic link with redirect URL:", emailRedirectTo);

    const { data, error } = await supabase.auth.signInWithOtp({
      email, options: {
        emailRedirectTo
      }
    });

    if (error) {
      console.error("Error sending magic link:", error);
      if (error.message.includes("For security purposes, you can only request this after")) {
        setError("You are trying to log in too frequently. Please wait a moment before trying again.");
      } else {
        setError(error.message);
      }
    } else {
      console.log("Magic link sent successfully:", data);
      setIsSuccess(true);
    }
    setLoading(false);
  };

  return (<div className="flex w-full flex-col items-center p-2 pb-0">
    <BlurFade delay={0.25} inView>
      <MagicCard
        className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl"
        gradientColor="#88888822"
      >
        <div className="flex flex-col px-6 py-4 md:p-6 overflow-y-auto max-h-full">
          <div className="text-center mb-8">
            <div
              className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {isSuccess ? (<CheckCircle2 className="h-6 w-6 text-primary" />) : (
                <Mail className="h-6 w-6 text-primary" />)}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isSuccess ? "Check Your Inbox" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSuccess ? (<>
                We&apos;ve sent a secure magic link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </>) : ("Your journey to disciplined consistency starts here!")}
            </p>
          </div>

          {!isSuccess ? (<form onSubmit={handleLogins} className="space-y-4" suppressHydrationWarning={true}>
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <div
                  className="absolute left-9 top-1/2 -translate-y-1/2 h-5 w-px bg-gray-300 dark:bg-gray-700" />
                {/* Delimiter */}
                <Input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-11 bg-background/50 border-input focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
              </div>
            </div>

            <PrimaryCtaButton
              type="submit"
              disabled={loading}
              className="w-full h-12" // Simplified className as PrimaryCtaButton sets text-base font-medium
            >
              {loading ? (<span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>) : ("Continue with Magic Link")}
            </PrimaryCtaButton>
          </form>) : (<div
            className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground max-w-[250px] mx-auto">
                Click the login link in mail to continue building your identity.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <PrimaryCtaButton
                onClick={() => openMailClient("gmail", email)}
                className="w-full h-12" // Simplified className
              >
                <MailOpen className="h-5 w-5 mr-2" /> Open Gmail
              </PrimaryCtaButton>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => openMailClient("outlook", email)}
                  className="flex-1 h-10 text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" /> Outlook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openMailClient("yahoo", email)}
                  className="flex-1 h-10 text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" /> Yahoo Mail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openMailClient("generic", email)}
                  className="flex-1 h-10 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Other
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setIsSuccess(false)}
              variant="link"
              className="mt-6 w-full h-10 text-sm"
            >
              Try a different email
            </Button>
          </div>)}

          {error && (<div
            className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>)}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              By clicking continue, you agree to our{" "}
              <a href="/legal/terms.html" className="underline hover:text-primary">Terms of
                Service</a> and{" "}
              <a href="/legal/privacy.html" className="underline hover:text-primary">Privacy
                Policy</a>
              .
            </p>
          </div>
        </div>
      </MagicCard>
    </BlurFade>
  </div>);
}