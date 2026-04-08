# Studio UI Guide

This doc describes the current Studio IA and behavior.

## Connection Onboarding

### First-run connection screen
- Studio now uses a full-screen connection flow before agent data loads.
- The onboarding teaches two separate links:
  1. Browser -> Studio
  2. Studio -> OpenClaw
- The screen offers three setup branches:
  1. Everything on this computer
  2. Studio here, OpenClaw in the cloud
  3. Studio and OpenClaw on the same cloud machine

### Core rule
- `localhost` always means the Studio host.
- If Studio and OpenClaw share a machine, the upstream should usually stay at `ws://localhost:18789`, even if that machine is a VPS.

### Gateway connection actions
- Connection fields are now draft-based rather than saved on every keystroke.
- The user can:
  - Save settings
  - Test connection
  - Disconnect the live Studio runtime
- Saved gateway tokens remain server-custodied; the browser sees whether a token is already stored, but not the token itself.

### Advanced connection editing
- The top-right plug menu still exposes Gateway connection settings.
- That panel is now an advanced edit surface for saved-vs-draft review, testing, and reconnecting after onboarding.

## Agent Surfaces

### Chat (default)
- Selecting an agent opens chat as the primary workspace.
- Chat header controls include:
  - New session
  - Personality shortcut
  - Settings shortcut
- New session resets the current agent session and clears visible transcript state in Studio.

### Settings Sidebar
- The settings cog opens one sidebar with four tabs:
  1. Personality
  2. Capabilities
  3. Automations
  4. Advanced

## Personality
- Personality is the first tab when opening settings.
- Rename agent lives in Personality.
- Personality file tabs are intentionally limited to:
  - Personality (`SOUL.md`)
  - Instructions (`AGENTS.md`)
  - About You (`USER.md`)
  - Identity (`IDENTITY.md`)
- Underlying persistence still saves the full gateway-backed agent file set.

## Capabilities
- Capabilities exposes direct controls (no role preset labels):
  - Run commands: Off / Ask / Auto
  - Web access: Off / On
  - File tools: Off / On
- Skills and Browser automation are visible as coming-soon toggles.

## Automations
- User-facing language is schedules/automations (not cron-first terminology).
- Schedule creation uses template -> task -> schedule -> review flow.
- Heartbeats are represented in this tab as coming soon.

## Advanced
- Advanced contains:
  - Display toggles (Show tool calls, Show thinking)
  - Open Full Control UI
  - Delete agent (danger zone)
- Session controls are not in Advanced.

## Agent Creation Defaults
- Create modal captures only name/avatar.
- After creation, Studio applies permissive defaults:
  - Commands: Auto
  - Web access: On
  - File tools: On
- Post-create UX keeps chat as primary and auto-opens Capabilities sidebar for onboarding.
