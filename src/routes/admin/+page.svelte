<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import TicketList from "$lib/components/TicketList.svelte";
  import MessageThread from "$lib/components/MessageThread.svelte"; // Import MessageThread
  import StatusBadge from "$lib/components/StatusBadge.svelte"; // Import StatusBadge
  import { supabase } from "$lib/services/supabase";
  import { validateStatusTransition } from "$lib/utils/workflow";
  import type { Ticket, TicketStatus } from "$lib/types/ticket";

  let email = "";
  let password = "";
  let isAuthenticated = false;
  let loading = true;
  let tickets: Ticket[] = [];
  let message = "";
  let messageType: "success" | "error" | "" = "";
  let authLoading = false;

  // New State for Detail View
  let selectedTicketId: string | null = null;
  let selectedTicket: Ticket | null = null;

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    isAuthenticated = !!session;

    if (isAuthenticated) {
      await loadTickets();
    }

    loading = false;

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        isAuthenticated = !!session;
        if (isAuthenticated && event === "SIGNED_IN") {
          await loadTickets();
          setupRealtimeSubscription();
        }
        if (!isAuthenticated) {
          stopRealtimeSubscription();
          selectedTicket = null;
          selectedTicketId = null;
        }
      })();
    });

    if (isAuthenticated) {
      setupRealtimeSubscription();
    }
  });

  let ticketSubscription: any;

  function setupRealtimeSubscription() {
    stopRealtimeSubscription();
    ticketSubscription = supabase
      .channel("public:tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        (payload) => {
          loadTickets().then(() => {
            // If the updated ticket is selected, update it
            if (
              selectedTicketId &&
              payload.new &&
              (payload.new as Ticket).id === selectedTicketId
            ) {
              selectedTicket = payload.new as Ticket;
            }
          });
        },
      )
      .subscribe();
  }

  function stopRealtimeSubscription() {
    if (ticketSubscription) {
      supabase.removeChannel(ticketSubscription);
      ticketSubscription = null;
    }
  }

  onDestroy(() => {
    stopRealtimeSubscription();
  });

  async function handleLogin(e: Event) {
    e.preventDefault();
    authLoading = true;
    message = "";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showMessage(error.message, "error");
      authLoading = false;
    } else {
      showMessage("Login successful!", "success");
      isAuthenticated = true;
      authLoading = false;
      await loadTickets();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    isAuthenticated = false;
    tickets = [];
    email = "";
    password = "";
    selectedTicket = null;
    selectedTicketId = null;
    showMessage("Logged out successfully", "success");
  }

  async function loadTickets() {
    loading = true;
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showMessage("Failed to load tickets", "error");
      console.error("Error loading tickets:", error);
    } else {
      tickets = data || [];
      // Update selected ticket ref if it exists in new data
      if (selectedTicketId) {
        const found = tickets.find((t) => t.id === selectedTicketId);
        if (found) selectedTicket = found;
      }
    }

    loading = false;
  }

  function selectTicket(event: CustomEvent<Ticket>) {
    const ticket = event.detail;
    selectedTicketId = ticket.id;
    selectedTicket = ticket;
  }

  async function handleStatusChange(ticketId: string, newStatus: string) {
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      showMessage("Ticket not found", "error");
      return;
    }

    const validation = validateStatusTransition(
      ticket.status,
      newStatus as TicketStatus,
    );

    if (!validation.valid) {
      showMessage(validation.error || "Invalid status transition", "error");
      await loadTickets();
      return;
    }

    const { error } = await supabase
      .from("tickets")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) {
      showMessage("Failed to update ticket status", "error");
      console.error("Error updating ticket:", error);
      await loadTickets();
    } else {
      showMessage("Updated status to " + newStatus, "success");
      await loadTickets();
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = "";
      messageType = "";
    }, 3000);
  }
</script>

<svelte:head>
  <title>Admin - Manage Tickets</title>
</svelte:head>

<Header currentPage="admin" />

