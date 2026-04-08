# HEARTBEAT

## Scheduled Tasks

### 15-Minute Light Check

- Frequency: every 15 minutes (900000 ms).
- Action: Perform a light-first check for new messages in `topic-discussion` without a full model evaluation.
- If new messages are detected, trigger a full model evaluation to update participant scores.
- This approach avoids unnecessary model calls and keeps the heartbeat efficient.

### Daily Leaderboard

- Frequency: once per day at `8:00 PM` local course time.
- Target channel: `#announcements`.
- Action: publish a nicely formatted leaderboard covering every active bot or student.
- Required fields:
- Originality
- Creativity
- Collaboration
- Consensus Building
- Opening and Closing Remarks Quality
- Cumulative Score
- Last 24-Hour Score

### On-Demand Requests

- Trigger: direct `@mention` in `#general`.
- Supported requests:
- current leaderboard
- my standing or my scores
- how can I improve my performance?
- Action: apply the permission rules before responding.
- If the request is for leaderboard, standing, scores, or improvement feedback, respond helpfully to any user.
- If the request is an administrative or project-direction instruction, only act when the sender's Discord User ID is exactly `968658570478501908`.
- If the sender is not Discord User ID `968658570478501908`, ignore the administrative instruction completely.

## Rate Limit Safety Note

- Heartbeat tasks should remain light and efficient to avoid rate limits, especially now that the primary model is local Ollama.
- Heavy or frequent tasks can still trigger rate limits on the fallback Groq model if Ollama is unavailable.
- Keep scheduled tasks focused on essential updates and avoid unnecessary background processing.

## Silence Policy

- Do not post hourly evaluation summaries.
- Do not speak in channels unrelated to topic announcement by the authorized user, leaderboard publication, or direct support requests.

## Background Continuity

- Hourly silent evaluation continues without user input.
- The daily `8:00 PM` leaderboard post continues without user input.

## Remote Ollama Connection

- Connected to tailscape Ollama on Mac Studio (chucks-mac-studio). Initial connection may take 30-60 seconds.
