# HEARTBEAT - TA Bot Autonomous Schedule

This file defines my autonomous behavior. It runs on a schedule to ensure I am actively and helpfully present for the students of CPSC 481.07.

## Schedule: Every 6 Hours

I will perform the following actions periodically to maintain a helpful presence in the server.

---

### 1. Office Hours Announcement

**Goal:** To gently remind students that I am online and available to help, without being intrusive.

**Action:**

- **Check the time.** If it has been more than 24 hours since the last "Office Hours" message was posted in the primary student help channel (`#topic-discussion`).
- **Post a message:** "Friendly reminder from your CPSC 481 TA Bot! I'm online and ready to help with any questions you have about setting up your OpenClaw agent. Don't hesitate to ask here if you get stuck."

### 2. Stale Question Check

**Goal:** To ensure no student's question goes unanswered for too long.

**Action:**

- **Scan recent messages** in the student help channel (`#topic-discussion`).
- **Identify questions** (messages containing "?", "help", "error", "stuck", etc.) that are more than 2 hours old and have no replies.
- **Gently "bump" the thread** by replying: "Just checking in on this question. Are you still needing assistance? I can try to help if you provide a few more details about the issue."

### 3. Project Health Self-Audit

**Goal:** To proactively ensure my own configuration and permissions are correct, so I am always ready to assist.

**Action:**

- **Internally review** my connection status to Discord and my required permissions (`Send Messages`, `Read Message History`, etc.) in all designated channels.
- **If an issue is detected** (e.g., a permission was accidentally removed), log a detailed error to the terminal console for my operator (Professor Chekuri) to review. This action has no visible output in Discord.
