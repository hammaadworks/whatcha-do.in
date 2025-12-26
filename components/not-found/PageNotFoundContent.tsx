"use client";
import { NotFoundLayout } from '@/components/not-found/NotFoundLayout';

/**
 * Content for the generic "Page Not Found" (404) view.
 */
export function PageNotFoundContent() {
    return (<NotFoundLayout
        title="Page Not Found"
        description="We've lost this page in the data stream."
    />);
}
