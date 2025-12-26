import {headers} from 'next/headers'; // Import headers
import {PageNotFoundContent} from '@/components/not-found/PageNotFoundContent'; // Client Component
import {UserNotFoundContent} from '@/components/not-found/UserNotFoundContent'; // Client Component

export default async function NotFound() {
    const heads = await headers();
    const reason = heads.get('x-reason');

    if (reason === 'user-not-found') {
        return <UserNotFoundContent/>;
    }

    // Default to PageNotFoundContent if no specific reason or reason is not user-not-found
    return <PageNotFoundContent/>;
}