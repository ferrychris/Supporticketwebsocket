<script lang="ts">
	export let currentPage: 'home' | 'support' | 'admin' = 'home';
</script>

<header>
	<nav>
		<a href="/" class:active={currentPage === 'home'}>Home</a>
		<a href="/support" class:active={currentPage === 'support'}>Support</a>
		<a href="/admin" class:active={currentPage === 'admin'}>Admin</a>
	</nav>
</header>

<style>
	header {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 16px 24px;
		margin-bottom: 32px;
	}

	nav {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		gap: 24px;
	}

	a {
		color: #6b7280;
		text-decoration: none;
		font-weight: 500;
		padding: 8px 16px;
		border-radius: 6px;
		transition: all 0.2s;
	}

	a:hover {
		color: #3b82f6;
		background: #eff6ff;
	}

	a.active {
		color: #3b82f6;
		background: #dbeafe;
	}
</style>