<div class="page-container">
  {#if loading && !tickets.length}
    <div class="loading-full">
      <p>Loading...</p>
    </div>
  {:else if !isAuthenticated}
    <section class="login-section">
      <div class="login-card">
        <h1>Admin Portal</h1>
        <p class="subtitle">Secure access for support staff</p>

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
            {authLoading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </section>
  {:else}
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="user-info">
            <h2>Inbox</h2>
            <span class="user-badge">{tickets.length} Tickets</span>
          </div>
          <button
            on:click={handleLogout}
            class="icon-btn secondary"
            title="Logout"
          >
            <span style="font-size: 1.2rem;">&times;</span>
          </button>
        </div>

        <div class="ticket-list-wrapper">
          <TicketList
            {tickets}
            {loading}
            senderRole="admin"
            {selectedTicketId}
            showStatusDropdown={false}
            on:select={selectTicket}
          />
          <!-- Note: Disabled inline status dropdown in list to focus on detail view, 
                       or we can keep it. Let's keep it simple for list. -->
        </div>
      </aside>

      <!-- Main Content -->
      <section class="main-content">
        {#if selectedTicket}
          <div class="chat-interface">
            <div class="chat-header">
              <div class="header-main">
                <div class="title-row">
                  <h1>{selectedTicket.title}</h1>

                  <div class="status-actions">
                    <StatusBadge status={selectedTicket.status} />
                    <!-- Simple select for status -->
                    <select
                      class="status-select"
                      value={selectedTicket.status}
                      on:change={(e) => {
                        if (selectedTicket) {
                          handleStatusChange(
                            selectedTicket.id,
                            e.currentTarget.value,
                          );
                        }
                      }}
                    >
                      <option value="todo">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Resolved</option>
                    </select>
                  </div>
                </div>

                <div class="meta-row">
                  <span class="ticket-id">#{selectedTicket.id.slice(0, 8)}</span
                  >
                  <span class="separator">•</span>
                  <span class="user-name"
                    >User: <strong>{selectedTicket.user_name}</strong></span
                  >
                  <span class="separator">•</span>
                  <span class="time"
                    >{new Date(
                      selectedTicket.created_at,
                    ).toLocaleDateString()}</span
                  >
                </div>

                {#if selectedTicket.description}
                  <div class="description-box">
                    <strong>Description:</strong>
                    {selectedTicket.description}
                  </div>
                {/if}
              </div>
            </div>

            <div class="chat-body">
              <MessageThread
                ticketId={selectedTicket.id}
                senderRole="admin"
                readonly={selectedTicket.status === "done"}
              />
            </div>
          </div>
        {:else}
          <div class="empty-selection">
            <div class="empty-content">
              <h3>Select a Ticket</h3>
              <p>
                Choose a ticket from the inbox to view details, update status,
                and reply to the user.
              </p>

              <div class="info-box">
                <h4>Workflow Guide</h4>
                <ul>
                  <li><strong>Open</strong>: New ticket.</li>
                  <li><strong>In Progress</strong>: Being worked on.</li>
                  <li>
                    <strong>Resolved</strong>: Ticket closed. Thread locked.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/if}
      </section>
    </div>

    {#if message}
      <div class="toast-message {messageType}">
        {message}
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Reuse core structural styles from Support Page for consistency */
  .page-container {
    height: calc(100vh - 74px);
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 1.5rem 1.5rem 1.5rem;
    box-sizing: border-box;
  }

  .loading-full {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--color-text-muted);
    font-size: 1.1rem;
    font-weight: 500;
  }

  /* Login Styles */
  .login-section {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 2rem;
  }

  .login-card {
    background: var(--color-bg-card);
    padding: 3.5rem;
    border-radius: 1.5rem;
    box-shadow: var(
      --shadow-xl,
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1)
    );
    text-align: center;
    width: 100%;
    max-width: 420px;
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .login-card h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-main);
  }

  .subtitle {
    color: var(--color-text-muted);
    margin-bottom: 2rem;
  }

  .message {
    padding: 0.75rem;
    border-radius: var(--radius-md);
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  .message.error {
    background: #fee2e2;
    color: #991b1b;
  }
  .message.success {
    background: #d1fae5;
    color: #065f46;
  }

  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .login-button {
    width: 100%;
    padding: 0.875rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .login-button:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  /* Dashboard */
  .dashboard-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    height: 100%;
    overflow: hidden;
  }

  .sidebar {
    background: var(--color-bg-card);
    border: 1px solid rgba(229, 231, 235, 0.5);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .user-info h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .user-badge {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .ticket-list-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #fcfcfc;
  }

  /* Icon Button reused */
  .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: #f9fafb;
    color: var(--color-text-main);
  }
  .icon-btn.secondary {
    color: #ef4444;
    border-color: #fee2e2;
  }
  .icon-btn.secondary:hover {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  /* Main Content */
  .main-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(229, 231, 235, 0.5);
    overflow: hidden;
  }

  .chat-interface {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f3f4f6;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .title-row h1 {
    margin: 0;
    font-size: 1.25rem;
  }

  .status-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status-select {
    padding: 4px 8px;
    border-radius: var(--radius-md);
    border: 1px solid #d1d5db;
    font-size: 0.85rem;
    background: white;
    cursor: pointer;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
  }

  .ticket-id {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }

  .description-box {
    background: #f9fafb;
    padding: 1rem;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    color: #374151;
    border: 1px solid #f3f4f6;
  }

  .chat-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .chat-body :global(.message-thread) {
    height: 100% !important;
    margin-top: 0 !important;
    border: none !important;
    border-radius: 0 !important;
  }

  /* Empty State */
  .empty-selection {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #fafafa 0%, #ffffff 100%);
  }

  .empty-content {
    max-width: 400px;
    text-align: center;
    padding: 2rem;
  }

  .empty-content h3 {
    margin-bottom: 0.5rem;
    color: var(--color-text-main);
  }
  .empty-content p {
    color: var(--color-text-muted);
    margin-bottom: 2rem;
  }

  .info-box {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: var(--radius-md);
    padding: 1.5rem;
    text-align: left;
  }

  .info-box h4 {
    margin: 0 0 0.5rem 0;
    color: #1e40af;
    font-size: 0.95rem;
  }
  .info-box ul {
    margin: 0;
    padding-left: 1.2rem;
    color: #1e3a8a;
    font-size: 0.9rem;
  }
  .info-box li {
    margin-bottom: 0.25rem;
  }

  .toast-message {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    background: #1f2937;
    color: white;
    box-shadow: var(--shadow-lg);
    z-index: 200;
  }
  .toast-message.error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  .toast-message.success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }
</style>
