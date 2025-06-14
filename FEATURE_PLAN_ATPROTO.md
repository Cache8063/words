# ATProto Authentication Integration

## Overview
Integrate ATProto (Bluesky) authentication module to enable social login for Word Mastermind users.

## Requirements
- [ ] Add ATProto auth module as dependency
- [ ] Create login/logout UI components
- [ ] Implement session management
- [ ] Store user DID and handle
- [ ] Update API to support authenticated requests
- [ ] Add auth middleware to protect user-specific endpoints

## Technical Approach
1. Backend:
   - Add ATProto auth endpoints (`/auth/login`, `/auth/logout`, `/auth/verify`)
   - Session management with JWT or secure cookies
   - User model to store ATProto identity

2. Frontend:
   - Login button/modal
   - Session state management
   - Display user handle when logged in
   - Logout functionality

## Dependencies
- Your standalone ATProto auth module
- Session storage (Redis or in-memory for dev)
- JWT library or session management

## Testing
- Test login flow
- Test session persistence
- Test logout
- Test protected endpoints