<script lang="ts">
  import type { Ticket } from "$lib/types/ticket";
  import TicketCard from "./TicketCard.svelte";
  import { createEventDispatcher } from "svelte";

  export let tickets: Ticket[] = [];
  export let showStatusDropdown = false;
  export let senderRole: "user" | "admin" = "user";
  export let onStatusChange:
    | ((ticketId: string, newStatus: string) => void)
    | undefined = undefined;
  export let loading = false;
  export let selectedTicketId: string | null = null;

  const dispatch = createEventDispatcher();

  function handleSelect(ticket: Ticket) {
    if (ticket.id === selectedTicketId) return;
    dispatch("select", ticket);
  }
</script>

<div class="ticket-list">
  {#if loading}
    <div class="loading">Loading tickets...</div>
  {:else if tickets.length === 0}
    <div class="empty-state">
      <p>No tickets yet.</p>
    </div>
  {:else}
    {#each tickets as ticket (ticket.id)}
      <div
        class="ticket-item {selectedTicketId === ticket.id ? 'selected' : ''}"
        on:click={() => handleSelect(ticket)}
        on:keydown={(e) => e.key === "Enter" && handleSelect(ticket)}
        role="button"
        tabindex="0"
      >
        <TicketCard
          {ticket}
          {showStatusDropdown}
          {onStatusChange}
          {senderRole}
        />
      </div>
    {/each}
  {/if}
</div>

<style>
  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ticket-item {
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .ticket-item:hover {
    transform: translateY(-2px);
  }

  .ticket-item.selected {
    box-shadow: 0 0 0 2px #3b82f6;
  }

  /* Override TicketCard styles when inside list */
  .ticket-item :global(.ticket-card) {
    margin-bottom: 0 !important;
  }

  /* Hide chat button in list view since whole card is clickable */
  .ticket-item :global(.btn-chat) {
    display: none;
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  .empty-state p {
    margin: 0;
    font-size: 1.1rem;
  }
</style>
