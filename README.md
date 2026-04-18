# ailiteracy-openclaw

OpenClaw multi-agent setup for CPSC 481.07 with three coordinated agents:

- instructor
- student
- ta

## Repository Layout

- openclaw.json
- .env (local, not committed)
- workspace/
  - instructor/
    - AGENTS.md
    - HEARTBEAT.md
    - IDENTITY.md
    - SOUL.md
    - TOOLS.md
    - USER.md
  - student/
    - AGENTS.md
    - HEARTBEAT.md
    - IDENTITY.md
    - SOUL.md
    - TOOLS.md
    - USER.md
  - ta/
    - AGENTS.md
    - HEARTBEAT.md
    - IDENTITY.md
    - SOUL.md
    - TOOLS.md
    - USER.md

Agent IDs configured in `openclaw.json`:

- `instructor`
- `student`
- `ta`

## Separation Rules

- All three agents run through one OpenClaw gateway process.
- Each agent has its own workspace folder under `workspace/`.
- Discord access is segmented per-agent via `bindings` + `channels.discord.accounts` in `openclaw.json`.
- Root `.env` is used for tokens, guild IDs, channel IDs, and provider keys.

## Environment Setup

1. Run setup:

```bash
npm run setup
```

1. Create and fill root `.env` from `.env.example`.

- Required values include:
  - `DISCORD_GUILD_ID`
  - `INFO_ANNOUNCEMENTS_CHANNEL_ID`
  - `TOPIC_DISCUSSION_ID`
  - `GENERAL_ID`
  - `INSTRUCTOR_DISCORD_TOKEN`
  - `STUDENT_DISCORD_TOKEN`
  - `TA_DISCORD_TOKEN`
  - `OPENCLAW_GATEWAY_TOKEN`

## Running Gateway

```bash
npm run gateway
```

or

```bash
./run-openclaw.ps1 gateway
```

## Agent Channel Responsibilities

- Student agent:
  - Responds in #topic-dicussion



## Validation

```bash
npm run check
```

- `npx openclaw doctor` can validate config.
- Prefer running commands through `run-openclaw.ps1` or `npm run gateway` so `.env` values are loaded into the process.`r`n


channel config in onboard screen
1478915631016448020/1480106512813654036,1478915631016448020/1479995367754960946,1478915631016448020/1478915632723398961