import React from "react";
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/components/auth/AuthProvider";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { createServerSideClient } from '@/lib/supabase/server';
import logger from '@/lib/logger/server'; // Import the server logger
import { Pointer } from "@/components/ui/pointer";
import { Toaster } from "sonner";
import {
    DOMAIN_URL,
    AUTHOR_NAME,
    WEBSITE_URL,
    AUTHOR_TWITTER_HANDLE
} from "@/lib/constants";

const geistSans = Geist({
    variable: "--font-geist-sans", subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono", subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(DOMAIN_URL),
    title: {
        default: "whatcha-doin | Building Consistency, One Habit at a Time", template: "%s | whatcha-doin",
    },
    description: "whatcha-doin helps you build consistency and achieve your goals by tracking habits, visualizing progress, and connecting with a supportive community. Building consistency one habit at a time.",
    applicationName: "whatcha-doin",
    creator: AUTHOR_NAME,
    publisher: AUTHOR_NAME,
    keywords: ["habit tracker", "habit building", "consistency", "goal setting", "productivity", "personal growth", "wellness", "community",],
    authors: [{name: AUTHOR_NAME, url: WEBSITE_URL}],
    openGraph: {
        title: "whatcha-doin | Building Consistency, One Habit at a Time",
        description: "whatcha-doin helps you build consistency and achieve your goals by tracking habits, visualizing progress, and connecting with a supportive community. Building consistency one habit at a time.",
        url: DOMAIN_URL,
        siteName: "whatcha-doin",
        images: [{
            url: "/favicons/light/logo-full.png", // Primary logo for OpenGraph
            width: 1200, height: 630, alt: "whatcha-doin logo (light)",
        }, {
            url: "/favicons/dark/logo-full.png", // Alternative logo for OpenGraph
            width: 1200, height: 630, alt: "whatcha-doin logo (dark)",
        },],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "whatcha-doin | Building Consistency, One Habit at a Time",
        description: "whatcha-doin helps you build consistency and achieve your goals by tracking habits, visualizing progress, and connecting with a supportive community. Building consistency one habit at a time.",
        creator: AUTHOR_TWITTER_HANDLE,
        images: ["/favicons/light/logo-full.png", // Primary logo for Twitter
            "/favicons/dark/logo-full.png", // Alternative logo for Twitter
        ],
    },
    icons: {
        icon: [{url: "/favicons/favicon.ico"}, {
            url: "/favicons/light/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png"
        }, {
            url: "/favicons/light/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png"
        }, {
            url: "/favicons/dark/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png"
        }, {url: "/favicons/dark/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png"},],
        apple: "/favicons/apple-icon.png", // Path to your apple-touch-icon.png in public folder
    },
    manifest: "/manifest.json",
};

import { ThemeProvider } from "next-themes";
import { KeyboardShortcutsProvider } from '@/components/shared/KeyboardShortcutsProvider';
import { LayoutContent } from '@/components/layout/LayoutContent'; // New import for the client component

// ... other imports ...

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    // ... existing async function content ...

    const supabase = await createServerSideClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    logger.info(`RootLayout server-side user check: userId - ${user?.id}`);

    return (<html lang="en" suppressHydrationWarning>
        <head>
            <meta name="apple-mobile-web-app-title" content="whatcha-doin"/>
            <title>whatcha-doin | Building Consistency, One Habit at a Time</title>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
        <Pointer className="fill-primary" />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                <KeyboardShortcutsProvider>
                    <LayoutContent>{children}</LayoutContent>
                </KeyboardShortcutsProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>);
}
