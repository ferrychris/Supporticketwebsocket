<script lang="ts">
  export let currentPage: "home" | "support" | "admin" = "home";
</script>

<header>
  <div class="brand">
    <div class="logo-icon">SD</div>
    <a href="/">SupportDesk</a>
  </div>
</header>

<style>
  header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 1.25rem 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background: var(--color-primary);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: -0.02em;
  }

  .brand a {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--color-text-main);
    text-decoration: none;
    letter-spacing: -0.03em;
    transition: opacity 0.2s;
  }

  .brand a:hover {
    opacity: 0.7;
  }
</style>
