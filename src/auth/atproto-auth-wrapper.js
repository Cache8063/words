/**
 * ATProto Auth Client Wrapper
 * 
 * This wrapper adapts the @atdash/atproto-auth client to work with
 * Fastify's request/reply context for cookie handling
 */

const { BskyAgent } = require('@atproto/api');

class ATProtoAuthClient {
    constructor(config = {}) {
        this.config = {
            defaultService: 'https://bsky.social',
            autoDetectService: true,
            debug: false,
            ...config
        };
        this.storage = config.storage;
        this.sessionKey = 'atproto-session';
        this.agents = new Map(); // Cache agents by session ID
    }

    /**
     * Detect the PDS service from a user handle
     */
    detectService(identifier) {
        if (!this.config.autoDetectService) {
            return this.config.defaultService;
        }

        // Check for email format
        if (identifier.includes('@')) {
            return this.config.defaultService;
        }

        // Extract domain from handle format
        if (identifier.includes('.')) {
            const parts = identifier.split('.');
            if (parts.length >= 2) {
                const domain = parts.slice(-2).join('.');
                // Don't create service URL for standard Bluesky handles
                if (domain === 'bsky.social') {
                    return 'https://bsky.social';
                }
                // For custom domains, create the service URL
                return `https://${domain}`;
            }
        }

        return this.config.defaultService;
    }

    /**
     * Login to AT Protocol
     * @param {Object} credentials - Login credentials
     * @param {Object} context - Fastify context with request and reply
     */
    async login(credentials, context) {
        try {
            const service = credentials.service || this.detectService(credentials.identifier);
            
            if (this.config.debug) {
                console.log(`[ATProtoAuth] Attempting login to: ${service}`);
            }

            const agent = new BskyAgent({ service });
            
            const response = await agent.login({
                identifier: credentials.identifier,
                password: credentials.password,
                authFactorToken: credentials.authFactorToken
            });

            if (!response.success || !agent.session) {
                throw new Error('Login failed');
            }

            const session = {
                accessJwt: agent.session.accessJwt,
                refreshJwt: agent.session.refreshJwt,
                handle: agent.session.handle,
                did: agent.session.did,
                service,
                email: agent.session.email,
                emailVerified: agent.session.emailVerified,
                active: agent.session.active
            };

            // Store session in cookie
            await this.storage.set(this.sessionKey, JSON.stringify(session), context.reply);

            // Cache agent for later use
            const sessionId = this.generateSessionId();
            this.agents.set(sessionId, agent);

            if (this.config.debug) {
                console.log(`[ATProtoAuth] Login successful for: ${session.handle}`);
            }

            return session;
        } catch (error) {
            if (this.config.debug) {
                console.error('[ATProtoAuth] Login error:', error);
            }
            throw error;
        }
    }

    /**
     * Logout and clear session
     * @param {Object} context - Fastify context with request and reply
     */
    async logout(context) {
        try {
            await this.storage.remove(this.sessionKey, context.reply);
            
            if (this.config.debug) {
                console.log('[ATProtoAuth] Logout successful');
            }
        } catch (error) {
            if (this.config.debug) {
                console.error('[ATProtoAuth] Logout error:', error);
            }
            throw error;
        }
    }

    /**
     * Get current session without refresh
     * @param {Object} context - Fastify context with request and reply
     */
    async getSession(context) {
        try {
            const storedSession = await this.storage.get(this.sessionKey, context.request);
            if (!storedSession) {
                return null;
            }
            return JSON.parse(storedSession);
        } catch {
            return null;
        }
    }

    /**
     * Refresh the current session
     * @param {Object} context - Fastify context with request and reply
     */
    async refresh(context) {
        try {
            const session = await this.getSession(context);
            if (!session) {
                return null;
            }

            // Try to get cached agent or create new one
            let agent = Array.from(this.agents.values()).find(a => 
                a.session?.did === session.did
            );

            if (!agent) {
                agent = new BskyAgent({ service: session.service });
            }

            // Resume session
            const resumed = await agent.resumeSession({
                accessJwt: session.accessJwt,
                refreshJwt: session.refreshJwt,
                handle: session.handle,
                did: session.did,
                active: true
            });

            if (!resumed || !agent.session) {
                // Session expired
                await this.logout(context);
                return null;
            }

            // Update stored session with refreshed tokens
            const updatedSession = {
                ...session,
                accessJwt: agent.session.accessJwt,
                refreshJwt: agent.session.refreshJwt,
                active: agent.session.active
            };

            await this.storage.set(this.sessionKey, JSON.stringify(updatedSession), context.reply);
            
            return updatedSession;
        } catch (error) {
            if (this.config.debug) {
                console.error('[ATProtoAuth] Refresh error:', error);
            }
            return null;
        }
    }

    /**
     * Generate secure session ID
     */
    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}

module.exports = { ATProtoAuthClient };