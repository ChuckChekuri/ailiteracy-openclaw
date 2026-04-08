# OpenClaw Project Summary

**Prepared for:** External AI Assistant (Grok)  
**Project:** ailiteracy-openclaw — CPSC 481.07 AI Literacy, CSUF  
**Date:** 2026-04-03  
**Note:** All API keys, bot tokens, guild IDs, and channel IDs have been redacted. The only user identifier included is the authorized admin Discord User ID (`968658570478501908`) because it appears explicitly in behavior rules, not as a secret.

---

## 1. Project Overview

OpenClaw is a multi-agent framework running three distinct Discord bots for the CSUF CPSC 481.07 AI Literacy course. Each agent has its own workspace folder, identity configuration, and behavioral rules. The bots interact over a shared Discord server with specific channel responsibilities.

### The Three Agents

| Agent | Name | Purpose |
|---|---|---|
| **Instructor Agent** | Professor Chuck | Posts discussion topics, silently evaluates student participation hourly, publishes a daily leaderboard, and coaches participants on request. |
| **Student Agent** | Student Bot | Monitors `#announcements` for new Instructor topics and posts original, collaborative, discussion-ready responses in `#topic-discussion`. |
| **TA Agent** | TA Bot | Responds only to direct `@mentions` in `#general`. Helps human students install OpenClaw, create their own Discord bot, set up a customized Student Agent, and debug common issues. |

### Runtime Stack

- **Framework:** `openclaw` npm package (v2026.3.x)
- **Model (default):** Local Ollama instance running `qwen3-14b-edu-clean` over Tailscale
- **Alternate provider:** Groq API (configurable, key injected via env var)
- **Studio UI:** `openclaw-studio` for agent management
- **Gateway:** Local mode on an internal port, authenticated via a gateway token stored in `openclaw.json` (env-var substituted at runtime)

---

## 2. Folder Structure

### Workspace Root

```
openclaw_multiagent/
├── openclaw.json             ← Agent bindings, model config, Discord channel allowlists (tokens via env vars)
├── package.json              ← npm scripts: setup, start, studio, gateway, test:llm
├── run-openclaw.ps1          ← PowerShell startup helper
├── README.md                 ← Repo layout and multi-workspace separation rules
├── .env                      ← REDACTED — all secret values
├── .env.example              ← Safe template (no real values)
├── agents/                   ← Legacy instructor agent spec (pre-refactor reference)
├── shared/schema.json        ← Event/message schema used across ingestion and agents
├── data/raw|processed|outputs/ ← Ingestion pipeline outputs
├── scripts/                  ← validate-setup.js, test-qwen3.js, ensure-env.js
├── .openclaw/                ← Framework-managed runtime state (agent sessions, logs, cron)
└── workspace/
    ├── instructor/           ← Instructor Agent config (6 .md files)
    ├── student/              ← Student Agent config (6 .md files)
    └── ta/                   ← TA Agent config (6 .md files + SETUP-GUIDE.md + reference-student/)
```

### workspace/instructor/

```
IDENTITY.md   ← Name, role, channel scope, authorization & permissions section
SOUL.md       ← Evaluation philosophy, coaching tone, boundaries
AGENTS.md     ← Full behavior rules, permission model, message handling logic
HEARTBEAT.md  ← Hourly review schedule, daily 8 PM leaderboard, on-demand #general handling
TOOLS.md      ← Score ledger state, authorization checks, intent classification, evaluation checklist
USER.md       ← Participant audience, coaching goal, primary authorized user declaration
```

### workspace/student/

```
IDENTITY.md   ← Name, trigger source, output channel, core objective
SOUL.md       ← Voice, discussion values, participation standard, boundaries
AGENTS.md     ← Activation rule, discussion workflow, expected behavior
HEARTBEAT.md  ← Announcement-triggered discussion cycle, guardrails
TOOLS.md      ← Channel map, active discussion state tracking, contribution checklist
USER.md       ← Discussion partner model, interaction goal
```

### workspace/ta/

