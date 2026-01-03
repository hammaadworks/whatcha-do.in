
import { uploadJournalMedia, getSignedUrlForPath } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('Journal Media Upload', () => {
    const mockUpload = jest.fn();
    const mockGetPublicUrl = jest.fn();
    const mockCreateSignedUrl = jest.fn();
    
    const mockSupabase = {
        storage: {
            from: jest.fn(() => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
                createSignedUrl: mockCreateSignedUrl
            }))
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        
        // Default successful responses
        mockUpload.mockResolvedValue({ data: { path: 'some-path' }, error: null });
        mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://supa.com/public/url' } });
        mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://supa.com/signed/url' }, error: null });
    });

    it('throws error if file is larger than 5MB', async () => {
        const largeFile = { size: 5 * 1024 * 1024 + 1, name: 'big.png' } as File;
        
        await expect(uploadJournalMedia(largeFile, 'user-123', true))
            .rejects.toThrow('File size exceeds 5MB limit.');
        
        expect(mockUpload).not.toHaveBeenCalled();
    });

    it('uploads to journal_public bucket when isPublic is true', async () => {
        const file = { size: 1000, name: 'test.png' } as File;
        const userId = 'user-A';
        
        const result = await uploadJournalMedia(file, userId, true);

        // Verify bucket selection
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('journal_public');
        
        // Verify upload path: {userId}/{uuid}.{ext}
        expect(mockUpload).toHaveBeenCalledWith(
            `${userId}/mock-uuid.png`,
            file,
            expect.objectContaining({ cacheControl: '3600', upsert: false })
        );

        // Verify return value is public URL
        expect(result).toEqual({
            path: 'https://supa.com/public/url',
            displayUrl: 'https://supa.com/public/url',
            isPublic: true
        });
    });

    it('uploads to journal_private bucket when isPublic is false', async () => {
        const file = { size: 1000, name: 'test.gif' } as File;
        const userId = 'user-B';
        
        const result = await uploadJournalMedia(file, userId, false);

        // Verify bucket selection
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('journal_private');
        
        // Verify upload path
        expect(mockUpload).toHaveBeenCalledWith(
            `${userId}/mock-uuid.gif`,
            file,
            expect.any(Object)
        );

        // Verify createSignedUrl is called for immediate display
        expect(mockCreateSignedUrl).toHaveBeenCalledWith(
            `${userId}/mock-uuid.gif`,
            60 * 60
        );

        // Verify return value includes storage protocol path
        expect(result).toEqual({
            path: `storage://journal_private/${userId}/mock-uuid.gif`,
            displayUrl: 'https://supa.com/signed/url',
            isPublic: false
        });
    });

    it('getSignedUrlForPath parses storage protocol correctly', async () => {
        const storagePath = 'storage://journal_private/user-B/mock-uuid.gif';
        
        const result = await getSignedUrlForPath(storagePath);

        expect(mockSupabase.storage.from).toHaveBeenCalledWith('journal_private');
        expect(mockCreateSignedUrl).toHaveBeenCalledWith('user-B/mock-uuid.gif', 3600);
        expect(result).toBe('https://supa.com/signed/url');
    });

    it('getSignedUrlForPath returns null for invalid protocol', async () => {
        const result = await getSignedUrlForPath('https://some-other-url.com/image.png');
        expect(result).toBeNull();
        expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    });
});
