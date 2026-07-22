#!/usr/bin/env node
/**
 * Deploy hygiene pre-flight (local-safe).
 * - Ensures dump/sqlite/env files are not present in Docker build contexts
 *   after .dockerignore filtering (approximate: path must match ignore patterns).
 * - Warns / fails on example placeholder secrets when checking production .env.
 *
 * Usage: node scripts/check-deploy-hygiene.mjs
 * Exit 0 = OK, 1 = problems found.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = false;

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  failed = true;
}

function ok(msg) {
  console.log(`OK    ${msg}`);
}

function warn(msg) {
  console.warn(`WARN  ${msg}`);
}

/** Very small dockerignore matcher for our patterns (not a full dockerignore parser). */
function ignoredBy(dockerignoreText, relPosix) {
  const lines = dockerignoreText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("!"));

  const base = path.posix.basename(relPosix);
  for (const line of lines) {
    if (line === relPosix || line === base) return true;
    if (line.startsWith("**/") && relPosix.includes(line.slice(3))) return true;
    if (line.startsWith("*.") && base.endsWith(line.slice(1))) return true;
    if (line.endsWith("*") && (relPosix.startsWith(line.slice(0, -1)) || base.startsWith(line.slice(0, -1))))
      return true;
    if (line.includes("*dump*") && /dump/i.test(relPosix)) return true;
    if (["scratch", "node_modules", "dist", "coverage", "logs", "test", "tests"].includes(line)) {
      if (relPosix === line || relPosix.startsWith(`${line}/`)) return true;
    }
    if (line === "*.sql" && base.endsWith(".sql")) return true;
    if (line === "*.dump" && base.endsWith(".dump")) return true;
    if (line === "*.sqlite" && base.endsWith(".sqlite")) return true;
    if (line === "*.sqlite3" && base.endsWith(".sqlite3")) return true;
    if (line === "database.sqlite" && base === "database.sqlite") return true;
    if (line === ".env" && (base === ".env" || relPosix.endsWith("/.env"))) return true;
    if (line === ".env.*" && /^\.env\./.test(base)) return true;
  }
  return false;
}

function walkDangerous(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "dist" || name === ".next") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkDangerous(full, acc);
    else {
      const lower = name.toLowerCase();
      if (
        /^ouk_db_dump/i.test(name) ||
        lower.endsWith(".dump") ||
        lower.endsWith(".sqlite") ||
        lower.endsWith(".sqlite3") ||
        name === "dump.sql" ||
        name === "database.sqlite" ||
        name === ".env" ||
        /^\.env\./.test(name)
      ) {
        acc.push(full);
      }
    }
  }
  return acc;
}

const contexts = [
  { name: "backend", dir: path.join(root, "backend") },
  { name: "frontend", dir: path.join(root, "frontend") },
  { name: "ai-service", dir: path.join(root, "ai-service") },
];

for (const ctx of contexts) {
  if (!fs.existsSync(ctx.dir)) {
    ok(`${ctx.name}: not present (skipped)`);
    continue;
  }
  const diPath = path.join(ctx.dir, ".dockerignore");
  if (!fs.existsSync(diPath)) {
    fail(`${ctx.name}: missing .dockerignore`);
    continue;
  }
  const di = fs.readFileSync(diPath, "utf8");
  const dangers = walkDangerous(ctx.dir);
  let leaked = 0;
  for (const full of dangers) {
    const rel = path.relative(ctx.dir, full).split(path.sep).join("/");
    if (rel === ".env.example") continue;
    if (!ignoredBy(di, rel)) {
      fail(`${ctx.name} build context would include: ${rel}`);
      leaked += 1;
    }
  }
  if (leaked === 0) ok(`${ctx.name}: dumps/env/sqlite excluded from image context`);
}

// Root-level dumps should live under database/backups/
const rootDumps = fs
  .readdirSync(root)
  .filter((n) => /^ouk_db_dump/i.test(n) || n.endsWith(".dump"));
if (rootDumps.length) {
  warn(
    `Root still has dump files (${rootDumps.join(", ")}). Prefer database/backups/ — see docs/deploy-hygiene.md`,
  );
} else {
  ok("No full dumps at repo root");
}

const backupsReadme = path.join(root, "database/backups/README.md");
if (fs.existsSync(backupsReadme)) ok("database/backups/README.md present");
else warn("database/backups/README.md missing");

// Placeholder secret check for root .env (if present)
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  const weak =
    /POSTGRES_PASSWORD\s*=\s*change-me/i.test(env) ||
    /JWT_SECRET\s*=\s*change-me/i.test(env) ||
    /POSTGRES_PASSWORD\s*=\s*ouk_dev_only/i.test(env) ||
    /JWT_SECRET\s*=\s*ouk_dev_only/i.test(env);
  const nodeProd = /NODE_ENV\s*=\s*production/i.test(env);
  if (weak && nodeProd) {
    fail(
      ".env looks production-shaped but still has example/dev secrets — rotate before public deploy",
    );
  } else if (weak) {
    warn(".env still has example/dev placeholder secrets (OK for local + docker-compose.dev.yml only)");
  } else {
    ok(".env secrets do not match known placeholders");
  }
} else {
  ok("No root .env in tree (compose will use environment / example copy)");
}

console.log("");
if (failed) {
  console.error("Deploy hygiene check failed.");
  process.exit(1);
}
console.log("Deploy hygiene check passed.");
process.exit(0);
