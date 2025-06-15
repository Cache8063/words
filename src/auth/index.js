/**
 * Fastify ATProto Auth Module
 * 
 * This module can be extracted into @atdash/fastify-atproto-auth
 * and published as a separate package for the community
 */

const { FastifyStorageAdapter } = require('./fastify-storage-adapter');
const { ATProtoAuthClient } = require('./atproto-auth-wrapper');
const fastifyATProtoPlugin = require('./fastify-atproto-plugin');

module.exports = {
    // Main plugin for Fastify
    default: fastifyATProtoPlugin,
    fastifyATProto: fastifyATProtoPlugin,
    
    // Exported classes for advanced usage
    FastifyStorageAdapter,
    ATProtoAuthClient
};