# SHAPE the Future

Erasmus+ **Grant Management & Dissemination Portal** for *Strengthening Higher Education for Smart Cities* — coordinated by the Open University of Kenya with partners across East Africa and Europe.

| Environment | URL |
|-------------|-----|
| **Website** | https://shape.ouk.ac.ke |
| **CMS / Admin** | https://shape.ouk.ac.ke/admin |

Based on the same stack as [OUK-Websites](https://github.com/DevMwarabu/OUK-Websites).

---

## Architecture

```mermaid
flowchart TB
  subgraph Clients
    Browser["Public visitors"]
    AdminUser["CMS editors / partners"]
  end

  subgraph Edge["Edge / reverse proxy"]
    Nginx["Nginx\n:80 / :443"]
  end

  subgraph App["Application"]
    FE["Next.js 14 Frontend\nReact · Tailwind · Framer Motion\n:3000"]
    BE["NestJS 11 API\nTypeORM · JWT · Passport\n:3001"]
  end

  subgraph Data["Data layer"]
    PG[("PostgreSQL 15\n+ pgvector")]
    Redis[("Redis cache\noptional")]
  end

  Browser --> Nginx
  AdminUser --> Nginx
  Nginx -->|"HTML / static"| FE
  Nginx -->|"/api · /uploads · /socket.io"| BE
  FE -->|"SSR rewrites /api"| BE
  BE --> PG
  BE -.-> Redis
```

### Request flow (production)

```mermaid
sequenceDiagram
  participant U as Browser
  participant N as Nginx
  participant F as Next.js
  participant A as NestJS
  participant D as PostgreSQL

  U->>N: GET /
  N->>F: proxy
  F->>A: GET /shape/partners, /news, /settings/public
  A->>D: query published content
  D-->>A: rows
  A-->>F: JSON
  F-->>U: SSR HTML

  U->>N: GET /admin
  N->>F: admin SPA
  U->>N: POST /api/auth/login
  N->>A: auth
  A->>D: verify user
  A-->>U: HttpOnly cookie ouk_admin_token
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, next-intl |
| **Backend** | NestJS 11, TypeORM, Passport JWT, Swagger |
| **Database** | PostgreSQL 15 (pgvector image) |
| **Cache** | Redis (falls back to in-memory in local dev) |
| **CMS** | Custom `/admin` SPA (same pattern as OUK main site) |
| **Deploy** | Docker Compose + Nginx |

### Brand colours (OUK)

| Token | Hex |
|-------|-----|
| Teal | `#037b90` |
| Gold / Coral | `#ff7f50` |
| White | `#ffffff` |

Fonts: **Inter** (body) · **Literata** (display headings)

---

## Repository layout

```
shapethefuture/
├── frontend/                 # Next.js public site + /admin CMS
├── backend/                  # NestJS API + TypeORM entities
│   └── src/shape/            # SHAPE domain (partners, WPs, events, KPIs…)
├── docker-compose.yml        # Full stack (prod-oriented)
├── docker-compose.shape.yml  # Local Postgres (+ Redis) only
├── nginx.conf                # Reverse proxy
└── .env.example              # Template secrets (no real credentials)
```

---

## Local development

### 1. Start database

```bash
docker compose -f docker-compose.shape.yml up -d
```

Postgres is mapped to **localhost:5433** (avoids clashing with a local Postgres on 5432).

### 2. Configure env

Copy examples and adjust:

```bash
cp .env.example .env
# also: backend/.env and frontend/.env.local
```

### 3. Install, seed, run

```bash
# API
cd backend && npm install && npm run start:dev

# Seed SHAPE content + admin user (once)
cd backend && npm run seed:shape

# Website
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| Website | http://localhost:3000 |
| Admin CMS | http://localhost:3000/admin |
| API | http://localhost:3001 |

### Seed admin (local)

Set a password in your environment before seeding — never commit it:

```bash
export SEED_ADMIN_EMAIL=admin@ouk.ac.ke
export SEED_ADMIN_PASSWORD='your-strong-local-password'
cd backend && npm run seed:shape
```

Use that same email/password to sign in at `/admin`. Change credentials for any shared or production environment.

---

## Public portal routes

| Path | Purpose |
|------|---------|
| `/` | Home — hero, stats, overview, news, WPs, partners |
| `/the-project` | Objectives, outcomes, funding, Erasmus+ |
| `/partners` | Nine partner institutions |
| `/work-packages` | WP1–WP8 with progress |
| `/workplan` | Activity timeline |
| `/events` | Event tracker |
| `/dashboard` | Grant progress KPIs |
| `/documents` | Document repository |
| `/news` | News & updates |
| `/sdlc` | Project development cycle |
| `/monitoring` | M&E + risk register |
| `/map` | Interactive partner map |
| `/gallery` | Media gallery |
| `/contact` | Coordinator + contact form |

---

## CMS (`/admin`)

SHAPE content managers (under **SHAPE Project** in the sidebar):

- Homepage content · Partners · Work packages · Events · Documents  
- KPIs · Activities · Risks · SDLC · Contact inbox · News · Hero slides  

Role-based access; Super Administrator has full control.

---

## Key API surfaces

**Public**

- `GET /shape/partners` · `/work-packages` · `/events` · `/documents`
- `GET /shape/activities` · `/kpis` · `/risks` · `/sdlc` · `/dashboard`
- `POST /shape/contact`
- `GET /news` · `GET /settings/public`

**Admin** (JWT cookie `ouk_admin_token`)

- `GET /shape/*/admin` + `POST` / `PATCH` / `DELETE` mutations
- `POST /auth/login` · `GET /auth/me`

---

## Production notes

```bash
# Configure strong secrets in .env for shape.ouk.ac.ke
docker compose up -d --build
```

- Set `NEXT_PUBLIC_SITE_URL=https://shape.ouk.ac.ke`
- Set `NEXT_PUBLIC_API_URL=https://shape.ouk.ac.ke/api`
- `TYPEORM_SYNCHRONIZE=false` in production; use migrations
- Never commit `.env` files or database dumps

---

## Partners (consortium)

Open University of Kenya · Moi University · Makerere University · Kampala International University · Mogadishu University · Red Sea University · Otto von Guericke University · University of Tartu · Lithuanian University of Health Sciences

---

## License / funding

Co-funded by the **Erasmus+** programme of the European Union. Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or EACEA.
