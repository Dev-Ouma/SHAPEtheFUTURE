# Database backups

Store Postgres dumps here (not at the repo root). Keep this directory out of Docker build contexts via `.dockerignore`.

Examples:

```bash
pg_dump -h 127.0.0.1 -p 5433 -U shape_user -d shape_db -Fc -f database/backups/shape_$(date +%Y%m%d).dump
```

Never commit production dumps or `.env` files.
