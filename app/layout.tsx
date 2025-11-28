import React from "react";
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/components/auth/AuthProvider";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { createServerSideClient } from '@/lib/supabase/server';
import logger from '@/lib/logger/server'; // Import the server logger

const geistSans = Geist({
    variable: "--font-geist-sans", subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono", subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://whatcha-doin.hammaadworks.com"),
    title: {
        default: "whatcha-doin | Building Consistency, One Habit at a Time", template: "%s | whatcha-doin",
    },
    description: "whatcha-doin helps you build consistency and achieve your goals by tracking habits, visualizing progress, and connecting with a supportive community. Building consistency one habit at a time.",
    applicationName: "whatcha-doin",
    creator: "hammaadworks",
    publisher: "hammaadworks",
    keywords: ["habit tracker", "habit building", "consistency", "goal setting", "productivity", "personal growth", "wellness", "community",],
    authors: [{name: "hammaadworks", url: "https://github.com/hammaadworks"}],
    openGraph: {
        title: "whatcha-doin | Building Consistency, One Habit at a Time",
        description: "whatcha-doin helps you build consistency and achieve your goals by tracking habits, visualizing progress, and connecting with a supportive community. Building consistency one habit at a time.",
        url: "https://whatcha-doin.hammaadworks.com",
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
        creator: "@hammaadworks",
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

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const log = logger.child({ function: 'RootLayout' });
    log.info('Fetching user session in RootLayout');

    const supabase = await createServerSideClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        log.error({ err: error }, 'Error fetching session in RootLayout');
    }

    let initialUser = null;
    if (session?.user) {
        initialUser = {
            ...session.user,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
        };
        log.info({ userId: initialUser.id, username: initialUser.username }, 'Session found for user');
    } else {
        log.info('No active session found');
    }

    return (<html lang="en">
        <head>
            <meta name="apple-mobile-web-app-title" content="whatcha-doin"/>
            <title>whatcha-doin | Building Consistency, One Habit at a Time</title>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
        <AuthProvider initialUser={initialUser}>
            <AppHeader/>
            <main className="flex-grow flex items-center justify-center px-2 md:px-4 lg:px-8">
                {children}
            </main>
            <AppFooter/>
        </AuthProvider>
        </body>
        </html>);
}

