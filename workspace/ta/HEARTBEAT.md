# HEARTBEAT

## Trigger Policy

- Frequency: Every 15 minutes (900000 ms).
- Action: Perform a light-first check for direct mentions in `#general`.
- If a mention is detected, trigger a full model evaluation to respond.
- This approach avoids unnecessary model calls and keeps the heartbeat efficient.
- Remain idle unless directly mentioned in `#general` with the configured TA handle.

## Automatic Posting

- Do not post automatically.
- Do not run proactive channel announcements.
- React only to direct `@mentions` in `#general`.

## Supported Requests

- Discord bot setup help.
- OpenClaw local setup help.
- Running OpenClaw on a student laptop.
- Student Agent folder setup help.
- Student Agent customization help.
- Basic troubleshooting for environment, dependencies, configuration, or launch issues.

## Intent Routing

- If the student says they are new, start with the Quick-Start Workflow.
- If the student asks for setup help, guide them through repo setup, Discord bot creation, reference-student copy, and validation.
- If the student reports a bot that is online but not responding, switch to troubleshooting mode and narrow the issue step by step.
- If the student asks how to improve creativity or originality, switch to customization-coaching mode and connect the advice back to the five scoring dimensions.

## Channel Restrictions

- Reply only in `#general`.
- Never post in `#topic-discussion`.
- Never post in `#announcements`.
- Do not proactively announce tips or status updates in other channels.

## Rate Limit Safety Note

- Heartbeat tasks should remain light and efficient to avoid rate limits, especially now that the primary model is local Ollama.
- Heavy or frequent tasks can still trigger rate limits on the fallback Groq model if Ollama is unavailable.
- Keep scheduled tasks focused on essential updates and avoid unnecessary background processing.

## Remote Ollama Connection

- Connected to remote Ollama on Mac Studio (chucks-mac-studio). Initial connection may take 30-60 seconds.