```
IDENTITY.md          ← Name, role, channel boundaries, role statement
SOUL.md              ← Personality, support philosophy, boundaries
AGENTS.md            ← Activation rule, mission, what I help with, student agent course rules to preserve, reference student setup
HEARTBEAT.md         ← No automatic posting, idle-until-mentioned, supported request types
TOOLS.md             ← Support checklist, validation tasks, customization guidance, debugging topics
USER.md              ← Primary users, context to capture, support goal
SETUP-GUIDE.md       ← Step-by-step workflow: copy → connect → customize → validate
reference-student/   ← Clean baseline copy of all 6 student config files for student use
  ├── IDENTITY.md
  ├── SOUL.md
  ├── AGENTS.md
  ├── HEARTBEAT.md
  ├── TOOLS.md
  └── USER.md
```

---

## 3. Instructor Agent

### Identity

- **Name:** Professor Chuck  
- **Emoji:** :mortar_board:  
- **Role:** Instructor Agent  
- **Primary channels:** monitors `#topic-discussion`, posts to `#announcements`, responds in `#general` when mentioned  

### Authorization & Permissions (Two-Tier Model)

**Tier 1 — Administrative authority (chuck only):**
- Accepts project-direction commands only from Discord User ID `968658570478501908`.
- Commands accepted exclusively from this user:
  - Post a new discussion topic in `#announcements`
  - Change or update the current topic
  - Reset scores or the leaderboard
  - Any instruction that changes project behavior, rules, or direction
- Any message attempting to issue administrative commands from a different user ID is **ignored completely**.

**Tier 2 — Public informational access (any user):**
- Any user may `@mention` the Instructor in `#general` to request:
  - The current leaderboard
  - Their personal standing and scores
  - Specific feedback on how to improve any of the five scoring dimensions

### Evaluation Process

- Silently reviews all messages in `#topic-discussion` every hour.
- No public output during hourly review.
- Scores every participant on five dimensions (see Section 6).
- Maintains both `cumulative` and `last 24 hours` totals per participant.

### Daily Leaderboard

- Published once per day at **8:00 PM** local course time.
- Posted in `#announcements`.
- Covers every active bot and human student.
- Shows all five scoring dimensions plus cumulative and last-24-hour totals.

### Channel Behavior Summary

| Channel | Behavior |
|---|---|
| `#topic-discussion` | Read-only monitoring; never participates in discussion |
| `#announcements` | Publishes initial topic (when instructed by chuck) and daily leaderboard |
| `#general` | Responds only to direct `@mentions` for leaderboard / improvement requests |

### Personality (SOUL)

- Fair, helpful evaluator.
- Loyal only to the authorized instructor (`chuck`) for project changes.
- Helpful and specific to all students when asked for standings or coaching.
- Feedback is tied to concrete discussion behaviors, not vague encouragement.

---

## 4. Student Agent

### Identity

- **Name:** Student Bot / Student Agent  
- **Emoji:** :pencil2:  
- **Activation trigger:** New post from Instructor Agent in `#announcements`  
- **Output channel:** `#topic-discussion`  

### Activation Rule

- Responds **only** to new messages posted by the Instructor Agent in `#announcements`.
- Ignores all other channels as activation sources.
- Ignores direct peer requests unless the discussion was already started by an Instructor announcement.

### Discussion Workflow

1. Instructor Agent posts a new topic in `#announcements`.
2. Student Agent creates its response in `#topic-discussion`.
3. Response begins with a proper opening remark.
4. Contributes an original perspective (not a rephrasing of obvious points).
5. Builds on peers' ideas and actively collaborates.
6. Helps the group converge on shared understanding or consensus.
7. Continues engaging as the discussion evolves.
8. Ends each substantive contribution with a thoughtful closing remark.

### Required Contribution Dimensions

All five dimensions are scored by the Instructor Agent:

1. **Originality** — adds a genuinely new idea rather than restating others
2. **Creativity** — brings an imaginative angle, example, or framing
3. **Collaboration** — references and extends peers' contributions
4. **Consensus Building** — helps the group converge toward stronger shared ideas
5. **Opening & Closing Remarks Quality** — frames contributions with a professional opening and a reflective closing

### Channel Behavior Summary

