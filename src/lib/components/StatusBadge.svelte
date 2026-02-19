<script lang="ts">
	import type { TicketStatus } from '$lib/types/ticket';

	export let status: TicketStatus;

	const statusConfig: Record<
		TicketStatus,
		{ label: string; className: string }
	> = {
		todo: { label: 'To Do', className: 'badge-todo' },
		in_progress: { label: 'In Progress', className: 'badge-in-progress' },
		done: { label: 'Done', className: 'badge-done' }
	};

	const config = statusConfig[status];
</script>

<span class="badge {config.className}">
	{config.label}
</span>

<style>
	.badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.badge-todo {
		background-color: #e3e8ef;
		color: #4a5568;
	}

	.badge-in-progress {
		background-color: #3b82f6;
		color: white;
	}

	.badge-done {
		background-color: #10b981;
		color: white;
	}
</style>
