/**
 * Shared overdue / SLA messaging for Service Desk surfaces.
 * Keep wording consistent across queue, detail, and analytics views.
 */
export const OVERDUE_TICKET_TITLE = "Overdue Ticket";
export const OVERDUE_TICKETS_TITLE = "Overdue Tickets";

export const OVERDUE_TICKET_MESSAGE =
  "This ticket has exceeded the target resolution time. Immediate attention required.";

export const OVERDUE_TICKETS_MESSAGE =
  "These tickets have exceeded the target resolution time. Immediate attention required.";

/** Short label for filters, badges, and metric cards. */
export const OVERDUE_LABEL = "Overdue";

/** Ticket due-date column / SLA target — plain language for agents. */
export const DUE_BY_LABEL = "Due by";

/** CTA on overdue banners — aligns with “Immediate attention required.” */
export const OVERDUE_CTA = "Attend Now";

export function overdueBannerCopy(count = 1): { title: string; message: string } {
  if (count === 1) {
    return { title: OVERDUE_TICKET_TITLE, message: OVERDUE_TICKET_MESSAGE };
  }
  return { title: OVERDUE_TICKETS_TITLE, message: OVERDUE_TICKETS_MESSAGE };
}
