/**
 * Fastify Storage Adapter for @atdash/atproto-auth
 * 
 * This adapter allows the atproto-auth module to work with Fastify's cookie system
 * Can be contributed back to atproto-auth as a storage option
 */

class FastifyStorageAdapter {
    constructor(options = {}) {
        this.cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            ...options
        };
    }

    /**
     * Get value from Fastify request cookies
     */
    async get(key, request) {
        if (!request || !request.cookies) {
            return null;
        }
        return request.cookies[key] || null;
    }

    /**
     * Set cookie value in Fastify reply
     */
    async set(key, value, reply) {
        if (!reply) {
            throw new Error('Reply object required for setting cookies');
        }
        reply.setCookie(key, value, this.cookieOptions);
    }

    /**
     * Remove cookie from Fastify reply
     */
    async remove(key, reply) {
        if (!reply) {
            throw new Error('Reply object required for removing cookies');
        }
        reply.setCookie(key, '', { ...this.cookieOptions, maxAge: 0 });
    }

    /**
     * Clear all auth-related cookies
     */
    async clear(reply) {
        // In a real implementation, we'd track cookie names or use a prefix
        await this.remove('atproto-session', reply);
    }
}

module.exports = { FastifyStorageAdapter };