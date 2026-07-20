export interface TechnicalSupportCategoryGroup {
  name: string;
  subcategories: string[];
}

/**
 * Student ICT Technical Support — original student-specific issues only.
 * OUK is fully virtual; students do not use campus Wi-Fi/devices/hardware menus.
 * Staff catalogue (screenshot groups) stays separate below.
 */
export const ICT_STUDENT_CATEGORY_GROUPS: TechnicalSupportCategoryGroup[] = [
  {
    name: 'Registration & Enrolment',
    subcategories: ['Course registration', 'Session registration'],
  },
  {
    name: 'Academic Records & Results',
    subcategories: [
      'Exam results',
      'Transcript download',
      'Exemption / credit transfers',
    ],
  },
  {
    name: 'Account & Email Access',
    subcategories: ['Email activation'],
  },
  {
    name: 'SOMAS & Student Billing',
    subcategories: ['Blank SOMAS', 'Double billing of courses'],
  },
  {
    name: 'Other Technical Enquiry',
    subcategories: ['General ICT support request'],
  },
];

/** Staff ICT catalogue — screenshot groups + staff system workflows. */
export const ICT_STAFF_CATEGORY_GROUPS: TechnicalSupportCategoryGroup[] = [
  {
    name: 'Account & Password',
    subcategories: [
      'Password reset',
      'Account lockout',
      'Profile update',
      'Multi-factor authentication',
    ],
  },
  {
    name: 'Portal Access',
    subcategories: ['Staff portal login', 'Admin module access'],
  },
  {
    name: 'Email & Workspace',
    subcategories: [
      'Email & Microsoft 365',
      'Shared mailbox',
      'Distribution lists',
    ],
  },
  {
    name: 'Wi-Fi & Network',
    subcategories: [
      'Cannot join campus Wi-Fi',
      'Office network',
      'VPN / remote access',
    ],
  },
  {
    name: 'Devices & Hardware',
    subcategories: ['Laptop / desktop', 'Printer / scanner', 'Peripheral'],
  },
  {
    name: 'Software & Licensing',
    subcategories: ['Licensed software', 'Installation', 'Updates'],
  },
  {
    name: 'Identity & Access',
    subcategories: [
      'Login issues',
      'Role / permission request',
      'SSO problems',
    ],
  },
  {
    name: 'Student Records Systems',
    subcategories: [
      'SOMAS / registry',
      'Transcripts & results',
      'Registration workflows',
    ],
  },
  {
    name: 'Finance & Billing (Systems)',
    subcategories: [
      'Fee reconciliation',
      'M-Pesa integration',
      'Billing discrepancies',
    ],
  },
  {
    name: 'Learning Platforms',
    subcategories: ['LMS / Moodle', 'OUK mobile app', 'Online exams'],
  },
  {
    name: 'Other Technical Enquiry',
    subcategories: ['General ICT support request'],
  },
];

export function getCategoryGroupsForRole(
  role?: string,
): TechnicalSupportCategoryGroup[] {
  const normalized = (role || 'student').toLowerCase();
  // Faculty shares the staff ICT catalogue (OUK APP has no separate faculty menu).
  if (normalized === 'staff' || normalized === 'faculty') {
    return ICT_STAFF_CATEGORY_GROUPS;
  }
  return ICT_STUDENT_CATEGORY_GROUPS;
}
