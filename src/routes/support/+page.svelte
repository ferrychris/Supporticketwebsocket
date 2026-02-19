<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import TicketForm from "$lib/components/TicketForm.svelte";
  import TicketList from "$lib/components/TicketList.svelte";
  import MessageThread from "$lib/components/MessageThread.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import { supabase } from "$lib/services/supabase";
  import type { Ticket, CreateTicketInput } from "$lib/types/ticket";

  let tickets: Ticket[] = [];
  let loading = false;
  let message = "";
  let messageType: "success" | "error" | "" = "";
  let listSubscription: any;
  let ticketSubscription: any;

  // Session State
  let sessionId: string | null = null;
  let userName: string | null = null;
  let nameInput = "";
  let sessionLoading = true;

  // UI State
  let showCreateModal = false;
  let selectedTicketId: string | null = null;
  let selectedTicket: Ticket | null = null;

  onMount(() => {
    checkSession();
  });

  onDestroy(() => {
    if (listSubscription) supabase.removeChannel(listSubscription);
    if (ticketSubscription) supabase.removeChannel(ticketSubscription);
  });

  function checkSession() {
    const storedSession = localStorage.getItem("ticket_session");
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        sessionId = session.id;
        userName = session.name;
        loadTickets();
        setupListSubscription();
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem("ticket_session");
      }
    }
    sessionLoading = false;
  }

  function startSession() {
    if (!nameInput.trim()) return;

    const newSessionId = crypto.randomUUID();
    const newUserName = nameInput.trim();

    const sessionData = {
      id: newSessionId,
      name: newUserName,
    };

    localStorage.setItem("ticket_session", JSON.stringify(sessionData));
    sessionId = newSessionId;
    userName = newUserName;

    loadTickets();
    setupListSubscription();
  }

  function setupListSubscription() {
    if (!sessionId) return;
    if (listSubscription) supabase.removeChannel(listSubscription);

    listSubscription = supabase
      .channel("public:tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => loadTickets(),
      )
      .subscribe();
  }

  function setupTicketSubscription(ticketId: string) {
    if (ticketSubscription) supabase.removeChannel(ticketSubscription);

    ticketSubscription = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          if (selectedTicket && selectedTicket.id === ticketId) {
            selectedTicket = { ...selectedTicket, ...payload.new } as Ticket;
          }
        },
      )
      .subscribe();
  }

  async function loadTickets() {
    if (!sessionId) return;
    loading = true;

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      showMessage("Failed to load tickets", "error");
      console.error("Error loading tickets:", error);
    } else {
      tickets = data || [];
      // If we have a selected ticket, make sure it's updated in the list
      if (selectedTicketId) {
        const updated = tickets.find((t) => t.id === selectedTicketId);
        if (updated) selectedTicket = updated;
      }
    }

    loading = false;
  }

  function selectTicket(event: CustomEvent<Ticket>) {
    const ticket = event.detail;
    selectedTicketId = ticket.id;
    selectedTicket = ticket;
    setupTicketSubscription(ticket.id);
  }

  async function handleSubmit(event: CustomEvent<CreateTicketInput>) {
    if (!sessionId || !userName) {
      showMessage("Session missing. Please refresh.", "error");
      return;
    }

    const { title, description } = event.detail;

    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          title,
          description: description || null,
          status: "todo",
          session_id: sessionId,
          user_name: userName,
        },
      ])
      .select()
      .single();

    if (error) {
      showMessage("Failed to create ticket", "error");
    } else {
      showCreateModal = false;
      // Automatically select the new ticket
      selectedTicketId = data.id;
      selectedTicket = data;
      setupTicketSubscription(data.id);
      loadTickets(); // Refresh list to show new ticket at top
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

  function clearSession() {
    if (
      confirm("Are you sure? You will lose access to your current tickets.")
    ) {
      localStorage.removeItem("ticket_session");
      sessionId = null;
      userName = null;
      tickets = [];
      nameInput = "";
      selectedTicketId = null;
      selectedTicket = null;
    }
  }
</script>

<svelte:head>
  <title>Support Dashboard</title>
</svelte:head>

<Header currentPage="support" />

<main class="page-container">
  {#if sessionLoading}
    <div class="loading-full">
      <p>Initializing...</p>
    </div>
  {:else if !sessionId}
    <section class="session-start">
      <div class="session-card">
        <h1>Welcome to Support</h1>
        <p class="subtitle">Enter your name to start. No login required.</p>
        <form on:submit|preventDefault={startSession}>
          <div class="form-group">
            <label for="name">Your Name</label>
            <input
              id="name"
              type="text"
              bind:value={nameInput}
              placeholder="e.g. John Doe"
              required
              minlength="2"
            />
          </div>
          <button type="submit" class="start-button">Start Session</button>
        </form>
      </div>
    </section>
  {:else}
    <div class="dashboard-layout">
      <!-- Sidebar / Ticket List -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="user-info">
            <h2>Tickets</h2>
            <span class="user-badge">{userName}</span>
          </div>
          <div class="sidebar-actions">
            <button
              class="icon-btn"
              on:click={() => (showCreateModal = true)}
              title="New Ticket"
            >
              +
            </button>
            <button
              class="icon-btn secondary"
              on:click={clearSession}
              title="End Session"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="ticket-list-wrapper">
          <TicketList
            {tickets}
            {loading}
            senderRole="user"
            {selectedTicketId}
            on:select={selectTicket}
          />
        </div>
      </aside>

      <!-- Main Content / Chat -->
      <section class="main-content">
        {#if selectedTicket}
          <div class="chat-interface">
            <div class="chat-header">
              <div class="header-main">
                <div class="title-row">
                  <h1>{selectedTicket.title}</h1>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                {#if selectedTicket.description}
                  <p class="description">{selectedTicket.description}</p>
                {/if}
              </div>
              <div class="header-meta">
                <span class="ticket-id">#{selectedTicket.id.slice(0, 8)}</span>
              </div>
            </div>

            {#if selectedTicket.status === "done"}
              <div class="resolved-banner">
                ✅ This ticket has been resolved.
              </div>
            {/if}

            <div class="chat-body">
              <MessageThread
                ticketId={selectedTicket.id}
                senderRole="user"
                readonly={selectedTicket.status === "done"}
              />
            </div>
          </div>
        {:else}
          <div class="empty-selection">
            <div class="empty-content">
              <h3>Select a ticket</h3>
              <p>
                Choose a ticket from the sidebar to view the conversation or
                create a new one.
              </p>
              <button
                class="btn-primary"
                on:click={() => (showCreateModal = true)}
              >
                Create New Ticket
              </button>
            </div>
          </div>
        {/if}
      </section>
    </div>

    <!-- Create Ticket Modal -->
    {#if showCreateModal}
      <div class="modal-backdrop" on:click={() => (showCreateModal = false)}>
        <div class="modal-content" on:click|stopPropagation>
          <div class="modal-header">
            <h2>Create New Ticket</h2>
            <button class="close-btn" on:click={() => (showCreateModal = false)}
              >&times;</button
            >
          </div>
          <TicketForm on:submit={handleSubmit} />
        </div>
      </div>
    {/if}

    {#if message}
      <div class="toast-message {messageType}">
        {message}
      </div>
    {/if}
  {/if}
</main>

<style>
  .page-container {
    height: calc(100vh - 74px); /* Header height + padding */
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

  /* Session Start */
  .session-start {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 2rem;
  }

  .session-card {
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
    max-width: 480px;
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .session-card h1 {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #111827 0%, #4b5563 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.025em;
  }

  .subtitle {
    color: var(--color-text-muted);
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
  }

  .form-group {
    margin: 2rem 0;
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-text-main);
    font-size: 0.95rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: var(--radius-md);
    box-sizing: border-box;
    font-size: 1rem;
    transition: all 0.2s;
    background: #f9fafb;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .start-button {
    width: 100%;
    padding: 1rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1.05rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: var(--shadow-md);
  }

  .start-button:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  /* Dashboard Layout */
  .dashboard-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    height: 100%;
    overflow: hidden;
  }

  /* Sidebar */
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
    color: var(--color-text-main);
    font-weight: 700;
  }

  .user-badge {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .sidebar-actions {
    display: flex;
    gap: 0.75rem;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: var(--color-text-muted);
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: #f9fafb;
    color: var(--color-text-main);
    transform: scale(1.05);
  }

  .icon-btn.primary {
    background: var(--color-primary);
    color: white;
    border: none;
  }

  .icon-btn.primary:hover {
    background: var(--color-primary-hover);
  }

  .icon-btn.secondary {
    color: #ef4444;
    border-color: #fee2e2;
  }

  .icon-btn.secondary:hover {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .ticket-list-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #fcfcfc;
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
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .chat-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text-main);
    letter-spacing: -0.01em;
  }

  .description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    max-width: 600px;
    line-height: 1.6;
  }

  .ticket-id {
    background: #f3f4f6;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-family: "Monaco", "Consolas", monospace;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
  }

  .resolved-banner {
    background: #ecfdf5;
    color: #047857;
    padding: 0.75rem;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
    border-bottom: 1px solid #d1fae5;
  }

  .chat-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* Styles for inner MessageThread */
    background: #ffffff;
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
    text-align: center;
    color: var(--color-text-muted);
    background: radial-gradient(circle at center, #fafafa 0%, #ffffff 100%);
  }

  .empty-content {
    max-width: 320px;
    padding: 2rem;
  }

  .empty-content h3 {
    color: var(--color-text-main);
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
  }

  .empty-content p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: var(--shadow-sm);
  }

  .btn-primary:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 520px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: color 0.2s;
    padding: 0.5rem;
    line-height: 1;
    border-radius: 50%;
  }

  .close-btn:hover {
    color: var(--color-text-main);
    background: #f3f4f6;
  }

  /* Toast */
  .toast-message {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    background: #1f2937;
    color: white;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 200;
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleUp {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
