<script lang="ts">
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/services/supabase";
  import MessageThread from "$lib/components/MessageThread.svelte";
  import Header from "$lib/components/Header.svelte";
  import type { Ticket } from "$lib/types/ticket";

  let ticketId = $page.params.id;
  let ticket: Ticket | null = null;
  let loading = true;
  let errorMsg = "";
  let ticketSubscription: any;

  onMount(async () => {
    await loadTicket();
    setupTicketSubscription();
  });

  onDestroy(() => {
    if (ticketSubscription) {
      supabase.removeChannel(ticketSubscription);
    }
  });

  async function loadTicket() {
    loading = true;
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) {
      console.error("Error loading ticket:", error);
      errorMsg = "Failed to load ticket details.";
    } else {
      ticket = data;
    }
    loading = false;
  }

  function setupTicketSubscription() {
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
          if (ticket) {
            ticket = { ...ticket, ...payload.new } as Ticket;
          }
        },
      )
      .subscribe();
  }

  function statusLabel(status: string) {
    if (status === "todo") return "Open";
    if (status === "in_progress") return "In Progress";
    if (status === "done") return "Resolved";
    return status;
  }

  function statusColor(status: string) {
    if (status === "todo") return "status-open";
    if (status === "in_progress") return "status-progress";
    if (status === "done") return "status-done";
    return "";
  }
</script>

<svelte:head>
  <title>Chat - {ticket ? ticket.title : "Support"}</title>
</svelte:head>

<Header currentPage="support" />

<main class="chat-container">
  {#if loading}
    <div class="loading">Loading chat...</div>
  {:else if errorMsg}
    <div class="error">{errorMsg}</div>
  {:else if ticket}
    <div class="chat-layout">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-top">
          <a href="/support" class="back-link">&larr; Back to Tickets</a>
          <div class="status-pill {statusColor(ticket.status)}">
            <span class="status-dot"></span>
            {statusLabel(ticket.status)}
          </div>
        </div>
        <div class="header-body">
          <h1>{ticket.title}</h1>
          {#if ticket.description}
            <p class="ticket-desc">{ticket.description}</p>
          {/if}
          <div class="ticket-meta-row">
            <span class="ticket-id"
              >Ticket #{ticket.id.slice(0, 8).toUpperCase()}</span
            >
            <span class="ticket-date">
              Opened {new Date(ticket.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <!-- Resolved Banner -->
      {#if ticket.status === "done"}
        <div class="resolved-banner">
          ✅ This ticket has been resolved. The conversation is now read-only.
        </div>
      {/if}

      <!-- Chat Thread -->
      <div class="chat-thread-wrapper">
        <MessageThread
          {ticketId}
          senderRole="user"
          readonly={ticket.status === "done"}
        />
      </div>
    </div>
  {:else}
    <div class="error">Ticket not found.</div>
  {/if}
</main>

<style>
  .chat-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px 40px;
    height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
  }

  .chat-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: white;
    border-radius: 12px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }

  .chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .back-link {
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .back-link:hover {
    color: #374151;
    text-decoration: underline;
  }

  /* Status Pill */
  .status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-open {
    background: #eff6ff;
    color: #1d4ed8;
  }
  .status-open .status-dot {
    background: #3b82f6;
  }

  .status-progress {
    background: #fffbeb;
    color: #92400e;
  }
  .status-progress .status-dot {
    background: #f59e0b;
    animation: pulse 1.5s infinite;
  }

  .status-done {
    background: #f0fdf4;
    color: #166534;
  }
  .status-done .status-dot {
    background: #22c55e;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  /* Header Body */
  .header-body h1 {
    margin: 0 0 4px 0;
    font-size: 1.125rem;
    color: #111827;
    font-weight: 600;
  }

  .ticket-desc {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.4;
  }

  .ticket-meta-row {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .ticket-id {
    font-size: 0.75rem;
    color: #9ca3af;
    font-family: monospace;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .ticket-date {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  /* Resolved Banner */
  .resolved-banner {
    background: #f0fdf4;
    border-bottom: 1px solid #bbf7d0;
    color: #166534;
    text-align: center;
    padding: 10px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .chat-thread-wrapper {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .loading,
  .error {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  .error {
    color: #ef4444;
  }
</style>
