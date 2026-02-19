<script lang="ts">
	import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
	<title>Support Ticket System</title>
</svelte:head>

<Header currentPage="home" />

<main class="container">
	<section class="hero">
		<h1>Support Ticket System</h1>
		<p class="subtitle">Submit a ticket and track its progress</p>

		<div class="cta-buttons">
			<a href="/support" class="btn btn-primary">Submit a Ticket</a>
			<a href="/admin" class="btn btn-secondary">Admin Login</a>
		</div>
	</section>

	<section class="features">
		<div class="feature-card">
			<h3>Easy Ticket Submission</h3>
			<p>Submit support tickets with a simple form. Just provide a title and optional description.</p>
		</div>

		<div class="feature-card">
			<h3>Track Progress</h3>
			<p>View all tickets and their current status: To Do, In Progress, or Done.</p>
		</div>

		<div class="feature-card">
			<h3>Admin Management</h3>
			<p>Authenticated admins can update ticket statuses and manage workflow.</p>
		</div>
	</section>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.hero {
		text-align: center;
		padding: 80px 0 60px;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 16px;
		color: #111827;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #6b7280;
		margin-bottom: 40px;
	}

	.cta-buttons {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 14px 32px;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-block;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover {
		background-color: #2563eb;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.btn-secondary {
		background-color: white;
		color: #3b82f6;
		border: 2px solid #3b82f6;
	}

	.btn-secondary:hover {
		background-color: #eff6ff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		padding: 60px 0;
	}

	.feature-card {
		background: white;
		padding: 32px;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		transition: all 0.3s;
	}

	.feature-card:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		transform: translateY(-4px);
	}

	.feature-card h3 {
		font-size: 1.25rem;
		margin-bottom: 12px;
		color: #111827;
	}

	.feature-card p {
		color: #6b7280;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.hero {
			padding: 40px 0 30px;
		}

		.features {
			padding: 30px 0;
		}
	}
</style>
