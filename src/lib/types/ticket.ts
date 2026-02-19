export type TicketStatus = 'todo' | 'in_progress' | 'done';

export interface Ticket {
	id: string;
	title: string;
	description: string | null;
	status: TicketStatus;
	created_at: string;
	updated_at: string;
}

export interface CreateTicketInput {
	title: string;
	description?: string;
}
