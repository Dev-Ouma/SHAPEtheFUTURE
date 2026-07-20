import { Repository } from 'typeorm';
import { IctCategory } from '../../ict/entities/ict-category.entity';

/**
 * Enterprise Helpdesk + ICT category catalogue.
 * Idempotent upsert by slug (insert or refresh name/description/subcategories/flags).
 *
 * HelpDesk = is_infrastructure OR HELPDESK_ONLY_SLUGS (see ict-service-group.ts).
 * IT Technical Support = ict-support (+ any future non-helpdesk slugs).
 *
 * Keep in sync with:
 * - campus-feedback-seed.ts (Helpdesk subset)
 * - frontend CampusFeedbackForm PUBLIC_CATEGORIES
 * - OUK-APP campus_feedback_categories.dart
 */
const MERGED_CATEGORIES = [
  {
    name: 'Campus Facilities & Infrastructure',
    slug: 'buildings-maintenance',
    description:
      'Structural issues, doors, lifts, lighting, leaks, and building fabric',
    is_infrastructure: true,
    subcategories: [
      'Leaks & water damage',
      'Doors & locks',
      'Lifts & elevators',
      'Lighting',
      'Structural damage',
      'Furniture & fittings',
    ],
  },
  {
    name: 'Utilities & Services',
    slug: 'utilities',
    description:
      'Electricity, water, sanitation HVAC, and building connectivity as a facility issue',
    is_infrastructure: true,
    subcategories: [
      'Power outage',
      'Water supply',
      'Sanitation',
      'Air conditioning',
      'Heating',
      'Building Wi-Fi (facility)',
    ],
  },
  {
    name: 'Cleanliness & Sanitation',
    slug: 'cleanliness-sanitation',
    description: 'Restrooms, waste management, pest control, landscaping',
    is_infrastructure: true,
    subcategories: [
      'Restrooms',
      'Waste & bins',
      'Pest control',
      'Landscaping',
      'Cleaning services',
    ],
  },
  {
    name: 'Transport & Parking',
    slug: 'transport-parking',
    description: 'Campus transport, parking allocation, road conditions',
    is_infrastructure: true,
    subcategories: [
      'Parking',
      'Shuttle/bus',
      'Road conditions',
      'Traffic management',
    ],
  },
  {
    name: 'Security & Safety',
    slug: 'security-access',
    description:
      'Gates, badges, CCTV, parking security, lighting, and campus safety',
    is_infrastructure: true,
    subcategories: [
      'Gate access',
      'ID badges',
      'CCTV',
      'Parking security',
      'After-hours access',
      'Safety incident',
    ],
  },
  {
    name: 'Construction & Planning',
    slug: 'construction-planning',
    description: 'Ongoing works, noise, dust, space planning requests',
    is_infrastructure: true,
    subcategories: [
      'Construction noise',
      'Dust & disruption',
      'Space allocation',
      'Room booking',
      'New facility requests',
    ],
  },
  {
    name: 'Campus Environment',
    slug: 'campus-environment',
    description:
      'General campus experience, accessibility, outdoor areas, signage',
    is_infrastructure: true,
    subcategories: [
      'Accessibility',
      'Outdoor areas',
      'Signage',
      'Noise levels',
      'General ambiance',
    ],
  },
  {
    name: 'General Student Services',
    slug: 'student-services',
    description: 'Lost & found and general student desk services',
    is_infrastructure: false,
    subcategories: ['Lost & found', 'General student desk'],
  },
  {
    name: 'Library & Physical Resources',
    slug: 'library-physical-resources',
    description: 'Physical library spaces, study rooms, and on-site resources',
    is_infrastructure: false,
    subcategories: [
      'Study spaces',
      'Physical collections',
      'Library facilities',
      'Printing & scanning',
    ],
  },
  {
    name: 'Health & Wellness Services',
    slug: 'health-wellness',
    description: 'Campus health, wellness, and related support services',
    is_infrastructure: false,
    subcategories: [
      'Clinic / first aid',
      'Wellness programmes',
      'Accessibility support',
    ],
  },
  {
    name: 'Finance & Payments (Desk)',
    slug: 'finance-payments-desk',
    description: 'General fee desk issues — not SOMAS or system billing bugs',
    is_infrastructure: false,
    subcategories: [
      'Fee enquiries (desk)',
      'Receipts & clearance',
      'Payment advice (non-system)',
    ],
  },
  {
    name: 'ICT & Technical Support',
    slug: 'ict-support',
    description:
      'Accounts, portals, email, Wi-Fi login, devices, software, and academic systems (SOMAS, registration, results)',
    is_infrastructure: false,
    // Flat labels for DB-backed pickers. Staff hierarchy groups (Portal Access, etc.)
    // mirror technical-support-categories.ts; student-style leaves remain for desk intake.
    subcategories: [
      'Account & Password',
      'Portal Access',
      'Email & Workspace',
      'Wi-Fi & Network',
      'Devices & Hardware',
      'Software & Licensing',
      'Identity & Access',
      'Student Records Systems',
      'Finance & Billing (Systems)',
      'Learning Platforms',
      'Other Technical Enquiry',
      'Course & Session Registration',
      'Exam Results & Transcript Download',
      'Exemption / Credit Transfer',
      'Blank SOMAS',
      'Double Billing of Courses',
      'Student Portal Issues',
      'SOMAS / Registry system errors',
      'Registration portal glitches',
      'Result/Transcript system errors',
    ],
  },
  {
    name: 'General Inquiry',
    slug: 'general-inquiry',
    description: 'Other campus feedback not covered above',
    is_infrastructure: false,
    subcategories: [],
  },
];

export const runIctCategorySeed = async (
  categoryRepo: Repository<IctCategory>,
) => {
  for (const cat of MERGED_CATEGORIES) {
    const exists = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(cat));
      console.log(`Seeded ICT Service Desk Category: ${cat.name}`);
    } else {
      exists.name = cat.name;
      exists.description = cat.description;
      exists.is_infrastructure = cat.is_infrastructure;
      exists.subcategories = cat.subcategories;
      exists.is_active = true;
      await categoryRepo.save(exists);
    }
  }

  // Retire categories removed from the public taxonomy (keep historical tickets intact).
  const retired = await categoryRepo.find({
    where: { slug: 'accommodation-hostels', is_active: true },
  });
  for (const cat of retired) {
    cat.is_active = false;
    await categoryRepo.save(cat);
    console.log(`Deactivated ICT Service Desk Category: ${cat.name}`);
  }
};
