/**
 * Idempotent copy of campus_feedback (+ responses) into ict_tickets.
 * Safe to run multiple times. Use when TypeORM migration:run is blocked by older migrations.
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/migrate-feedback-to-ict.ts
 */
import { AppDataSource } from '../data-source';

async function main() {
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();

  const hasFeedback = await qr.hasTable('campus_feedback');
  if (!hasFeedback) {
    console.log('campus_feedback table absent — nothing to migrate.');
    await qr.release();
    await AppDataSource.destroy();
    return;
  }

  const before = await qr.query(`SELECT COUNT(*)::int AS c FROM ict_tickets`);
  console.log(`ict_tickets before: ${before[0]?.c ?? 0}`);

  await qr.query(`
    INSERT INTO "ict_tickets" (
      "id", "reference_number", "requester_id", "requester_name", "requester_email",
      "requester_type", "requester_phone", "identification_number", "is_anonymous",
      "consent_given", "feedback_type", "sentiment", "category_id", "department_id",
      "subcategory", "subject", "description", "location", "incident_date",
      "attachment_urls", "status", "priority", "tags", "keywords",
      "ai_confidence_score", "is_escalated", "escalation_reason", "assigned_to_id",
      "resolution", "resolved_at", "sla_due_date", "created_at", "updated_at"
    )
    SELECT
      cf."id", cf."reference_number", cf."submitter_user_id", cf."full_name", cf."email",
      CASE cf."submitter_type"::text WHEN 'Student' THEN 'Student' WHEN 'Staff' THEN 'Staff' ELSE 'Other' END::"public"."ict_tickets_requester_type_enum",
      cf."phone_number", cf."identification_number", COALESCE(cf."is_anonymous", false), COALESCE(cf."consent_given", false),
      CASE cf."feedback_type"::text WHEN 'compliment' THEN 'compliment' WHEN 'complaint' THEN 'complaint' ELSE 'service_request' END::"public"."ict_tickets_feedback_type_enum",
      CASE WHEN cf."sentiment" IS NULL THEN NULL ELSE cf."sentiment"::text::"public"."ict_tickets_sentiment_enum" END,
      ic."id", cf."department_id", cf."sub_category", cf."subject", cf."description", cf."location", cf."incident_date",
      COALESCE(cf."attachment_urls", '[]'::jsonb),
      CASE cf."status"::text WHEN 'Submitted' THEN 'Open' WHEN 'Acknowledged' THEN 'Acknowledged' WHEN 'Under Review' THEN 'In Progress' WHEN 'In Progress' THEN 'In Progress' WHEN 'Resolved' THEN 'Resolved' WHEN 'Closed' THEN 'Closed' WHEN 'Rejected' THEN 'Cancelled' WHEN 'Escalated' THEN 'In Progress' ELSE 'Open' END::"public"."ict_tickets_status_enum",
      COALESCE(cf."priority"::text, 'Medium')::"public"."ict_tickets_priority_enum",
      COALESCE(cf."tags", '[]'::jsonb), COALESCE(cf."keywords", '[]'::jsonb), cf."ai_confidence_score",
      COALESCE(cf."is_escalated", false) OR (cf."status"::text = 'Escalated'), cf."escalation_reason", cf."assigned_to_id",
      cf."resolution", cf."resolved_at", cf."sla_due_date", cf."created_at", cf."updated_at"
    FROM "campus_feedback" cf
    LEFT JOIN "campus_feedback_categories" cfc ON cfc."id" = cf."category_id"
    LEFT JOIN "ict_categories" ic ON ic."slug" = cfc."slug"
    WHERE NOT EXISTS (SELECT 1 FROM "ict_tickets" t WHERE t."reference_number" = cf."reference_number")
  `);

  if (await qr.hasTable('campus_feedback_responses')) {
    await qr.query(`
      INSERT INTO "ict_ticket_responses" ("id", "ticket_id", "message", "responded_by_id", "is_internal", "created_at")
      SELECT r."id", r."feedback_id", r."message", r."responded_by_id", COALESCE(r."is_internal", false), r."created_at"
      FROM "campus_feedback_responses" r
      WHERE EXISTS (SELECT 1 FROM "ict_tickets" t WHERE t."id" = r."feedback_id")
        AND NOT EXISTS (SELECT 1 FROM "ict_ticket_responses" ir WHERE ir."id" = r."id")
    `);
  }

  const after = await qr.query(`SELECT COUNT(*)::int AS c FROM ict_tickets`);
  console.log(`ict_tickets after: ${after[0]?.c ?? 0}`);
  console.log('Feedback migration complete.');

  await qr.release();
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
