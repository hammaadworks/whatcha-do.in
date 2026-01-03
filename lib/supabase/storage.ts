import { createClient } from './client';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
    path: string; // The stored path or public URL
    displayUrl: string; // A URL usable immediately (e.g. signed or public)
    isPublic: boolean;
}

export async function uploadJournalMedia(file: File, userId: string, isPublic: boolean): Promise<UploadResult> {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 5MB limit.');
    }

    const supabase = createClient();
    const bucket = isPublic ? 'journal_public' : 'journal_private';
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    // Path structure: {userId}/{filename}
    // Note: No need for 'public'/'private' folder since buckets separate them.
    const path = `${userId}/${filename}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Upload error:", error);
        throw error;
    }

    if (isPublic) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return {
            path: data.publicUrl, // For public, the path IS the URL
            displayUrl: data.publicUrl,
            isPublic: true
        };
    } else {
        // For private, we store a protocol-like path: storage://journal_private/{path}
        const storagePath = `storage://${bucket}/${path}`;
        
        // Generate a temporary signed URL for immediate display
        const { data: signedData, error: signedError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60 * 60); // 1 hour

        if (signedError) throw signedError;

        return {
            path: storagePath,
            displayUrl: signedData.signedUrl,
            isPublic: false
        };
    }
}

export async function getSignedUrlForPath(storagePath: string): Promise<string | null> {
    if (!storagePath.startsWith('storage://')) return null;

    const parts = storagePath.replace('storage://', '').split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');

    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) {
        console.error("Error creating signed URL:", error);
        return null;
    }
    return data.signedUrl;
}