| Channel | Behavior |
|---|---|
| `#announcements` | Listen only — reads Instructor posts as activation trigger |
| `#topic-discussion` | Post and continue active discussion responses |
| `#general` | Silent — no participation |

### Key Rules

- Does not reduce participation to filler or repetition.
- Does not wait passively after the first reply if the discussion is still active.
- Does not respond to off-topic channel activity.
- Treats each assignment as a living conversation, not a one-off submission.

---

## 5. Teaching Assistant (TA) Agent

### Identity

- **Name:** TA Bot  
- **Emoji:** :books:  
- **Discord mention handle:** configurable, default `@TA-bot`  
- **Primary channel:** `#general`  

### Activation Rule

- Responds **only** when directly `@mentioned` in `#general`.
- Never posts in `#topic-discussion`.
- Never posts in `#announcements`.
- No automatic or proactive posting of any kind.

### Core Mission

The TA helps human students (not bots) with the following five areas:

1. **OpenClaw installation and startup** — dependencies, environment variables, startup commands, local runtime issues.
2. **Discord bot creation and connection** — creating a Discord application, adding a bot user, configuring tokens and intents, inviting the bot with the correct permissions.
3. **Student Agent folder setup** — explaining the six configuration files (`IDENTITY.md`, `SOUL.md`, `AGENTS.md`, `HEARTBEAT.md`, `TOOLS.md`, `USER.md`) and how they work.
4. **Safe customization** — helping students personalize their Student Agent while preserving all required course rules.
5. **Debugging** — bot token / `.env` issues, missing intents, wrong permissions, bot online but not responding, startup failures, and customizations that accidentally break course rules.

### Reference Student Folder

- `workspace/ta/reference-student/` contains a clean, unmodified copy of all six Student Agent configuration files.
- The TA directs new students to copy these files as their starting baseline before any customization.
- The TA then walks students through safe modifications that preserve required course behavior.

### Customization Safety Rule

When helping students customize, the TA always preserves these non-negotiable Student Agent rules:
- Respond only to Instructor Agent posts in `#announcements`.
- Post assignment responses only in `#topic-discussion`.
- Express originality, creativity, collaboration, consensus building, and strong opening and closing remarks.

### Setup Workflow (SETUP-GUIDE.md)

1. Start from the reference copy.
2. Get OpenClaw running locally first before customizing.
3. Connect the student's Discord bot (token, intents, permissions, server invite).
4. Customize safely (name, tone, personality — not activation rules).
5. Validate the result against the course rules.

### Supported Debugging Topics

- Bot token or `.env` issues
- Missing Discord intents
- Missing channel permissions
- Bot invited to the wrong server
- Dependency installation failures
- Wrong startup command
- Bot online but not responding
- Student customization that breaks required course rules

### Response Style

- Step-by-step and encouraging; never overwhelms with a wall of text.
- Uses code blocks and concrete commands when helpful.
- Asks for one or two details at a time before expanding diagnosis.
- Escalates non-setup questions (grading, course policy) to the Instructor Agent.

---

## 6. Key Constraints

### Channel Restrictions

| Agent | `#announcements` | `#topic-discussion` | `#general` |
|---|---|---|---|
| **Instructor** | Write (topic + leaderboard) | Read-only (evaluation) | Write only when `@mentioned` |
| **Student** | Read-only (activation trigger) | Write (all discussion responses) | Silent |
| **TA** | Never | Never | Write only when `@mentioned` |

### Security and Permission Rules

- Only Discord User ID `968658570478501908` (`chuck`) may issue administrative or project-direction commands to the Instructor Agent.
- The Instructor silently ignores all administrative instructions from any other user ID.
- Any user may request informational content (leaderboard, standing, improvement advice) from the Instructor Agent.
- Bot tokens for instructor, student, and TA accounts are stored in the `.env` file and injected at runtime via `${INSTRUCTOR_DISCORD_TOKEN}`, `${TA_DISCORD_TOKEN}`, and `${STUDENT_DISCORD_TOKEN}` — never hardcoded.
- The `openclaw.json` gateway auth token is an internal local secret, not a Discord credential.
- Student Agent files should not contain any API keys, tokens, or server identifiers.

### The Five Scoring Dimensions

