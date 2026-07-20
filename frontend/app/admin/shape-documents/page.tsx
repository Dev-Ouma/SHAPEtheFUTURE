"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

const DOC_CATEGORIES = [
  "deliverables",
  "reports",
  "minutes",
  "financial",
  "presentations",
  "policy_briefs",
  "publications",
  "templates",
  "other",
];

export default function ShapeDocumentsAdmin() {
  return (
    <ShapeAdminCrud
      title="Documents"
      subtitle="Repository of deliverables and project files"
      resource="documents"
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "file_type", label: "Type" },
        { key: "is_published", label: "Published" },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "Slug", required: true },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: DOC_CATEGORIES,
        },
        { key: "description", label: "Description", type: "textarea" },
        { key: "file_url", label: "File URL" },
        { key: "file_type", label: "File type" },
        { key: "work_package_id", label: "Work package ID (UUID)" },
        { key: "partner_id", label: "Partner ID (UUID)" },
        {
          key: "is_public",
          label: "Public",
          type: "select",
          options: ["true", "false"],
        },
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
        category: "reports",
        is_public: true,
        is_published: true,
      }}
    />
  );
}
