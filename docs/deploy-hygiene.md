# Deploy hygiene

Run before every production deploy:

```bash
node scripts/check-deploy-hygiene.mjs
```

## What it checks

- Dangerous artifacts (`.sql`, dumps, sqlite, `.env`) are covered by `.dockerignore` in frontend/backend build contexts  
- Production `.env` (if present) does not still contain obvious placeholder secrets from `.env.example`

## Rules of thumb

1. **Never commit** `.env`, database dumps, or real `SEED_ADMIN_PASSWORD` values  
2. Use `.env.example` → `.env` on the server only  
3. Prefer `TYPEORM_SYNCHRONIZE=false` + migrations (or a restored dump with reconciled history)  
4. Production compose requires `POSTGRES_PASSWORD` and `JWT_SECRET` — missing values fail fast  
5. Do not mount `docker-compose.dev.yml` on a public host  
6. Frontend `NEXT_PUBLIC_*` must match the live origin (`https://shape.ouk.ac.ke`) at build time  

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the full cutover sequence.
