#!/usr/bin/env node
/**
 * seed-programme.js
 *
 * Usage:
 *   node scripts/seed-programme.js <path-to-programme.json>
 *
 * What it does:
 *   - Reads the JSON file describing a programme and its course units
 *   - Resolves the school by name from the database
 *   - Upserts the programme (creates or updates by slug)
 *   - Upserts all course units (creates or updates by unit_code)
 *   - Links every course unit to the programme
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Accepts either a plain string or an array of strings.
 * Arrays are formatted as a numbered list: "1. Item\n2. Item\n..."
 */
function toNumberedList(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.map((item, i) => `${i + 1}. ${item.trim()}`).join('\n');
  }
  return value;
}

function usage() {
  console.error('\nUsage:  node scripts/seed-programme.js <programme.json>\n');
  process.exit(1);
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function now() {
  return new Date().toISOString();
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2];
  if (!filePath) usage();

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }

  const { programme: prog, course_units: units = [] } = data;

  if (!prog || !prog.title) {
    console.error('JSON must have a "programme" object with at least a "title" field.');
    process.exit(1);
  }

  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'ouk_db',
  });

  await client.connect();
  console.log(`\n✓ Connected to database: ${process.env.DB_NAME}`);

  try {
    await client.query('BEGIN');

    // ── 1. Resolve school ───────────────────────────────────────────────────
    let schoolId = null;
    if (prog.school_name) {
      const { rows } = await client.query(
        `SELECT id FROM schools WHERE name ILIKE $1 LIMIT 1`,
        [prog.school_name]
      );
      if (rows.length === 0) {
        console.error(`School not found: "${prog.school_name}"`);
        console.error('Available schools:');
        const { rows: all } = await client.query('SELECT name FROM schools ORDER BY name');
        all.forEach(r => console.error(`  - ${r.name}`));
        process.exit(1);
      }
      schoolId = rows[0].id;
      console.log(`✓ School resolved: ${prog.school_name} (${schoolId})`);
    }

    // ── 2. Upsert programme ─────────────────────────────────────────────────
    const progSlug = prog.slug || slug(prog.title);

    const upsertProg = `
      INSERT INTO programs (
        id, title, slug, programme_code, level,
        "schoolId", mode_of_delivery, duration, application_status,
        overview, learning_outcomes, entry_requirements,
        programme_structure, careers, assessment, fees_scholarships,
        brochure_url, programme_image, is_featured, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19, $20
      )
      ON CONFLICT (slug) DO UPDATE SET
        title               = EXCLUDED.title,
        programme_code      = EXCLUDED.programme_code,
        level               = EXCLUDED.level,
        "schoolId"          = EXCLUDED."schoolId",
        mode_of_delivery    = EXCLUDED.mode_of_delivery,
        duration            = EXCLUDED.duration,
        application_status  = EXCLUDED.application_status,
        overview            = EXCLUDED.overview,
        learning_outcomes   = EXCLUDED.learning_outcomes,
        entry_requirements  = EXCLUDED.entry_requirements,
        programme_structure = EXCLUDED.programme_structure,
        careers             = EXCLUDED.careers,
        assessment          = EXCLUDED.assessment,
        fees_scholarships   = EXCLUDED.fees_scholarships,
        brochure_url        = EXCLUDED.brochure_url,
        programme_image     = EXCLUDED.programme_image,
        is_featured         = EXCLUDED.is_featured,
        updated_at          = EXCLUDED.updated_at
      RETURNING id
    `;

    const progValues = [
      prog.title,
      progSlug,
      prog.programme_code   || null,
      prog.level            || 'Undergraduate',
      schoolId,
      prog.mode_of_delivery || 'Online',
      prog.duration         || null,
      prog.application_status || 'Open',
      prog.overview         || null,
      toNumberedList(prog.learning_outcomes),
      toNumberedList(prog.entry_requirements),
      prog.programme_structure || null,
      prog.careers          || null,
      prog.assessment       || null,
      prog.fees_scholarships || null,
      prog.brochure_url     || null,
      prog.programme_image  || null,
      prog.is_featured !== undefined ? prog.is_featured : false,
      now(),
      now(),
    ];

    const { rows: [{ id: progId }] } = await client.query(upsertProg, progValues);
    console.log(`✓ Programme upserted: "${prog.title}" (${progId})`);

    // ── 3. Upsert course units ──────────────────────────────────────────────
    if (units.length === 0) {
      console.log('  No course units defined — skipping.');
    }

    let inserted = 0, updated = 0;

    for (const unit of units) {
      if (!unit.unit_code || !unit.title) {
        console.warn(`  ⚠ Skipping unit with missing unit_code or title:`, unit);
        continue;
      }

      const upsertUnit = `
        INSERT INTO course_units (
          id, unit_code, title, description, credits,
          year_level, department, study_level, status, language,
          learning_outcomes, assessment_methods, prerequisites,
          "programId", created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15
        )
        ON CONFLICT (unit_code) DO UPDATE SET
          title              = EXCLUDED.title,
          description        = EXCLUDED.description,
          credits            = EXCLUDED.credits,
          year_level         = EXCLUDED.year_level,
          department         = EXCLUDED.department,
          study_level        = EXCLUDED.study_level,
          status             = EXCLUDED.status,
          language           = EXCLUDED.language,
          learning_outcomes  = EXCLUDED.learning_outcomes,
          assessment_methods = EXCLUDED.assessment_methods,
          prerequisites      = EXCLUDED.prerequisites,
          "programId"        = EXCLUDED."programId",
          updated_at         = EXCLUDED.updated_at
        RETURNING (xmax = 0) AS is_insert
      `;

      const unitValues = [
        unit.unit_code,
        unit.title,
        unit.description        || null,
        unit.credits            || 3,
        unit.year_level         || null,
        unit.department         || prog.title,
        unit.study_level        || prog.level || 'Undergraduate',
        unit.status             || 'Active',
        unit.language           || 'English',
        toNumberedList(unit.learning_outcomes),
        unit.assessment_methods || null,
        unit.prerequisites      || null,
        progId,
        now(),
        now(),
      ];

      const { rows: [{ is_insert }] } = await client.query(upsertUnit, unitValues);
      if (is_insert) inserted++; else updated++;
    }

    console.log(`✓ Course units: ${inserted} inserted, ${updated} updated`);

    await client.query('COMMIT');
    console.log(`\n✅ Done! Programme slug: ${progSlug}`);
    console.log(`   View at: http://localhost:3002/programmes/${progSlug}\n`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error — transaction rolled back:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
