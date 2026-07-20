/** Shared status workflow for campus feedback and technical support tickets. */
export enum FeedbackStatus {
  SUBMITTED = 'Submitted',
  ACKNOWLEDGED = 'Acknowledged',
  UNDER_REVIEW = 'Under Review',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  REJECTED = 'Rejected',
  ESCALATED = 'Escalated',
}

/** Shared priority levels. */
export enum FeedbackPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export const TERMINAL_STATUSES = ['Resolved', 'Closed', 'Rejected'];

export const OPEN_STATUSES = [
  FeedbackStatus.SUBMITTED,
  FeedbackStatus.ACKNOWLEDGED,
  FeedbackStatus.UNDER_REVIEW,
  FeedbackStatus.IN_PROGRESS,
  FeedbackStatus.ESCALATED,
];
