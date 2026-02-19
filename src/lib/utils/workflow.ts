import type { TicketStatus } from '$lib/types/ticket';

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

const VALID_STATUSES: TicketStatus[] = ['todo', 'in_progress', 'done'];

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
	todo: ['in_progress'],
	in_progress: ['todo', 'done'],
	done: []
};

export function validateStatusTransition(
	currentStatus: TicketStatus,
	newStatus: TicketStatus
): ValidationResult {
	if (!VALID_STATUSES.includes(newStatus)) {
		return {
			valid: false,
			error: 'Invalid status value'
		};
	}

	if (currentStatus === newStatus) {
		return {
			valid: false,
			error: 'Status cannot transition to itself'
		};
	}

	const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus];

	if (!allowedTransitions.includes(newStatus)) {
		return {
			valid: false,
			error: `Cannot transition from ${currentStatus} to ${newStatus}`
		};
	}

	return { valid: true };
}
