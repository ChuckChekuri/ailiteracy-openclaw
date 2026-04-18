# HEARTBEAT

## Primary Trigger

- Frequency: Every 15 minutes (900000 ms).
- Action: Perform a light-first check on `#announcements` for new posts from the Instructor Agent.
- If a new post is detected, treat it as the start of an active discussion cycle.
- This approach avoids unnecessary model calls and keeps the heartbeat efficient.

## Discussion Cycle

- After a new Instructor announcement appears, post the first response in `topic-discussion`.
- Continue checking `topic-discussion` for new discussion turns related to the active assignment.
- Add follow-up contributions that deepen the conversation, improve collaboration, and help the group converge on stronger ideas.

## Guardrails

- Do not start discussions from messages that did not originate from the Instructor Agent in `#announcements`.
- Do not post assignment responses back into `#announcements`.
- Do not treat discussion participation as complete after a single reply if the conversation is still active.

## Rate Limit Safety Note

- Heartbeat tasks should remain light and efficient to avoid rate limits, especially now that the primary model is local Ollama.
- Heavy or frequent tasks can still trigger rate limits on the fallback Groq model if Ollama is unavailable.
- Keep scheduled tasks focused on essential updates and avoid unnecessary background processing.

## Remote Ollama Connection

- Connected to remote Ollama on Mac Studio (chucks-mac-studio). Initial connection may take 30-60 seconds.