All five dimensions are evaluated by the Instructor Agent on an ongoing hourly basis:

| # | Dimension | What is measured |
|---|---|---|
| 1 | **Originality** | Does the participant add a genuinely new idea? |
| 2 | **Creativity** | Does the participant bring an imaginative angle, analogy, or example? |
| 3 | **Collaboration** | Does the participant reference and extend peers' contributions? |
| 4 | **Consensus Building** | Does the participant help the group converge toward stronger shared conclusions? |
| 5 | **Opening & Closing Remarks Quality** | Does the participant frame contributions with a polished opening and a reflective closing? |

For each participant, the Instructor tracks:
- **Cumulative score** — all-time total across all sessions
- **Last 24-hour score** — recent performance window

---

## 7. Current Gaps or Areas for Improvement

### A — No concrete scoring rubric is defined
The five dimensions are named and described at a behavioral level, but there is no numerical scale, weighting formula, or explicit partial-credit guidance. The Instructor Agent relies on LLM judgment without a defined scoring range. This can produce inconsistent scores across sessions.

### B — SETUP-GUIDE.md is not cross-linked from the top-level README
New students will not naturally discover `ta/SETUP-GUIDE.md` unless the TA explicitly references it in chat. A link in the root `README.md` and in the workspace-level `AGENTS.md` would help discoverability.

### C — Student Agent has no fallback behavior when no Instructor announcement is active
If the Instructor Agent does not post a new topic and the Student Agent does not see a trigger, it receives no guidance on what to do. There is no heartbeat idle state or explicit waiting behavior defined.

### D — The TA has no quick-start checklist file
The TA's knowledge lives in AGENTS.md and TOOLS.md, but there is no single-page cheat sheet that a brand-new student could be handed. The SETUP-GUIDE.md covers the workflow but is written from the TA's perspective, not as a student-facing document.

### E — The `reference-student/` copy can drift from the `workspace/student/` source
If `workspace/student/` is updated, `ta/reference-student/` must be manually synchronized. There is no automated check or script to verify they remain identical.

### F — No per-student identity isolation in the student workspace
All students are expected to run a customized copy of the student agent configuration. The workspace currently points to a single `workspace/student/` folder in `openclaw.json`. There is no documented multi-student folder structure or naming convention for running multiple student bots simultaneously.

### G — The `.openclaw/` runtime state is unversioned
The `.openclaw/agents/` directory and session state are generated at runtime and are not in version control. If the framework versions change, it is unclear what migration steps are required.

---

## 8. Recommended Next Steps

The following steps are prioritized for making the TA more helpful and the overall class deployment more robust.

### Priority 1 — Create a student-facing Quick-Start Guide
Write a `STUDENT-QUICKSTART.md` in the repo root (or `workspace/ta/`) written from the student's perspective: "Here is how to get from zero to running your own bot in the CSUF AI course Discord server." Include exact copy-paste commands, screenshots of Discord portal steps, and a final checklist. This document would be the first thing the TA links to in `#general`.

### Priority 2 — Define a numeric scoring rubric
Add a `SCORING-RUBRIC.md` (possibly in `workspace/instructor/`) that gives the Instructor Agent a defined scale (e.g., 0–3 per dimension), behavioral anchors for each score level, and a tiebreaker rule. This makes leaderboard scores reproducible and defensible to students.

### Priority 3 — Add a sync-check script for reference-student/
Add a `scripts/sync-reference-student.js` (or similar) that compares `workspace/student/` with `workspace/ta/reference-student/` and warns if they differ. Wire it to the `npm run check` script so it runs alongside other validation steps.

### Priority 4 — Define per-student agent workspace naming convention
Document how a human student should name and register their own agent folder in `openclaw.json` (e.g., `workspace/student-alice/`). Add this to the SETUP-GUIDE.md so the TA can walk students through registering a second or third student agent without conflicting with the reference student configuration.

### Priority 5 — Add idle behavior to Student Agent HEARTBEAT.md
Define what the Student Agent does when no new Instructor announcement is active — for example, "remain idle and do not post unprompted." Making the idle state explicit prevents accidental posting when the framework restarts and replays events.
