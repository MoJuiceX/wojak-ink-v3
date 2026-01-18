# ADR-0002: Use Clerk for Authentication

**Status**: Accepted
**Date**: 2026-01-18
**Author**: MoJuiceX

## Context
The platform needs user authentication to:
1. Identify users across sessions
2. Secure API endpoints for currency transactions
3. Prevent impersonation and cheating
4. Enable cross-device account access

Options considered: Firebase Auth, Auth0, Clerk, custom JWT solution.

## Decision
Use Clerk for authentication with JWT verification on Cloudflare Workers.

Key implementation details:
- User ID is in the `sub` claim of the JWT
- Use `verifyClerkJWT(token, env)` helper for verification
- Clerk tokens expire after 60 seconds
- Frontend uses `@clerk/clerk-react` hooks

## Consequences
### Positive
- Quick setup with React SDK
- Built-in UI components (SignIn, SignUp, UserButton)
- JWT verification works well with Cloudflare Workers
- Handles OAuth providers (Google, etc.)
- Good free tier for small projects

### Negative
- Vendor lock-in to Clerk's ecosystem
- Token expiration (60s) requires refresh handling
- Additional network request for JWT verification
- Monthly cost if user count grows

## References
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Cloudflare Workers Guide](https://clerk.com/docs/references/backend/cloudflare)
- `.claude/patterns/api-patterns.md` (Authentication section)
