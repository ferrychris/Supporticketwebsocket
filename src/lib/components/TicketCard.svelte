<script lang="ts">
  import type { Ticket } from "$lib/types/ticket";
  import StatusBadge from "./StatusBadge.svelte";

  export let ticket: Ticket;
  export let showStatusDropdown = false;
  export let onStatusChange:
    | ((ticketId: string, newStatus: string) => void)
    | undefined = undefined;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  let selectedStatus = ticket.status;

  async function handleStatusChange() {
    if (onStatusChange && selectedStatus !== ticket.status) {
      await onStatusChange(ticket.id, selectedStatus);
    }
  }
</script>

<div class="ticket-card">
  <div class="ticket-header">
    <h3 class="ticket-title">{ticket.title}</h3>
    <div class="header-actions">
      {#if showStatusDropdown}
        <select
          bind:value={selectedStatus}
          on:change={handleStatusChange}
          class="status-dropdown"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      {:else}
        <StatusBadge status={ticket.status} />
      {/if}
    </div>
  </div>

  {#if ticket.description}
    <p class="ticket-description">{ticket.description}</p>
  {/if}

  <div class="ticket-footer">
    <div class="ticket-meta">
      <span>Created: {formatDate(ticket.created_at)}</span>
      {#if ticket.user_name}
        <span class="user-name">by {ticket.user_name}</span>
      {/if}
    </div>
    <a href="/support/chat/{ticket.id}" class="btn-chat">Open Chat</a>
  </div>
</div>

<style>
  .ticket-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    transition: box-shadow 0.2s;
  }

  .ticket-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ticket-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
  }

  .ticket-description {
    margin: 0 0 12px 0;
    color: #6b7280;
    line-height: 1.5;
  }

  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e5e7eb;
  }

  .ticket-meta {
    font-size: 0.875rem;
    color: #9ca3af;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-name {
    font-weight: 500;
    color: #6b7280;
    font-size: 0.8rem;
  }

  .btn-chat {
    background: none;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    font-weight: 500;
  }

  .btn-chat:hover {
    background: #eff6ff;
  }

  .status-dropdown {
    padding: 4px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
  }

  .status-dropdown:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
