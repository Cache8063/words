/**
 * Fastify Plugin for ATProto Authentication
 * 
 * This plugin integrates @atdash/atproto-auth with Fastify
 * Provides a clean interface between the auth module and our app
 */

const fp = require('fastify-plugin');
const { ATProtoAuthClient } = require('./atproto-auth-wrapper');
const { FastifyStorageAdapter } = require('./fastify-storage-adapter');

async function fastifyATProto(fastify, options) {
    // Register cookie plugin if not already registered
    if (!fastify.hasDecorator('setCookie')) {
        await fastify.register(require('@fastify/cookie'));
    }

    // Register JWT plugin if not already registered
    if (!fastify.hasDecorator('jwt')) {
        await fastify.register(require('@fastify/jwt'), {
            secret: options.jwtSecret || process.env.JWT_SECRET || 'your-secret-key',
            cookie: {
                cookieName: 'token',
                signed: false
            }
        });
    }

    // Create storage adapter instance
    const storage = new FastifyStorageAdapter(options.cookieOptions);

    // Create auth client instance
    const authClient = new ATProtoAuthClient({
        defaultService: options.defaultService || 'https://bsky.social',
        autoDetectService: options.autoDetectService !== false,
        storage: storage,
        debug: options.debug || false
    });

    // Decorate Fastify with auth client
    fastify.decorate('atproto', authClient);
    fastify.decorate('atprotoStorage', storage);

    // Add auth routes
    fastify.post('/api/auth/login', async (request, reply) => {
        try {
            const { identifier, password, service } = request.body;
            
            if (!identifier || !password) {
                return reply.code(400).send({ 
                    error: 'Missing identifier or password' 
                });
            }

            const session = await authClient.login(
                { identifier, password, service },
                { request, reply }
            );

            // Create JWT token for stateless auth
            const token = fastify.jwt.sign({
                did: session.did,
                handle: session.handle,
                email: session.email
            });

            // Set both ATProto session and JWT token
            reply.setCookie('token', token, storage.cookieOptions);

            return {
                success: true,
                user: {
                    did: session.did,
                    handle: session.handle,
                    email: session.email,
                    emailVerified: session.emailVerified
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(401).send({ 
                error: error.message || 'Authentication failed' 
            });
        }
    });

    fastify.post('/api/auth/logout', async (request, reply) => {
        try {
            await authClient.logout({ request, reply });
            reply.clearCookie('token');
            reply.clearCookie('atproto-session');
            
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ 
                error: 'Logout failed' 
            });
        }
    });

    fastify.get('/api/auth/session', async (request, reply) => {
        try {
            const session = await authClient.getSession({ request, reply });
            
            if (!session) {
                return reply.code(401).send({ 
                    error: 'Not authenticated' 
                });
            }

            return {
                user: {
                    did: session.did,
                    handle: session.handle,
                    email: session.email,
                    emailVerified: session.emailVerified
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(401).send({ 
                error: 'Session invalid' 
            });
        }
    });

    // Decorator to require authentication
    fastify.decorate('authenticate', async function(request, reply) {
        try {
            await request.jwtVerify();
            const session = await authClient.getSession({ request, reply });
            if (!session) {
                throw new Error('Session not found');
            }
            request.user = {
                did: session.did,
                handle: session.handle,
                email: session.email
            };
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    // Decorator for optional authentication
    fastify.decorate('optionalAuth', async function(request, reply) {
        try {
            await request.jwtVerify();
            const session = await authClient.getSession({ request, reply });
            if (session) {
                request.user = {
                    did: session.did,
                    handle: session.handle,
                    email: session.email
                };
            }
        } catch (err) {
            // Silent fail - user is just not authenticated
            request.user = null;
        }
    });
}

module.exports = fp(fastifyATProto, {
    name: 'fastify-atproto',
    dependencies: []
});