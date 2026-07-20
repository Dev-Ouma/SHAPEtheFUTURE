"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeContactAdmin() {
  return (
    <ShapeAdminCrud
      title="Contact Inbox"
      subtitle="Messages submitted via the public contact form"
      resource="contact"
      readOnlyCreate
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "organization", label: "Organisation" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Received" },
      ]}
      fields={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "organization", label: "Organisation" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message", type: "textarea" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["new", "read", "replied"],
        },
      ]}
      emptyItem={{}}
    />
  );
}
