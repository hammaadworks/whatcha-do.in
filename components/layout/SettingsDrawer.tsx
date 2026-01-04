"use client";

import React, {useState} from 'react';
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {TimezoneSelector} from '@/components/profile/TimezoneSelector';
import {useAuth} from '@/packages/auth/hooks/useAuth';
import {updateUserTimezone} from '@/lib/supabase/user.client';
import {toast} from 'sonner'; // Switch to sonner for consistency
import {TimeTravelSection} from "@/components/layout/TimeTravel";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { UserSecurity } from "@/packages/auth/components/UserSecurity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Globe } from "lucide-react";

interface SettingsDrawerProps {
    children: React.ReactNode;
    isOpen: boolean; // Add isOpen prop
    onOpenChange: (open: boolean) => void; // Add onOpenChange prop
}

export function SettingsDrawer({children, isOpen, onOpenChange}: Readonly<SettingsDrawerProps>) {
    const {user, refreshUser} = useAuth();
    const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);
    const handleTimezoneChange = async (newTimezone: string) => {
        if (!user?.id) {
            toast.error("User not authenticated.");
            return;
        }
        if (newTimezone === user.timezone) {
            return;
        }

        setIsUpdatingTimezone(true);
        try {
            await updateUserTimezone(user.id, newTimezone);
            toast.success("Timezone updated successfully!");
            await refreshUser();
        } catch (error) {
            console.error("Failed to update timezone:", error);
            toast.error("Failed to update timezone.");
        } finally {
            setIsUpdatingTimezone(false);
        }
    };

    return (<Sheet open={isOpen} onOpenChange={onOpenChange}>
        {children && <SheetTrigger asChild>{children}</SheetTrigger>}
        <SheetContent side="right" className="w-full max-w-[100vw] sm:w-[540px] overflow-y-auto pointer-events-auto bg-background/80 backdrop-blur-xl border-l shadow-2xl">
            <SheetHeader className="pb-4">
                <SheetTitle className="text-2xl">Settings</SheetTitle>
                <SheetDescription>
                    Manage your profile and application preferences.
                </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-8">
                {/* Preferences Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-medium px-1">Preferences</h3>
                    
                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Appearance
                                </CardTitle>
                                <CardDescription>
                                    Customize the look and feel of your workspace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Current Theme</span>
                                    <ThemeSelector />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Timezone
                                </CardTitle>
                                <CardDescription>
                                    Your timezone determines when your "Day" starts and ends.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <TimezoneSelector
                                    currentTimezone={user?.timezone || 'UTC'}
                                    onTimezoneChange={handleTimezoneChange}
                                />
                                {isUpdatingTimezone && (<p className="text-xs text-muted-foreground">Updating timezone...</p>)}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Account Settings Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-medium px-1">Account Settings</h3>
                    <UserSecurity />
                </section>

                {process.env.NEXT_PUBLIC_DEV_USER === user?.username && (<TimeTravelSection/>)}
            </div>
        </SheetContent>
    </Sheet>);
}
