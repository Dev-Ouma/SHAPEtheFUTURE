# Deployment — SHAPE portal

Production host: **https://shape.ouk.ac.ke**

Stack: Nginx → Next.js (`:3000`) + NestJS (`:3001`) → PostgreSQL (pgvector) + Redis.

For local setup see [README.md](./README.md). Edge TLS details: [docs/edge-hardening.md](./docs/edge-hardening.md). Pre-flight: [docs/deploy-hygiene.md](./docs/deploy-hygiene.md).

---

## Compose matrix

| Goal | Command |
|------|---------|
| Local DB only | `docker compose -f docker-compose.shape.yml up -d` |
| Full stack (HTTP, prebuilt FE) | `cp .env.example .env` → fill secrets → `docker compose up -d --build` |
| Full stack (HTTP, bake FE in Docker) | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` |
| Dev overlay (weak local defaults) | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` |
| HTTPS | `docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.tls.yml up -d` |

Never use `docker-compose.dev.yml` on a public host.

---

## Required secrets (`.env`)

| Variable | Notes |
|----------|-------|
| `POSTGRES_PASSWORD` | Strong; required by compose (`:?`) |
| `JWT_SECRET` | 32+ random chars; required by compose |
| `CORS_ORIGINS` | Include `https://shape.ouk.ac.ke` |
| `NEXT_PUBLIC_SITE_URL` | `https://shape.ouk.ac.ke` |
| `NEXT_PUBLIC_API_URL` | `https://shape.ouk.ac.ke/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://shape.ouk.ac.ke` |

`NEXT_PUBLIC_*` are baked at **frontend build** time (prod overlay build-args or workstation `npm run build`).

---

## Pre-flight checklist

```bash
node scripts/check-deploy-hygiene.mjs
```

1. `.env` exists and is **not** committed  
2. `TYPEORM_SYNCHRONIZE=false` in production  
3. `RUN_MIGRATIONS_ON_START` only after migration history is reconciled  
4. Leave `AUTH_COOKIE_SECURE` unset on HTTPS (Secure cookies default on)  
5. Certs present for TLS overlay (`SSL_CERTS_DIR`, default `/etc/letsencrypt`)  
6. Frontend production build completed if using `prebuilt` target  

---

## Deploy steps (HTTP → HTTPS)

```bash
# 1. Secrets
cp .env.example .env
# edit POSTGRES_PASSWORD, JWT_SECRET, NEXT_PUBLIC_*, CORS_ORIGINS

# 2. Hygiene
node scripts/check-deploy-hygiene.mjs

# 3. Build & start (baked frontend)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Seed CMS content once (from a secure shell with SEED_ADMIN_*)
docker compose exec backend sh -c 'npm run seed:shape'

# 5. Health
curl -fsS http://127.0.0.1/api/health
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/

# 6. TLS (after Let's Encrypt certs for shape.ouk.ac.ke)
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.tls.yml up -d
```

Admin login: `https://shape.ouk.ac.ke/admin` (HttpOnly cookie `ouk_admin_token`).

---

## Health endpoints

| Check | URL |
|-------|-----|
| API liveness | `GET /health` (or `/api/health` via nginx) |
| Public site | `GET /` → 200 |
| Compose | `docker compose ps` — postgres, redis, backend healthy |

---

## Rollback

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
# restore previous images / git tag, then up -d --build
```

Database: restore from your Postgres backup volume/`pg_dump` — compose does not auto-migrate dumps.

---

## CI expectations

GitHub Actions (`.github/workflows/ci.yml`):

- Frontend typecheck (+ lint advisory)
- Backend build + Shape-focused lint + Shape unit tests  
- Playwright a11y + smoke against a production frontend build  
- Deploy hygiene script  

---

## Partner CMS model

| Role | Access |
|------|--------|
| Consortium coordinator / Super Admin | Full SHAPE CMS (KPIs, risks, SDLC, press, contact inbox) |
| Partner institution user | Scoped partners / WPs / events / documents / activities |

New CMS records default to **draft** (`is_published=false`) until explicitly published.
