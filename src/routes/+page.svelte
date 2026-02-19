<script lang="ts">
  // No JS needed for this page
</script>

<svelte:head>
  <title>Support Ticket System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page-wrapper">
  <!-- Nav -->
  <nav class="nav">
    <div class="nav-brand">
      <div class="brand-dot"></div>
      <span>SupportDesk</span>
    </div>
    <div class="nav-links">
      <a href="/support" class="btn-primary-nav">Support Ticket</a>
    </div>
  </nav>

  <!-- Hero -->
  <main class="hero">
    <!-- Left: Copy -->
    <div class="hero-copy">
      <p class="hero-eyebrow">Real-time Support Platform</p>
      <h1 class="hero-heading">
        Track Every Ticket.<br />
        Resolve Every<br />
        Issue.
      </h1>
      <p class="hero-sub">
        Open. In Progress. Resolved. Simple workflow, powerful clarity.
      </p>

      <div class="cta-group">
        <a href="/support" class="btn-primary">Create Ticket</a>
      </div>
    </div>

    <!-- Right: Dashboard Card Mockup -->
    <div class="hero-visual">
      <div class="dashboard-card">
        <div class="dashboard-card-header">
          <div class="avatar-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="8" r="4" fill="#9ca3af" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#9ca3af" />
            </svg>
          </div>
          <span class="dashboard-title">Dashboard</span>
          <div class="hamburger">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="status-list">
          <div class="status-item">
            <div class="status-icon icon-open">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                />
              </svg>
            </div>
            <span class="status-label">Open</span>
          </div>

          <div class="status-item status-item-active">
            <div class="status-icon icon-progress">
              <div class="dot-group">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
            <span class="status-label">In Progress</span>
            <div class="progress-dots">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon icon-resolved">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span class="status-label">Resolved</span>
          </div>
        </div>
      </div>

      <!-- Decorative blur blobs -->
      <div class="blob blob-blue"></div>
      <div class="blob blob-purple"></div>
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    background: linear-gradient(135deg, #f5f0e8 0%, #ede8f5 50%, #e8ecf5 100%);
    min-height: 100vh;
  }

  .page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Nav ── */
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 60px;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 1.1rem;
    color: #111827;
  }

  .brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #111827;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .nav-links a {
    text-decoration: none;
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: #111827;
  }

  .nav-links .btn-primary-nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #111827;
    color: white;
    padding: 10px 24px;
    border-radius: 9999px;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .nav-links .btn-primary-nav:hover {
    background: #374151;
    color: white;
    transform: translateY(-1px);
  }

  /* ── Hero Layout ── */
  .hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40px 60px 80px;
    gap: 60px;
    max-width: 1300px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Left Copy ── */
  .hero-copy {
    flex: 1;
    max-width: 520px;
  }

  .hero-eyebrow {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #6b7280;
    margin: 0 0 20px 0;
  }

  .hero-heading {
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 900;
    color: #111827;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0 0 24px 0;
  }

  .hero-sub {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 40px 0;
  }

  .cta-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: fit-content;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #111827;
    color: white;
    padding: 15px 40px;
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      background 0.2s,
      transform 0.2s;
    width: 200px;
  }

  .btn-primary:hover {
    background: #374151;
    transform: translateY(-1px);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #111827;
    padding: 13px 40px;
    border-radius: 9999px;
    border: 2px solid #d1d5db;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      border-color 0.2s,
      background 0.2s,
      transform 0.2s;
    width: 200px;
  }

  .btn-outline:hover {
    border-color: #111827;
    background: rgba(17, 24, 39, 0.05);
    transform: translateY(-1px);
  }

  /* ── Right Visual ── */
  .hero-visual {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    max-width: 480px;
  }

  /* Blur blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
    z-index: 0;
  }

  .blob-blue {
    width: 200px;
    height: 200px;
    background: #93c5fd;
    top: -20px;
    right: -20px;
  }

  .blob-purple {
    width: 180px;
    height: 180px;
    background: #c4b5fd;
    bottom: -20px;
    left: 20px;
  }

  /* Dashboard Card */
  .dashboard-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 24px;
    padding: 24px;
    width: 340px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04);
    position: relative;
    z-index: 1;
  }

  .dashboard-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }

  .avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar-placeholder svg {
    width: 24px;
    height: 24px;
  }

  .dashboard-title {
    font-weight: 700;
    font-size: 1rem;
    color: #111827;
    flex: 1;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
  }

  .hamburger span {
    display: block;
    width: 18px;
    height: 2px;
    background: #9ca3af;
    border-radius: 2px;
  }

  /* Status List */
  .status-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 14px;
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
  }

  .status-item:hover {
    transform: translateX(4px);
  }

  .status-item-active {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .status-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .status-icon svg {
    width: 24px;
    height: 24px;
  }

  .icon-open {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .icon-progress {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .icon-resolved {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  /* Dot group inside In Progress icon */
  .dot-group {
    display: flex;
    gap: 4px;
  }

  .dot-group .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: white;
    animation: pop 1.2s ease-in-out infinite;
  }

  .dot-group .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .dot-group .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pop {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.6);
      opacity: 0.5;
    }
  }

  .status-label {
    font-weight: 600;
    font-size: 1rem;
    color: #111827;
    flex: 1;
  }

  /* Decorative progress dots on the active item */
  .progress-dots {
    display: flex;
    gap: 4px;
  }

  .progress-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e5e7eb;
  }

  .progress-dots span:first-child {
    background: #f59e0b;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hero {
      flex-direction: column;
      padding: 40px 24px 60px;
      text-align: center;
    }

    .hero-copy {
      max-width: 100%;
    }

    .cta-group {
      align-items: center;
      width: 100%;
    }

    .hero-visual {
      max-width: 100%;
    }

    .nav {
      padding: 20px 24px;
    }
  }
</style>
