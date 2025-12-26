"use client";
import { NotFoundLayout } from '@/components/not-found/NotFoundLayout';

/**
 * Content for the "User Not Found" view.
 * Displayed when a dynamic profile route does not resolve to a valid user.
 */
export function UserNotFoundContent() {
    return (<NotFoundLayout
        title="User Not Found"
        description="The user you are looking for does not exist."
    />);
}