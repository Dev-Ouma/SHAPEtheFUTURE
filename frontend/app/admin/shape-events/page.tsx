"use client";

import ShapeAdminCrud from "@/components/admin/ShapeAdminCrud";

export default function ShapeEventsAdmin() {
  return (
    <ShapeAdminCrud
      title="Events"
      subtitle="Meetings, workshops, and consortium gatherings"
      resource="events"
      columns={[
        { key: "title", label: "Title" },
        { key: "event_date", label: "Date" },
        { key: "country", label: "Country" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "event_date", label: "Event date (YYYY-MM-DD)", required: true },
        { key: "end_date", label: "End date (YYYY-MM-DD)" },
        { key: "venue", label: "Venue" },
        { key: "country", label: "Country" },
        { key: "host_partner_id", label: "Host partner ID (UUID)" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["planned", "ongoing", "completed", "cancelled"],
        },
        { key: "agenda", label: "Agenda", type: "textarea" },
        { key: "outcomes", label: "Outcomes", type: "textarea" },
        { key: "minutes_url", label: "Minutes URL" },
        { key: "presentations_url", label: "Presentations URL" },
        { key: "attendance_notes", label: "Attendance notes", type: "textarea" },
        { key: "work_package_id", label: "Work package ID (UUID)" },
        {
          key: "is_published",
          label: "Published",
          type: "select",
          options: ["true", "false"],
        },
      ]}
      emptyItem={{ title: "", slug: "", event_date: "", status: "planned", is_published: true }}
    />
  );
}
