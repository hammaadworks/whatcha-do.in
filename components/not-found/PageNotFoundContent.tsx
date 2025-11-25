"use client";

import NotFoundLayout from '@/components/not-found/NotFoundLayout';
import {Layers, LogIn} from 'lucide-react';

interface PageNotFoundContentProps {
    isLoggedIn: boolean;
}

export default function PageNotFoundContent({isLoggedIn}: Readonly<PageNotFoundContentProps>) {
    return (<NotFoundLayout
            title="Page Not Found"
            description="We've lost this page in the data stream."
            isLoggedIn={isLoggedIn}
            secondaryLinkHref={isLoggedIn ? "/dashboard" : "/login"}
            secondaryLinkText={isLoggedIn ? "Dashboard" : "Login"}
            secondaryLinkIcon={isLoggedIn ? Layers : LogIn}
        />);
}