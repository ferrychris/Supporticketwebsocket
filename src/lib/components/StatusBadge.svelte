<script lang="ts">
  import type { TicketStatus } from "$lib/types/ticket";

  export let status: TicketStatus;

  const statusConfig: Record<
    TicketStatus,
    { label: string; className: string }
  > = {
    todo: { label: "Open", className: "badge-todo" },
    in_progress: { label: "In Progress", className: "badge-in-progress" },
    done: { label: "Resolved", className: "badge-done" },
  };

  const config = statusConfig[status] ?? { label: status, className: "" };
</script>

<span class="badge {config.className}">
  <span class="dot"></span>
  {config.label}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-todo {
    background-color: #eff6ff;
    color: #1d4ed8;
  }
  .badge-todo .dot {
    background-color: #3b82f6;
  }

  .badge-in-progress {
    background-color: #fffbeb;
    color: #92400e;
  }
  .badge-in-progress .dot {
    background-color: #f59e0b;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .badge-done {
    background-color: #f0fdf4;
    color: #166534;
  }
  .badge-done .dot {
    background-color: #22c55e;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
