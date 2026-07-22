"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeRisksAdmin() {
  return (
    <ShapeAdminCrud
      title="Risks"
      subtitle="Monitoring & evaluation risk register"
      resource="risks"
      columns={[
        { key: "title", label: "Risk" },
        { key: "likelihood", label: "Likelihood" },
        { key: "impact", label: "Impact" },
        { key: "status", label: "Status" },
        { key: "owner", label: "Owner" },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "description", label: "Description", type: "textarea" },
        {
          key: "likelihood",
          label: "Likelihood",
          type: "select",
          options: ["low", "medium", "high"],
        },
        {
          key: "impact",
          label: "Impact",
          type: "select",
          options: ["low", "medium", "high"],
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["open", "mitigating", "closed"],
        },
        { key: "mitigation", label: "Mitigation", type: "textarea" },
        { key: "owner", label: "Owner" },
        { key: "category", label: "Category" },
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
        status: "open",
        likelihood: "medium",
        impact: "medium",
        sort_order: 0,
        is_published: false,
      }}
    />
  );
}
