# Edge hardening (Nginx + TLS)

Local/dev uses `nginx.conf` on **HTTP :80** only.

Production HTTPS uses `nginx.ssl.example.conf` via `docker-compose.tls.yml`.

## Hostnames

| Item | Value |
|------|-------|
| Public site | `https://shape.ouk.ac.ke` |
| Cert path (default) | `/etc/letsencrypt/live/shape.ouk.ac.ke/` |
| CORS | `CORS_ORIGINS=https://shape.ouk.ac.ke` |

## TLS cutover

1. Obtain certificates for `shape.ouk.ac.ke` (e.g. certbot) into `SSL_CERTS_DIR`  
2. Confirm HTTP stack is healthy with prod overlay  
3. Start TLS overlay:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.tls.yml up -d
```

4. Leave `AUTH_COOKIE_SECURE` unset so admin cookies are `Secure` under HTTPS  
5. Enable HSTS in `nginx.ssl.example.conf` only after HTTPS has been stable for several days — never on HTTP-only hosts  

## Proxy notes

- Browser calls same-origin `/api/*` (Next rewrite / nginx → Nest)  
- Uploads: `/uploads/*` → backend  
- Admin auth: HttpOnly cookie `ouk_admin_token` — never store JWTs in `localStorage`  
- Rate-limit zones in the SSL config cover login, uploads, analytics, and form posts  

## CSP / analytics

Keep Content-Security-Policy Report-Only until third-party domains (e.g. GA4) are allowlisted. Load analytics only after cookie consent (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
