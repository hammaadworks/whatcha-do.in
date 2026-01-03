"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Mail, MailOpen, QrCode, Lock, KeyRound, LogOut } from "lucide-react";
import { DEFAULT_POST_LOGIN_REDIRECT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { PrimaryCtaButton } from "@/components/ui/primary-cta-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { DeviceScanner } from "@/components/auth/DeviceScanner";
import { DeviceConnect } from "@/components/auth/DeviceConnect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

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
      else url = "https://mail.google.com";
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
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }

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
  const { user } = useAuth(); // Access global auth state
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientTimezone, setClientTimezone] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"email" | "password" | "qr">("email");

  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setClientTimezone(timezone);
    } catch (e) {
      console.error("Could not detect client timezone:", e);
      setClientTimezone("UTC");
    }

    if (searchParams.get("loginError") === "true") {
      setError("Login failed. Please check your magic link or try again.");
    }
  }, [searchParams]);

  // If user is already logged in, show the Connect Device (QR) screen only
  if (user) {
    return (
      <div className="flex w-full flex-col items-center p-2 pb-0">
        <BlurFade delay={0.25} inView>
          <MagicCard
            className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl"
            gradientColor="#88888822"
          >
            <div className="flex flex-col px-6 py-4 md:p-6">
              <div className="text-center mb-6">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Connect Devices
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Scan this code to log in on another device.
                </p>
              </div>
              {/* Pass a prop or style to DeviceConnect if needed to blend in. 
                  Currently rendering it directly. */}
              <DeviceConnect />
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    // State update via useAuth will trigger re-render to unauthenticated view
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    );
  }

  // --- Unauthenticated View ---

  const handleMagicLinkLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const emailRedirectTo = `${window.location.origin}/auth/callback?timezone=${encodeURIComponent(clientTimezone || "UTC")}&next=${encodeURIComponent(DEFAULT_POST_LOGIN_REDIRECT)}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo }
    });

    if (error) {
      if (error.message.includes("For security purposes")) {
        setError("Please wait a moment before trying again.");
      } else {
        setError(error.message);
      }
    } else {
      setIsSuccess(true);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Successful login will trigger useAuth state change automatically
      // We can also redirect manually if needed, but the AuthWrapper usually handles it.
      // For now, we'll let the state update handle the UI switch.
      // Or we can refresh the page to be safe.
      window.location.href = DEFAULT_POST_LOGIN_REDIRECT;
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
          <div className="flex flex-col px-6 py-4 md:p-6 overflow-y-auto max-h-full">
            <div className="text-center mb-6">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {isSuccess ? (<CheckCircle2 className="h-6 w-6 text-primary" />) : (
                  loginMethod === 'qr' ? <QrCode className="h-6 w-6 text-primary" /> : <Mail className="h-6 w-6 text-primary" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {isSuccess ? "Check Your Inbox" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSuccess ? (
                  <>
                    We&apos;ve sent a secure magic link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </>
                ) : ("Your journey to disciplined consistency starts here!")}
              </p>
            </div>

            {!isSuccess && (
              <div className="mb-6">
                <Tabs value={loginMethod} className="w-full" onValueChange={(v) => setLoginMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="email">Magic Link</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="qr">Scan QR</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email">
                    <form onSubmit={handleMagicLinkLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-magic" className="sr-only">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            id="email-magic"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <PrimaryCtaButton type="submit" disabled={loading} className="w-full h-12">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Magic Link"}
                      </PrimaryCtaButton>
                    </form>
                  </TabsContent>

                  <TabsContent value="password">
                    <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-pass" className="sr-only">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            id="email-pass"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 h-11"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <PrimaryCtaButton type="submit" disabled={loading} className="w-full h-12">
                         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
                      </PrimaryCtaButton>
                      <div className="text-center">
                         <Button variant="link" size="sm" onClick={() => setLoginMethod('email')}>
                            Forgot Password? Use Magic Link
                         </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="qr" className="mt-4">
                    <DeviceScanner />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
                <PrimaryCtaButton onClick={() => openMailClient("gmail", email)} className="w-full h-12">
                  <MailOpen className="h-5 w-5 mr-2" /> Open Gmail
                </PrimaryCtaButton>
                <Button onClick={() => setIsSuccess(false)} variant="link" className="mt-6 w-full h-10 text-sm">
                  Try a different email
                </Button>
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
                <a href="/legal/privacy.html" className="underline hover:text-primary">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </MagicCard>
      </BlurFade>
    </div>
  );
}
