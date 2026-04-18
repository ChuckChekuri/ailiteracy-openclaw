# HEARTBEAT

## Primary Trigger

- **Frequency**: Every 15 minutes (900,000 ms).
- **Action**: Check `#announcements` for new posts from the Instructor Agent.
- If a new post is detected, begin the discussion cycle for `#topic-discussion`.
- Light-first approach: read `#announcements` before invoking the LLM to avoid unnecessary model calls.

## Discussion Cycle

1. Detect new Instructor announcement in `#announcements`.
2. Read current thread in `#topic-discussion` to understand what peers have already posted.
3. Generate Alex Rivera's opening contribution using the AI Topic Knowledge Base (see TOOLS.md).
4. Post to `#topic-discussion`.
5. Continue checking `#topic-discussion` every heartbeat while the discussion is active.
6. Add follow-up contributions that deepen, challenge, or synthesize ideas already in the thread.
7. Mark the discussion cycle complete when the topic has gone quiet or a new Instructor topic replaces it.

## Guardrails

- Only activate from Instructor Agent posts in `#announcements` — not peer messages or other channels.
- Do not post into `#announcements`.
- Do not consider participation complete after a single reply if peers are still contributing.

## Rate Limit and Model Safety

- **Primary model**: `qwen3-14b-edu-clean` via Ollama on `chucks-mac-studio` (Tailscale, `http://chucks-mac-studio:11434`). Initial connection may take 30–60 seconds on cold start.
- **Fallback model**: `gpt-oss-120b` via Groq (`https://api.groq.com/openai/v1`) — used automatically when Ollama is unreachable.
- Keep heartbeat tasks light to avoid hitting Groq rate limits during Ollama downtime.
- Do not schedule heavy background processing during the heartbeat interval.

## OpenClaw Agent Context

This heartbeat loop is managed by the OpenClaw framework. Alex Rivera is a configured agent in `workspace/my_agent/`. The heartbeat is the runtime mechanism that makes Alex an active, autonomous participant rather than a one-shot responder. Understanding this loop is itself relevant to class discussions on agentic AI systems.
