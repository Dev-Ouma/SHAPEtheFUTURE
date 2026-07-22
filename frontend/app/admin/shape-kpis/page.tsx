"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeKpisAdmin() {
  return (
    <ShapeAdminCrud
      title="KPIs"
      subtitle="Grant progress indicators"
      resource="kpis"
      columns={[
        { key: "label", label: "Label" },
        { key: "key", label: "Key" },
        { key: "value", label: "Value" },
        { key: "unit", label: "Unit" },
        { key: "category", label: "Category" },
      ]}
      fields={[
        { key: "key", label: "Key", required: true },
        { key: "label", label: "Label", required: true },
        { key: "value", label: "Value", required: true },
        { key: "target", label: "Target" },
        { key: "unit", label: "Unit" },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["overview", "engagement", "outputs", "budget"],
        },
        { key: "icon", label: "Icon key" },
        { key: "sort_order", label: "Sort order", type: "number" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{
        key: "",
        label: "",
        value: "",
        category: "overview",
        sort_order: 0,
        is_published: false,
      }}
    />
  );
}
