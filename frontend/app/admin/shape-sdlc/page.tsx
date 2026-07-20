"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeSdlcAdmin() {
  return (
    <ShapeAdminCrud
      title="SDLC Stages"
      subtitle="Project development cycle stages"
      resource="sdlc"
      columns={[
        { key: "sort_order", label: "Order" },
        { key: "title", label: "Stage" },
        { key: "status", label: "Status" },
        { key: "progress_percent", label: "Progress %" },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "sort_order", label: "Sort order", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "objectives", label: "Objectives", type: "textarea" },
        { key: "outputs", label: "Outputs", type: "textarea" },
        { key: "evidence", label: "Evidence", type: "textarea" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["not_started", "in_progress", "completed", "at_risk"],
        },
        { key: "progress_percent", label: "Progress %", type: "number" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{
        title: "",
        slug: "",
        sort_order: 0,
        status: "not_started",
        progress_percent: 0,
        is_published: true,
      }}
    />
  );
}
