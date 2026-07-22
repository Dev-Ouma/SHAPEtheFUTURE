"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapePressAdmin() {
  return (
    <ShapeAdminCrud
      title="Press & media"
      subtitle="External press coverage listed on /media"
      resource="press"
      columns={[
        { key: "title", label: "Title" },
        { key: "source", label: "Source" },
        { key: "date", label: "Date" },
        { key: "is_published", label: "Published" },
      ]}
      fields={[
        { key: "title", label: "Title (EN)", required: true },
        { key: "title_sw", label: "Title (Kiswahili)" },
        { key: "source", label: "Source (EN)", required: true },
        { key: "source_sw", label: "Source (Kiswahili)" },
        { key: "url", label: "Article URL", required: true },
        { key: "date", label: "Date label (e.g. 2025)" },
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
        source: "",
        url: "",
        sort_order: 0,
        is_published: true,
      }}
    />
  );
}
