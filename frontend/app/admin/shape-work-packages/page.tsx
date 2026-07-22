"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeWorkPackagesAdmin() {
  return (
    <ShapeAdminCrud
      title="Work Packages"
      subtitle="WP codes, leaders, and progress"
      resource="work-packages"
      columns={[
        { key: "code", label: "Code" },
        { key: "title", label: "Title" },
        { key: "progress_percent", label: "Progress %" },
        { key: "status", label: "Status" },
        { key: "is_published", label: "Published" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "title", label: "Title", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "objectives", label: "Objectives", type: "textarea" },
        { key: "leader_partner_id", label: "Leader partner ID (UUID)" },
        { key: "start_date", label: "Start date (YYYY-MM-DD)" },
        { key: "end_date", label: "End date (YYYY-MM-DD)" },
        { key: "progress_percent", label: "Progress %", type: "number" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["not_started", "in_progress", "completed", "at_risk"],
        },
        { key: "milestones", label: "Milestones (JSON array or lines: Title | due | status)", type: "textarea" },
        { key: "deliverables", label: "Deliverables (lines: Title | status  OR  semicolon list)", type: "textarea" },
        { key: "sort_order", label: "Sort order", type: "number" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{
        code: "WP",
        slug: "",
        title: "",
        progress_percent: 0,
        status: "not_started",
        sort_order: 0,
        is_published: true,
      }}
    />
  );
}
