"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeActivitiesAdmin() {
  return (
    <ShapeAdminCrud
      title="Activities"
      subtitle="Workplan timeline rows"
      resource="activities"
      columns={[
        { key: "title", label: "Activity" },
        { key: "start_date", label: "Start" },
        { key: "end_date", label: "End" },
        { key: "status", label: "Status" },
        { key: "progress_percent", label: "Progress %" },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "title_sw", label: "Title (Kiswahili)" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "description_sw", label: "Description (Kiswahili)", type: "textarea" },
        { key: "work_package_id", label: "Work package", type: "work_package" },
        { key: "start_date", label: "Start date (YYYY-MM-DD)", required: true },
        { key: "end_date", label: "End date (YYYY-MM-DD)", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["completed", "in_progress", "planned", "delayed"],
        },
        { key: "progress_percent", label: "Progress %", type: "number" },
        { key: "sort_order", label: "Sort order", type: "number" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{
        title: "",
        start_date: "",
        end_date: "",
        status: "planned",
        progress_percent: 0,
        sort_order: 0,
        is_published: false,
      }}
    />
  );
}
