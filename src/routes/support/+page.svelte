<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import TicketForm from '$lib/components/TicketForm.svelte';
	import TicketList from '$lib/components/TicketList.svelte';
	import { supabase } from '$lib/services/supabase';
	import type { Ticket, CreateTicketInput } from '$lib/types/ticket';

	let tickets: Ticket[] = [];
	let loading = true;
	let message = '';
	let messageType: 'success' | 'error' | '' = '';

	onMount(() => {
		loadTickets();
	});

	async function loadTickets() {
		loading = true;
		const { data, error } = await supabase
			.from('tickets')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			showMessage('Failed to load tickets', 'error');
			console.error('Error loading tickets:', error);
		} else {
			tickets = data || [];
		}

		loading = false;
	}

	async function handleSubmit(event: CustomEvent<CreateTicketInput>) {
		const { title, description } = event.detail;

		const { data, error } = await supabase
			.from('tickets')
			.insert([
				{
					title,
					description: description || null,
					status: 'todo'
				}
			])
			.select()
			.single();

		if (error) {
			showMessage('Failed to create ticket', 'error');
			console.error('Error creating ticket:', error);
		} else {
			showMessage('Ticket created successfully!', 'success');
			await loadTickets();
		}
	}

	function showMessage(text: string, type: 'success' | 'error') {
		message = text;
		messageType = type;
		setTimeout(() => {
			message = '';
			messageType = '';
		}, 3000);
	}
</script>

<svelte:head>
	<title>Support - Submit a Ticket</title>
</svelte:head>

<Header currentPage="support" />

<main class="container">
	<section class="form-section">
		<h1>Submit a Support Ticket</h1>
		<p class="description">Having an issue? Let us know and we'll get back to you soon.</p>

		{#if message}
			<div class="message {messageType}">
				{message}
			</div>
		{/if}

		<TicketForm on:submit={handleSubmit} />
	</section>

	<section class="tickets-section">
		<h2>All Tickets</h2>
		<TicketList {tickets} {loading} />
	</section>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px 60px;
	}

	.form-section {
		margin-bottom: 60px;
	}

	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 12px;
		color: #111827;
	}

	.description {
		text-align: center;
		font-size: 1.1rem;
		color: #6b7280;
		margin-bottom: 32px;
	}

	.message {
		max-width: 500px;
		margin: 0 auto 24px;
		padding: 12px 20px;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
	}

	.message.success {
		background-color: #d1fae5;
		color: #065f46;
		border: 1px solid #10b981;
	}

	.message.error {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	.tickets-section {
		margin-top: 60px;
	}

	h2 {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 32px;
		color: #111827;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		.description {
			font-size: 1rem;
		}
	}
</style>
