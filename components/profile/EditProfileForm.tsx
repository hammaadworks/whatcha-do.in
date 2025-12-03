'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile, checkUsernameAvailability } from '@/lib/supabase/user.client';

// Schema
const profileSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    bio: z.string()
        .max(160, "Bio must be less than 160 characters")
        .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileForm() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: '',
            bio: '',
        },
        mode: 'onChange',
    });

    // Load initial values
    useEffect(() => {
        if (user) {
            form.reset({
                username: user.username || '',
                bio: user.bio || '',
            });
        }
    }, [user, form]);

    const watchedUsername = form.watch('username');
    
    // Debounce username check
    useEffect(() => {
        const checkAvailability = async () => {
            if (!watchedUsername || watchedUsername === user?.username || watchedUsername.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            // Don't check if regex fails (handled by zod)
             if (!/^[a-zA-Z0-9_-]+$/.test(watchedUsername)) {
                setUsernameAvailable(null);
                return;
             }

            setIsCheckingUsername(true);
            try {
                const available = await checkUsernameAvailability(watchedUsername);
                setUsernameAvailable(available);
                if (!available) {
                    form.setError('username', {
                        type: 'manual',
                        message: 'Username is already taken',
                    });
                } else {
                    form.clearErrors('username');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [watchedUsername, user?.username, form]);


    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        
        if (usernameAvailable === false && data.username !== user.username) {
            return; // Don't submit if taken
        }

        setIsSaving(true);
        try {
            const { error } = await updateUserProfile(user.id, {
                username: data.username,
                bio: data.bio || '',
            });

            if (error) {
                throw error;
            }

            toast.success('Profile updated successfully');
            
            // Refresh auth context to get new username
            await refreshUser();
            
            // If username changed, redirect to new profile URL
            if (data.username !== user.username) {
                router.push(`/${data.username}`);
            }
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        )
                                    }
                                </div>
                            </div>
                            <FormDescription>
                                Your public profile URL: whatcha-doin.com/{field.value || 'username'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Tell us a little about yourself" 
                                    className="resize-none"
                                    {...field} 
                                />
                            </FormControl>
                            <FormDescription>
                                {field.value?.length || 0}/160 characters
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSaving || (usernameAvailable === false && watchedUsername !== user?.username)}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
