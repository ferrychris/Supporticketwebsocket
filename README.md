# SupportDesk ── Engineering Evaluation

SupportDesk is a premium, real-time support ticket management platform. It combines a seamless user experience for customers with a powerful, reactive dashboard for support agents.

## 🚀 My Approach

My goal was to build a system that feels "alive." Instead of a static CRUD app, I focused on high-fidelity interactions and real-time data synchronization.

### The Tech Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) was chosen for its exceptional reactivity and lean component architecture.
- **Backend/Database**: [Supabase](https://supabase.com/) provides the engine for Authentication, PostgreSQL storage, and real-time database listeners.
- **Aesthetics**: **Vanilla CSS** with modern variables. I avoided utility frameworks to implement a bespoke design system featuring glassmorphism, smooth micro-animations, and a "SD" brand identity.

### High-Level Logic

- **Real-time Threads**: Messages are synchronized across clients using Supabase Realtime, ensuring no manual refreshes are needed.
- **Secure by Design**: Implemented PostgreSQL Row-Level Security (RLS) to ensure users only see their own tickets while agents retain full visibility.
- **Professional Workflow**: Tickets move through a structured state machine: **Open** → **In Progress** → **Resolved**.

## ⚖️ Key Tradeoffs

Any engineering project involves choices. Here the primary ones:

1.  **Vanilla CSS over Tailwind**: While Tailwind is faster for prototyping, I opted for pure CSS to demonstrate a deep understanding of layouts (Grid/Flex) and to achieve a more unique, crafted aesthetic that utility classes can sometimes make generic.
2.  **Lightweight State Management**: I utilized Svelte's built-in stores and reactive statements rather than a heavy state management library. This reduces the application's footprint and makes the data flow easier to trace.
3.  **Supabase Realtime vs. Custom WebSockets**: I chose Supabase's managed real-time layer. This allowed me to focus on the product's UX rather than infrastructure, though it trades off some fine-grained control over the socket protocol.

## 🛠️ How to Run

Follow these steps to get SupportDesk running locally:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Supabase](https://supabase.com/) project

### 2. Installation

```bash
# Clone the repository
git clone [repository-url]
cd ticketcrud

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PUBLIC_SUPABASE_URL=your-project-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Configuration

Run the following SQL scripts (found in `.sql` files or provided in my implementation logs) in your Supabase SQL Editor:

1.  **Schema Setup**: Define `tickets`, `ticket_messages`, and `profiles` tables.
2.  **Admin Logic**: Run the `create_admin_user.sql` to set up your support staff account.
3.  **Security Policies**: Run `fix_admin_chat.sql` to enable RLS for chat.

### 5. Start Developing

```bash
npm run dev
```

Open `http://localhost:5173` to view the app.

## 🔮 Future Improvements

With more time, I would have loved to implement:

- **File Attachments**: Enabling users to upload screenshots directly into the chat thread.
- **Advanced Search**: Implementing full-text search for tickets using PostgreSQL's GIN indexing.
- **Email Hooks**: Automatic email notifications for users when an agent replies to their ticket.
- **Performance Analytics**: A dashboard showing "Mean Time to Resolution" (MTTR) for support agents.

---

_Created by Ferdinard Raymond as part of the DonaLabs Engineering Evaluation._
