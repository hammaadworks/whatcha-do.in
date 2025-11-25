'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useAuth} from '@/hooks/useAuth';
import {Button} from '@/components/ui/button';
import {AnimatedThemeToggler} from '@/components/ui/animated-theme-toggler';
import UserMenuPopover from '@/components/auth/UserMenuPopover';
import {LogIn} from "lucide-react";

const AppHeader = () => {
    const {user, loading} = useAuth();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true, attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    if (loading) {
        return null; // Or a loading spinner
    }

    const logoSrc = isDark ? '/favicons/dark/logo-bg.png' : '/favicons/light/logo-bg.png';

    return (<header
            className="flex items-center justify-between p-4 bg-card border-b border-card-border text-card-foreground">
            <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2">
                    <img src={logoSrc} alt="Whatcha Doin' Logo" className="h-8 w-auto"/>
                    <span className="text-gray-400">|</span>
                    <span className="text-xl font-bold">whatcha-doin</span>
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <AnimatedThemeToggler/>
                {user ? (<UserMenuPopover user={user}/>) : (<Button>
                        <Link href="/logins">
                            <LogIn className="mr-2 h-4 w-4"/>
                            Login
                        </Link>
                    </Button>)}
            </div>
        </header>);
};

export default AppHeader;