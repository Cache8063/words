const { FastifyStorageAdapter, ATProtoAuthClient } = require('./index');

describe('ATProto Auth Module', () => {
    describe('FastifyStorageAdapter', () => {
        it('should create storage adapter with default options', () => {
            const storage = new FastifyStorageAdapter();
            expect(storage.cookieOptions).toMatchObject({
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            });
        });

        it('should merge custom options', () => {
            const storage = new FastifyStorageAdapter({ 
                maxAge: 3600,
                domain: '.example.com' 
            });
            expect(storage.cookieOptions.maxAge).toBe(3600);
            expect(storage.cookieOptions.domain).toBe('.example.com');
        });
    });

    describe('ATProtoAuthClient', () => {
        it('should create auth client with default config', () => {
            const client = new ATProtoAuthClient();
            expect(client.config.defaultService).toBe('https://bsky.social');
            expect(client.config.autoDetectService).toBe(true);
        });

        it('should detect Bluesky service for standard handles', () => {
            const client = new ATProtoAuthClient();
            expect(client.detectService('user.bsky.social')).toBe('https://bsky.social');
            expect(client.detectService('test@email.com')).toBe('https://bsky.social');
        });

        it('should detect custom PDS for custom domains', () => {
            const client = new ATProtoAuthClient();
            expect(client.detectService('user.custom.com')).toBe('https://custom.com');
            expect(client.detectService('alice.example.org')).toBe('https://example.org');
        });
    });
});