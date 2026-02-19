<script lang="ts">
	import type { Ticket } from '$lib/types/ticket';
	import TicketCard from './TicketCard.svelte';

	export let tickets: Ticket[] = [];
	export let showStatusDropdown = false;
	export let onStatusChange: ((ticketId: string, newStatus: string) => void) | undefined =
		undefined;
	export let loading = false;
</script>

<div class="ticket-list">
	{#if loading}
		<div class="loading">Loading tickets...</div>
	{:else if tickets.length === 0}
		<div class="empty-state">
			<p>No tickets yet.</p>
		</div>
	{:else}
		{#each tickets as ticket (ticket.id)}
			<TicketCard {ticket} {showStatusDropdown} {onStatusChange} />
		{/each}
	{/if}
</div>

<style>
	.ticket-list {
		max-width: 800px;
		margin: 0 auto;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 40px;
		color: #6b7280;
	}

	.empty-state p {
		margin: 0;
		font-size: 1.1rem;
	}
</style>
