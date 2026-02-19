export type TicketStatus = 'todo' | 'in_progress' | 'done';

export interface Ticket {
	id: string;
	title: string;
	description: string | null;
	status: TicketStatus;
	created_at: string;
	updated_at: string;
	session_id?: string;
	user_name?: string;
}

export interface CreateTicketInput {
	title: string;
	description?: string;
	session_id: string;
	user_name: string;
}

export interface Message {
	id: string;
	ticket_id: string;
	sender_role: 'user' | 'admin';
	content: string;
	created_at: string;
}

export type MessageInput = Pick<Message, 'ticket_id' | 'sender_role' | 'content'>;
