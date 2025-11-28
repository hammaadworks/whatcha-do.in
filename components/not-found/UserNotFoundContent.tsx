"use client";
import NotFoundLayout from '@/components/not-found/NotFoundLayout';

export default function PageNotFoundContent() {
    return (<NotFoundLayout
        title="User Not Found"
        description="The user you are looking for does not exist."
    />);
}