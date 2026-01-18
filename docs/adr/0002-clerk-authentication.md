# ADR-0002: Clerk Authentication

## Status
ACCEPTED

## Context
The application needed user authentication for:
- Game leaderboards (linking scores to users)
- Currency system (secure balance tracking)
- Future social features

Options considered:
1. **Clerk** - Full-featured auth with React SDK
2. **Auth0** - Enterprise auth platform
3. **Supabase Auth** - PostgreSQL-based auth
4. **Custom JWT** - Roll our own

## Decision
Use Clerk because:
- Excellent React SDK with pre-built components
- Social login (Google, Twitter) out of the box
- Works well with Cloudflare Workers (JWT verification)
- Good developer experience
- Generous free tier (5,000 MAU)

## Consequences

### Positive
- No need to build login/signup UI
- Social providers configured in dashboard
- JWT tokens work with edge functions
- User management dashboard included

### Negative
- Vendor lock-in for auth
- Must verify JWTs on every API request
- Token expiration (60s) requires refresh handling
- Additional latency for token verification

### Neutral
- User ID is in `sub` claim of JWT
- Must sync Clerk user to D1 on first login

## Implementation Notes

```typescript
// JWT verification in API routes
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const payload = await verifyClerkJWT(token, env.CLERK_SECRET_KEY);
const userId = payload.sub;
```

## References
- [Clerk Docs](https://clerk.com/docs)
- [Clerk + Cloudflare Workers](https://clerk.com/docs/references/nextjs/edge-middleware)
