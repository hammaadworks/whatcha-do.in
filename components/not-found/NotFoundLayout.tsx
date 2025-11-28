"use client";

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Home, Layers, LogIn} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth'; // Import useAuth hook

const MID_CHARSET = ['0', 'x', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', 'X', '?', '/', '|', '{', '}', '[', ']', '<', '>', '~', '`', '+', '-', '=', ';', ':', ',', '.', '<', '>'];

interface NotFoundLayoutProps {
    title: string;
    description: string;
    homeLinkText?: string;
    secondaryLinkText?: string;
    secondaryLinkHref?: string;
    secondaryLinkIcon?: React.ElementType; // Lucide icon component
}

const NotFoundLayout: React.FC<NotFoundLayoutProps> = ({
                                                           title,
                                                           description,
                                                           homeLinkText = "Home",
                                                           secondaryLinkText,
                                                           secondaryLinkHref,
                                                           secondaryLinkIcon: SecondaryLinkIconProp,
                                                       }) => {
    const [animatedChar, setAnimatedChar] = useState('0');
    const {user, loading} = useAuth();
    const isLoggedIn = !!user && !loading; // Determine isLoggedIn from useAuth

    // Default values now depend on isLoggedIn
    const resolvedSecondaryLinkText = secondaryLinkText ?? (isLoggedIn ? "Dashboard" : "Login");
    const resolvedSecondaryLinkHref = secondaryLinkHref ?? (isLoggedIn && user?.username ? `/${user.username}` : "/login");
    const ResolvedSecondaryLinkIcon = SecondaryLinkIconProp ?? (isLoggedIn ? Layers : LogIn);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * MID_CHARSET.length);
            setAnimatedChar(MID_CHARSET[randomIndex]);
        }, 2000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (<div className="relative bg-background px-4 py-2 font-mono">
        <div className="flex w-full max-w-md flex-col items-center">
            <div className="mb-2 flex items-baseline font-mono">
                <span className="font-bold text-8xl text-primary md:text-9xl">4</span>
                <div className="relative mx-2">
                    <span className="cycling-digit animate-pulse font-bold text-8xl text-primary md:text-9xl">
                        {animatedChar}
                    </span>
                    <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-xl"></div>
                </div>
                <span className="font-bold text-8xl text-primary md:text-9xl">4</span>
            </div>
            <div className="mb-2 h-px w-16 bg-border"></div>
            <h1 className="mb-1 text-center text-2xl font-bold md:text-3xl">{title}</h1>
            <p className="mb-2 text-center text-muted-foreground">{description}</p>
            <div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
                <Button asChild className="flex-1">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4"/>
                        {homeLinkText}
                    </Link>
                </Button>
                <Button asChild className="flex-1">
                    <Link href={resolvedSecondaryLinkHref}>
                        {ResolvedSecondaryLinkIcon && <ResolvedSecondaryLinkIcon className="mr-2 h-4 w-4"/>}
                        {resolvedSecondaryLinkText}
                    </Link>
                </Button>
            </div>
        </div>
    </div>);
};

export default NotFoundLayout;
