# Multi-stage frontend image.
#
# Targets:
#   prebuilt  — copy workstation `.next` (low-memory hosts; current default)
#   runner    — build inside Docker with NEXT_PUBLIC_* baked in (preferred go-live)
#
# Local / existing:  docker compose build  → target prebuilt
# Production bake:   docker compose -f docker-compose.yml -f docker-compose.prod.yml build

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL=https://www.ouk.ac.ke/api
ARG NEXT_PUBLIC_SOCKET_URL=https://www.ouk.ac.ke
ARG NEXT_PUBLIC_SITE_URL=https://www.ouk.ac.ke
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
COPY . .
RUN npm run build

# Preferred production image — public env baked at build time
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]

# Low-memory path: sync a local `npm run build` then `docker compose build`
FROM node:20-alpine AS prebuilt
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm install --omit=dev
COPY .next ./.next
COPY public ./public
COPY next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "run", "start"]
