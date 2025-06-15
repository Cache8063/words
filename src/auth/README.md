# Fastify ATProto Auth

A Fastify plugin for ATProto (Bluesky) authentication. This module provides a clean integration between Fastify web applications and the AT Protocol authentication system.

## Features

- 🔐 Full ATProto authentication support
- 🍪 Secure cookie-based sessions
- 🔑 JWT token generation
- 🔄 Automatic session refresh
- 🎯 TypeScript-friendly
- 🧩 Modular and extensible

## Installation

```bash
npm install @atdash/fastify-atproto-auth
```

## Usage

```javascript
const fastify = require('fastify')();
const fastifyATProto = require('@atdash/fastify-atproto-auth');

// Register the plugin
await fastify.register(fastifyATProto, {
  jwtSecret: 'your-secret-key',
  defaultService: 'https://bsky.social',
  autoDetectService: true,
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax'
  }
});

// The plugin adds these routes automatically:
// POST /api/auth/login
// POST /api/auth/logout
// GET  /api/auth/session

// Protect routes with authentication
fastify.get('/protected', 
  { preHandler: fastify.authenticate }, 
  async (request, reply) => {
    return { user: request.user };
  }
);

// Optional authentication
fastify.get('/optional', 
  { preHandler: fastify.optionalAuth }, 
  async (request, reply) => {
    return { user: request.user || null };
  }
);
```

## API

### Plugin Options

- `jwtSecret`: Secret key for JWT signing (required)
- `defaultService`: Default PDS service URL (default: 'https://bsky.social')
- `autoDetectService`: Auto-detect PDS from handle (default: true)
- `cookieOptions`: Cookie configuration options
- `debug`: Enable debug logging (default: false)

### Decorators

- `fastify.atproto`: ATProto auth client instance
- `fastify.authenticate`: Route preHandler for required auth
- `fastify.optionalAuth`: Route preHandler for optional auth

### Request Decorators

- `request.user`: Authenticated user object (when authenticated)

## Contributing

This module is part of the Word Mastermind project but designed to be extracted and maintained separately. Contributions welcome!

## License

MIT