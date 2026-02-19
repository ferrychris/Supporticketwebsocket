<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import TicketList from '$lib/components/TicketList.svelte';
	import { supabase } from '$lib/services/supabase';
	import { validateStatusTransition } from '$lib/utils/workflow';
	import type { Ticket, TicketStatus } from '$lib/types/ticket';

	let email = '';
	let password = '';
	let isAuthenticated = false;
	let loading = true;
	let tickets: Ticket[] = [];
	let message = '';
	let messageType: 'success' | 'error' | '' = '';
	let authLoading = false;

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		isAuthenticated = !!session;

		if (isAuthenticated) {
			await loadTickets();
		}

		loading = false;

		supabase.auth.onAuthStateChange((event, session) => {
			(async () => {
				isAuthenticated = !!session;
				if (isAuthenticated && event === 'SIGNED_IN') {
					await loadTickets();
				}
			})();
		});
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		authLoading = true;
		message = '';

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			showMessage(error.message, 'error');
			authLoading = false;
		} else {
			showMessage('Login successful!', 'success');
			isAuthenticated = true;
			authLoading = false;
			await loadTickets();
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		isAuthenticated = false;
		tickets = [];
		email = '';
		password = '';
		showMessage('Logged out successfully', 'success');
	}

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

	async function handleStatusChange(ticketId: string, newStatus: string) {
		const ticket = tickets.find((t) => t.id === ticketId);

		if (!ticket) {
			showMessage('Ticket not found', 'error');
			return;
		}

		const validation = validateStatusTransition(ticket.status, newStatus as TicketStatus);

		if (!validation.valid) {
			showMessage(validation.error || 'Invalid status transition', 'error');
			await loadTickets();
			return;
		}

		const { error } = await supabase
			.from('tickets')
			.update({
				status: newStatus,
				updated_at: new Date().toISOString()
			})
			.eq('id', ticketId);

		if (error) {
			showMessage('Failed to update ticket status', 'error');
			console.error('Error updating ticket:', error);
			await loadTickets();
		} else {
			showMessage('Ticket status updated successfully!', 'success');
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
	<title>Admin - Manage Tickets</title>
</svelte:head>

<Header currentPage="admin" />

<main class="container">
	{#if loading}
		<div class="loading-container">
			<p>Loading...</p>
		</div>
	{:else if !isAuthenticated}
		<section class="login-section">
			<div class="login-card">
				<h1>Admin Login</h1>
				<p class="subtitle">Sign in to manage support tickets</p>

				{#if message}
					<div class="message {messageType}">
						{message}
					</div>
				{/if}

				<form on:submit={handleLogin}>
					<div class="form-group">
						<label for="email">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="admin@example.com"
							required
							disabled={authLoading}
						/>
					</div>

					<div class="form-group">
						<label for="password">Password</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Enter your password"
							required
							disabled={authLoading}
						/>
					</div>

					<button type="submit" class="login-button" disabled={authLoading}>
						{authLoading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</div>
		</section>
	{:else}
		<section class="admin-section">
			<div class="admin-header">
				<h1>Manage Tickets</h1>
				<button on:click={handleLogout} class="logout-button">Logout</button>
			</div>

			{#if message}
				<div class="message {messageType}">
					{message}
				</div>
			{/if}

			<div class="info-box">
				<h3>Allowed Status Transitions</h3>
				<ul>
					<li><strong>To Do</strong> → In Progress</li>
					<li><strong>In Progress</strong> → To Do or Done</li>
					<li><strong>Done</strong> → (No transitions allowed)</li>
				</ul>
			</div>

			<TicketList {tickets} {loading} showStatusDropdown={true} onStatusChange={handleStatusChange} />
		</section>
	{/if}
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px 60px;
	}

	.loading-container {
		text-align: center;
		padding: 60px 0;
		color: #6b7280;
	}

	.login-section {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 200px);
	}

	.login-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 48px;
		max-width: 420px;
		width: 100%;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 8px;
		text-align: center;
		color: #111827;
	}

	.subtitle {
		text-align: center;
		color: #6b7280;
		margin-bottom: 32px;
	}

	.message {
		padding: 12px 20px;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
		margin-bottom: 24px;
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

	.form-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #374151;
	}

	input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
	}

	.login-button {
		width: 100%;
		padding: 12px 24px;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.login-button:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.login-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.admin-section {
		padding-top: 40px;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.logout-button {
		padding: 10px 20px;
		background-color: white;
		color: #ef4444;
		border: 1px solid #ef4444;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.logout-button:hover {
		background-color: #fee2e2;
	}

	.info-box {
		background: #eff6ff;
		border: 1px solid #3b82f6;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 32px;
	}

	.info-box h3 {
		margin-bottom: 12px;
		color: #1e40af;
	}

	.info-box ul {
		margin: 0;
		padding-left: 20px;
		color: #1e3a8a;
	}

	.info-box li {
		margin-bottom: 6px;
	}

	@media (max-width: 768px) {
		.login-card {
			padding: 32px 24px;
		}

		h1 {
			font-size: 1.5rem;
		}

		.admin-header {
			flex-direction: column;
			gap: 16px;
			align-items: flex-start;
		}
	}
</style>
