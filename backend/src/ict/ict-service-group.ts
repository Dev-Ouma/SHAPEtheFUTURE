import { IctCategory } from './entities/ict-category.entity';
import {
  IctServiceGroup,
  IctSubmissionSource,
} from './entities/ict-ticket.entity';

/**
 * Non-infrastructure HelpDesk categories (campus experience / desk services).
 * Infrastructure categories use `is_infrastructure = true` instead.
 */
export const HELPDESK_ONLY_SLUGS = new Set([
  'student-services',
  'library-physical-resources',
  'health-wellness',
  'finance-payments-desk',
  'general-inquiry',
]);

export const isHelpDeskCategory = (cat?: IctCategory | null): boolean =>
  !!cat && (cat.is_infrastructure || HELPDESK_ONLY_SLUGS.has(cat.slug));

export const resolveServiceGroup = (
  cat?: IctCategory | null,
): IctServiceGroup =>
  isHelpDeskCategory(cat)
    ? IctServiceGroup.HELPDESK
    : IctServiceGroup.IT_TECHNICAL_SUPPORT;

export const parseServiceGroupQuery = (
  value?: string,
): IctServiceGroup | undefined => {
  if (!value) return undefined;
  const v = value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
  if (
    v === 'helpdesk' ||
    v === 'help_desk' ||
    v === 'infrastructure' ||
    v === 'general_helpdesk' ||
    v === 'campus_feedback'
  ) {
    return IctServiceGroup.HELPDESK;
  }
  if (
    v === 'it' ||
    v === 'it_technical_support' ||
    v === 'technical_support' ||
    v === 'ict' ||
    v === 'ict_technical_support'
  ) {
    return IctServiceGroup.IT_TECHNICAL_SUPPORT;
  }
  return undefined;
};

/**
 * Public General Helpdesk intake (website / campus feedback).
 * Never defaults a missing category into the ICT Technical Support lane.
 */
export const resolveHelpdeskIntakeLane = (
  category?: IctCategory | null,
  serviceGroupHint?: string,
): IctServiceGroup => {
  const hinted = parseServiceGroupQuery(serviceGroupHint);
  if (
    hinted === IctServiceGroup.HELPDESK ||
    isHelpDeskCategory(category) ||
    !category
  ) {
    return IctServiceGroup.HELPDESK;
  }
  // Public helpdesk channel must not route into ICT even if a non-helpdesk category slipped through.
  return IctServiceGroup.HELPDESK;
};

export const serviceGroupLabel = (group: IctServiceGroup): string =>
  group === IctServiceGroup.HELPDESK ? 'HelpDesk' : 'ICT Technical Support';

const SUBMISSION_SOURCES = new Set<string>(Object.values(IctSubmissionSource));

export const parseSubmissionSource = (
  value?: string | null,
): IctSubmissionSource => {
  if (!value) return IctSubmissionSource.UNKNOWN;
  const v = value.toLowerCase().trim();
  if (v === 'mobile' || v === 'app' || v === 'ouk_app')
    return IctSubmissionSource.MOBILE_APP;
  if (SUBMISSION_SOURCES.has(v)) return v as IctSubmissionSource;
  return IctSubmissionSource.UNKNOWN;
};

export const submissionSourceLabel = (
  source?: IctSubmissionSource | string | null,
): string => {
  switch (source) {
    case IctSubmissionSource.WEBSITE:
    case 'website':
      return 'Website';
    case IctSubmissionSource.MOBILE_APP:
    case 'mobile_app':
      return 'OUK APP';
    case IctSubmissionSource.ADMIN:
    case 'admin':
      return 'Admin';
    case IctSubmissionSource.EMAIL:
    case 'email':
      return 'Email';
    default:
      return 'Unknown';
  }
};

export const requesterTypeLabel = (
  type?: string | null,
  isAnonymous?: boolean,
): string => {
  if (isAnonymous) return 'Guest (anonymous)';
  if (!type) return 'Guest';
  if (type === 'Other' || type === 'External') return 'Guest';
  return type;
};
