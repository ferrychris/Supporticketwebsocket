<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/services/supabase";
  import type { Message, MessageInput } from "$lib/types/ticket";

  export let ticketId: string;
  export let senderRole: "user" | "admin";
  export let readonly: boolean = false;

  let messages: Message[] = [];
  let newMessage = "";
  let loading = true;
  let sending = false;
  let subscription: any;

  onMount(async () => {
    // Initial load handled by reactive statement below
  });

  // Reactive statement to load messages when ticketId changes
  $: if (ticketId) {
    // Clean up previous subscription if exists
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
    loadMessages();
    setupRealtimeSubscription();
  }

  onDestroy(() => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  });

  async function loadMessages() {
    loading = true;
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
    } else {
      messages = data || [];
    }
    loading = false;
  }

  function setupRealtimeSubscription() {
    subscription = supabase
      .channel(`ticket_messages:ticket_id=eq.${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          messages = [...messages, payload.new as Message];
          // Scroll to bottom
          setTimeout(scrollToBottom, 50);
        },
      )
      .subscribe();
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;

    sending = true;
    const messageInput: MessageInput = {
      ticket_id: ticketId,
      sender_role: senderRole,
      content: newMessage.trim(),
    };

    const { error } = await supabase
      .from("ticket_messages")
      .insert([messageInput]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      newMessage = "";
    }
    sending = false;
  }

  function scrollToBottom() {
    const container = document.querySelector(".messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  $: if (messages.length > 0) {
    setTimeout(scrollToBottom, 100);
  }
</script>

<div class="message-thread">
  <div class="messages-container">
    {#if loading}
      <div class="status-text">Loading messages...</div>
    {:else if messages.length === 0}
      <div class="status-text">No messages yet. Start the conversation!</div>
    {:else}
      {#each messages as message}
        <div
          class="message {message.sender_role === senderRole
            ? 'sent'
            : 'received'}"
        >
          <div class="message-role">
            {message.sender_role === "admin" ? "Support" : "User"}
          </div>
          <div class="message-content">{message.content}</div>
          <div class="message-time">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if readonly}
    <div class="readonly-notice">
      This ticket has been resolved. No new messages can be sent.
    </div>
  {:else}
    <form on:submit|preventDefault={sendMessage} class="message-input-form">
      <input
        type="text"
        bind:value={newMessage}
        placeholder="Type a message..."
        disabled={sending}
        required
      />
      <button type="submit" disabled={sending || !newMessage.trim()}>
        {sending ? "..." : "Send"}
      </button>
    </form>
  {/if}
</div>
```

<style>
  .message-thread {
    display: flex;
    flex-direction: column;
    height: 400px;
    background: #f9fafb;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    margin-top: 16px;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-text {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    margin-top: 20px;
  }

  .message {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.9375rem;
    line-height: 1.4;
    position: relative;
  }

  .message.sent {
    align-self: flex-end;
    background: #000000;
    color: white;
    border-bottom-right-radius: 2px;
  }

  .message.received {
    align-self: flex-start;
    background: white;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    border-bottom-left-radius: 2px;
  }

  .message-role {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 2px;
    opacity: 0.8;
  }

  .message-time {
    font-size: 0.7rem;
    margin-top: 4px;
    text-align: right;
    opacity: 0.7;
  }

  .message-input-form {
    display: flex;
    padding: 12px;
    background: white;
    border-top: 1px solid #e5e7eb;
    gap: 8px;
  }

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  input:focus {
    outline: none;
    border-color: #000000;
  }

  button {
    padding: 8px 16px;
    background: #000000;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }

  button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .readonly-notice {
    padding: 12px 16px;
    background: #f3f4f6;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>
