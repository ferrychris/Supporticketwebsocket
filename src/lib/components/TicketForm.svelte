<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let title = '';
	let description = '';
	let isSubmitting = false;

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!title.trim()) {
			return;
		}

		isSubmitting = true;

		dispatch('submit', {
			title: title.trim(),
			description: description.trim() || undefined
		});

		title = '';
		description = '';
		isSubmitting = false;
	}
</script>

<form on:submit={handleSubmit} class="ticket-form">
	<div class="form-group">
		<label for="title">
			Title (required) <span class="required">*</span>
		</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			placeholder="e.g., Cannot log in"
			required
			disabled={isSubmitting}
		/>
	</div>

	<div class="form-group">
		<label for="description">Description (optional)</label>
		<textarea
			id="description"
			bind:value={description}
			placeholder="Provide more details about the issue..."
			rows="4"
			disabled={isSubmitting}
		/>
	</div>

	<button type="submit" disabled={isSubmitting || !title.trim()} class="submit-button">
		{isSubmitting ? 'Creating...' : 'Create Ticket'}
	</button>
</form>

<style>
	.ticket-form {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 32px;
		max-width: 500px;
		margin: 0 auto;
	}

	.form-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #374151;
		font-size: 0.95rem;
	}

	.required {
		color: #ef4444;
	}

	input,
	textarea {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled,
	textarea:disabled {
		background-color: #f9fafb;
		cursor: not-allowed;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	.submit-button {
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

	.submit-button:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.submit-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
</style>
