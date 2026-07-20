/**
 * Offline fallback for ICT raise/log forms.
 * Live source of truth: GET /api/technical-support/categories (backend).
 * Keep in sync with:
 *   - backend/src/technical-support/technical-support-categories.ts
 *   - OUK-APP/lib/data/technical_support_categories.dart
 * Verify: npm run check:catalogue
 */

export type TechnicalSupportCategoryGroup = {
  name: string;
  subcategories: string[];
};

/** Student ICT — virtual-university academic/system issues only. */
export const ICT_STUDENT_CATEGORY_GROUPS: TechnicalSupportCategoryGroup[] = [
  {
    name: "Registration & Enrolment",
    subcategories: ["Course registration", "Session registration"],
  },
  {
    name: "Academic Records & Results",
    subcategories: [
      "Exam results",
      "Transcript download",
      "Exemption / credit transfers",
    ],
  },
  {
    name: "Account & Email Access",
    subcategories: ["Email activation"],
  },
  {
    name: "SOMAS & Student Billing",
    subcategories: ["Blank SOMAS", "Double billing of courses"],
  },
  {
    name: "Other Technical Enquiry",
    subcategories: ["General ICT support request"],
  },
];

/** Staff ICT catalogue — same groups as the OUK APP staff flow. */
export const ICT_STAFF_CATEGORY_GROUPS: TechnicalSupportCategoryGroup[] = [
  {
    name: "Account & Password",
    subcategories: [
      "Password reset",
      "Account lockout",
      "Profile update",
      "Multi-factor authentication",
    ],
  },
  {
    name: "Portal Access",
    subcategories: ["Staff portal login", "Admin module access"],
  },
  {
    name: "Email & Workspace",
    subcategories: [
      "Email & Microsoft 365",
      "Shared mailbox",
      "Distribution lists",
    ],
  },
  {
    name: "Wi-Fi & Network",
    subcategories: [
      "Cannot join campus Wi-Fi",
      "Office network",
      "VPN / remote access",
    ],
  },
  {
    name: "Devices & Hardware",
    subcategories: ["Laptop / desktop", "Printer / scanner", "Peripheral"],
  },
  {
    name: "Software & Licensing",
    subcategories: ["Licensed software", "Installation", "Updates"],
  },
  {
    name: "Identity & Access",
    subcategories: [
      "Login issues",
      "Role / permission request",
      "SSO problems",
    ],
  },
  {
    name: "Student Records Systems",
    subcategories: [
      "SOMAS / registry",
      "Transcripts & results",
      "Registration workflows",
    ],
  },
  {
    name: "Finance & Billing (Systems)",
    subcategories: [
      "Fee reconciliation",
      "M-Pesa integration",
      "Billing discrepancies",
    ],
  },
  {
    name: "Learning Platforms",
    subcategories: ["LMS / Moodle", "OUK mobile app", "Online exams"],
  },
  {
    name: "Other Technical Enquiry",
    subcategories: ["General ICT support request"],
  },
];

/**
 * Faculty has no separate catalogue in the OUK APP; they share the staff ICT menu.
 * "Other" is free-text in the admin Log Ticket form (not a fixed group list).
 */
export function technicalSupportCategoriesForRequesterType(
  requesterType: string,
): TechnicalSupportCategoryGroup[] | null {
  switch (requesterType) {
    case "Student":
      return ICT_STUDENT_CATEGORY_GROUPS;
    case "Staff":
    case "Faculty":
      return ICT_STAFF_CATEGORY_GROUPS;
    case "Other":
      return null;
    default:
      return ICT_STUDENT_CATEGORY_GROUPS;
  }
}

export const ICT_SUPPORT_CATEGORY_SLUG = "ict-support";
