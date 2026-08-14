# Auth Service — Environment Variables

Required for production:

```bash
JWT_SECRET=          # long random string (min 32 chars)
REDIS_URL=           # e.g. redis://default:password@host:6379
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SERVICE_PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://app.nox.example,https://admin.nox.example
```

Development:

```bash
NODE_ENV=development   # OTP codes logged to console
# REDIS_URL omitted → in-memory fallback (NOT for production)
```

## Endpoints (prefix `/api/v1`)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | /auth/request-otp | `{ "phone": "+959..." }` | Rate limited by phone + IP |
| POST | /auth/verify-otp | `{ "phone": "...", "code": "123456" }` | Returns access + refresh tokens |
| POST | /auth/refresh | `{ "refreshToken": "..." }` | Rotates refresh token |
| POST | /auth/logout | `{ "refreshToken": "..." }` | Revokes refresh token |

## Security

- Access token: 15 min
- Refresh token: 30 days, rotated on every use
- OTP: 6 digits, 5 min TTL, max 5 attempts, rate limits enforced
- Phone normalized to E.164 Myanmar format
- Never log tokens or OTP in production logs
