#!/usr/bin/env node
/**
 * Ensures FE and BE ICT staff/student catalogues stay aligned.
 * Run: node scripts/check-ict-catalogue-parity.mjs
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

function parseTsGroups(text, exportName) {
  const m = text.match(
    new RegExp(`${exportName}[^=]*=\\s*\\[(.*?)\\];`, "s"),
  );
  if (!m) throw new Error(`Could not find ${exportName}`);
  const block = m[1];
  const groups = [];
  for (const gm of block.matchAll(
    /name:\s*['"]([^'"]+)['"]\s*,\s*subcategories:\s*\[(.*?)\]/gs,
  )) {
    const subs = [...gm[2].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
    groups.push({ name: gm[1], subcategories: subs });
  }
  return groups;
}

function parseDartGroups(text, constName) {
  const m = text.match(new RegExp(`${constName}\\s*=\\s*\\[(.*?)\\];`, "s"));
  if (!m) throw new Error(`Could not find ${constName}`);
  const block = m[1];
  const groups = [];
  for (const gm of block.matchAll(
    /name:\s*'([^']+)'\s*,\s*subcategories:\s*\[(.*?)\]/gs,
  )) {
    const subs = [...gm[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    groups.push({ name: gm[1], subcategories: subs });
  }
  return groups;
}

const fe = readFileSync(
  join(root, "frontend/lib/technical-support-categories.ts"),
  "utf8",
);
const be = readFileSync(
  join(
    root,
    "backend/src/technical-support/technical-support-categories.ts",
  ),
  "utf8",
);
const appPath = join(
  root,
  "../OUK-APP/lib/data/technical_support_categories.dart",
);
let app = null;
try {
  app = readFileSync(appPath, "utf8");
} catch {
  /* OUK-APP optional in CI checkout */
}

const pairs = [
  ["ICT_STAFF_CATEGORY_GROUPS", "staffTechnicalSupportCategories"],
  ["ICT_STUDENT_CATEGORY_GROUPS", "studentTechnicalSupportCategories"],
];

let failed = false;
for (const [tsName, dartName] of pairs) {
  const feG = parseTsGroups(fe, tsName);
  const beG = parseTsGroups(be, tsName);
  if (JSON.stringify(feG) !== JSON.stringify(beG)) {
    console.error(`MISMATCH FE vs BE: ${tsName}`);
    failed = true;
  } else {
    console.log(`OK FE==BE ${tsName} (${feG.length} groups)`);
  }
  if (app) {
    const appG = parseDartGroups(app, dartName);
    if (JSON.stringify(feG) !== JSON.stringify(appG)) {
      console.error(`MISMATCH FE vs OUK-APP: ${tsName} / ${dartName}`);
      failed = true;
    } else {
      console.log(`OK FE==APP ${dartName}`);
    }
  }
}

if (failed) process.exit(1);
console.log("Catalogue parity check passed.");
