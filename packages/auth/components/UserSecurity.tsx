"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/packages/auth/lib/supabase/client";
import { deleteAccount } from "@/packages/auth/actions/auth-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Lock, AlertTriangle, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/packages/auth/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { updateUserProfile, checkUsernameAvailability } from "@/lib/supabase/user.client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import logger from "@/lib/logger/client";

// Schema for username
const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UserSecurity() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // --- Password State ---
  const [password, setPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  // --- Delete Account State ---
  const [loadingDelete, setLoadingDelete] = useState(false);

  // --- Username State ---
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  // Load initial username
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
      });
    }
  }, [user, form]);

  const watchedUsername = form.watch("username");
  const debouncedUsername = useDebounce(watchedUsername, 500);

  // Debounce username check
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || debouncedUsername === user?.username || debouncedUsername.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(debouncedUsername)) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      const log = logger.child({ module: "UserSecurity", username: debouncedUsername });
      
      try {
        const available = await checkUsernameAvailability(debouncedUsername);
        setUsernameAvailable(available);
        if (!available) {
          form.setError("username", {
            type: "manual",
            message: "Username is already taken",
          });
        } else {
          form.clearErrors("username");
        }
      } catch (error) {
        log.error({ err: error }, "Error checking username availability");
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername, user?.username, form]);

  const onUsernameSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    if (usernameAvailable === false && data.username !== user.username) {
      return;
    }

    setIsSavingUsername(true);
    try {
      const { error } = await updateUserProfile(user.id, {
        username: data.username,
      });

      if (error) throw error;

      toast.success("Profile updated successfully");
      await refreshUser();

      if (data.username !== user.username) {
        router.push(`/${data.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoadingPass(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setPassword("");
    }
    setLoadingPass(false);
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      await deleteAccount();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* --- Username Card --- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Identity
          </CardTitle>
          <CardDescription>
            Your unique handle on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUsernameSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <div className="absolute right-3 top-2.5">
                        {isCheckingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          usernameAvailable === true && field.value !== user?.username && (
                            <Check className="h-4 w-4 text-green-500" />
                          )
                        )}
                        {usernameAvailable === false && field.value !== user?.username && (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <FormDescription>
                       Public profile URL: whatcha-do.in/{watchedUsername || 'username'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isSavingUsername || (usernameAvailable === false && watchedUsername !== user?.username) || watchedUsername === user?.username}
              >
                {isSavingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Username
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Password Card --- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password Management
          </CardTitle>
          <CardDescription>
            Set or update your password. If you logged in via Magic Link, you can set a password here to use for future logins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loadingPass || password.length < 6}>
              {loadingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Delete Account Card --- */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All your habits, journals, and themes will be lost forever.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loadingDelete}>
                {loadingDelete ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
