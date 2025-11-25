"use client";

import NotFoundLayout from '@/components/not-found/NotFoundLayout';
import {Layers, LogIn} from 'lucide-react';

interface UserNotFoundContentProps {
    isLoggedIn: boolean;
}

export default function UserNotFoundContent({isLoggedIn}: Readonly<UserNotFoundContentProps>) {
    return (<NotFoundLayout
            title="User Not Found"
            description="The user you are looking for does not exist."
            isLoggedIn={isLoggedIn}
            secondaryLinkHref={isLoggedIn ? "/dashboard" : "/login"}
            secondaryLinkText={isLoggedIn ? "Dashboard" : "Login"}
            secondaryLinkIcon={isLoggedIn ? Layers : LogIn}
        />);
}
