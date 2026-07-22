"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapePartnersAdmin() {
  return (
    <ShapeAdminCrud
      title="Partners"
      subtitle="Manage SHAPE consortium institutions"
      resource="partners"
      columns={[
        { key: "logo_url", label: "Logo" },
        { key: "name", label: "Name" },
        { key: "short_name", label: "Short" },
        { key: "country", label: "Country" },
        { key: "region", label: "Region" },
        { key: "is_published", label: "Published" },
      ]}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "short_name", label: "Short name" },
        { key: "country", label: "Country", required: true },
        { key: "city", label: "City" },
        {
          key: "region",
          label: "Region",
          type: "select",
          options: ["east_africa", "europe"],
        },
        { key: "logo_url", label: "Logo", type: "image" },
        { key: "website_url", label: "Website URL" },
        { key: "consortium_role", label: "Consortium role" },
        { key: "description", label: "Institution description", type: "textarea" },
        { key: "contact_person", label: "Contact person" },
        { key: "contact_email", label: "Contact email" },
        { key: "contact_role", label: "Contact role" },
        { key: "responsibilities", label: "SHAPE responsibilities", type: "textarea" },
        { key: "deliverables", label: "Deliverables", type: "textarea" },
        { key: "latitude", label: "Latitude", type: "number" },
        { key: "longitude", label: "Longitude", type: "number" },
        { key: "sort_order", label: "Sort order", type: "number" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{
        name: "",
        slug: "",
        country: "",
        region: "east_africa",
        sort_order: 0,
        is_published: true,
      }}
    />
  );
}
