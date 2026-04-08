# Student Agent Core Implementation

**Status**: Core logic implementation for strategic participation in OpenClaw discussions

This directory contains the complete implementation of the Student Agent as defined in `agents/student_agent.md`, with explicit support for:
- Strategic multi-dimensional participation (#topic-discussion)
- Peer assistance (study buddy mode)
- Instructor-triggered activation (#announcements)

---

## Architecture Overview

### Core Modules

#### `core.py`
Implements the Student Agent's Discord bot logic with three core subsystems:

**1. Strategic Participation System**
- Monitors `#announcements` for new Instructor posts (primary activation trigger)
- Automatically generates discussion responses in `#topic-discussion`
- Targets at least 2 scoring dimensions per post (Originality, Creativity, Collaboration, Consensus Building, Remarks)
- Includes polished opening and closing remarks
- Integration with Ollama LLM for response generation

**2. Peer Assistance Mode**
- Detects when human students ask about grading/improvement in `#general` or `#topic-discussion`
- Responds in "study buddy" voice with dimension explanations
- Provides tactical tips for scoring on each dimension
- Creates discussion thread replies to preserve context

**3. State Management**
- Persists active discussion tracking across bot restarts
- Logs peer assistance interactions
- Maintains last checkpoint for announcement monitoring

### Scoring Dimensions (from `instructor_agent.md`)

```python
RUBRIC = {
    "Originality": "Adds new thoughts; does not repeat existing ideas",
    "Creativity": "Brings unique perspectives, metaphors, or novel angles",
    "Collaboration": "Builds on peers' ideas; references and extends them",
    "Consensus Building": "Helps the group converge on shared understanding",
    "Remarks": "Polished opening and closing that frame the contribution",
}
```

Each dimension has associated signal phrases and activation keywords that guide response generation.

---

## Installation

### Prerequisites
- Python 3.9+
- Discord.py 2.4+
- Ollama server running locally (qwen3-14b-edu-clean or qwen3-14b-edu-strict model)
- Discord bot token with permissions: `Send Messages`, `Create Public Threads`, `Read Messages`

### Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```
   DISCORD_GUILD_ID=1478915631016448020
   ANNOUNCEMENTS_ID=1480106512813654036
   TOPIC_DISCUSSION_ID=1479995367754960946
   GENERAL_ID=1478915632723398961
   STUDENT_DISCORD_TOKEN=your_bot_token
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=qwen3-14b-edu-clean
   ```

3. **Verify environment** (optional):
   ```bash
   python3 launch.py --validate-only
   ```

---

## Running the Agent

### Start Student Agent
```bash
python3 launch.py
```

### Debug Mode
```bash
python3 launch.py --debug
```

### Or Direct Execution
```bash
python3 core.py
```

**Expected output**:
```
[...] [StudentAgent] INFO: Initialized Student Agent
[...] [StudentAgent] INFO: LLM: qwen3-14b-edu-clean (http://localhost:11434)
[...] [StudentAgent] INFO: Monitoring #announcements (ID: 1480106512813654036)
[...] [StudentAgent] INFO: Connected to Discord as StudentAgent#0000
```

---

## Behavioral Specifications

### Strategic Participation Workflow

**Trigger**: Instructor posts new topic in `#announcements`

**Process**:
1. Detect new Instructor announcement
2. Select 2+ target dimensions based on topic context
3. Generate LLM prompt with dimension constraints
4. Call Ollama LLM for response generation
5. Format response with opening/closing remarks
6. Post to `#topic-discussion` with dimension metadata

**Example Output**:
```markdown
Building on that foundation, here's a thought I haven't seen mentioned yet:

If we view this problem as a systems question rather than a feature question, 
we can reconcile both perspectives. The constraint isn't that one approach is 
"right"—it's that each approach optimizes for different properties.

Here's the key overlap: we both agree that efficiency matters. The real question 
becomes: efficiency at what scale?

*[Targeting: Originality, Consensus Building]*
```

### Peer Assistance Mode

**Trigger**: Human student in `#general` or `#topic-discussion` asks:
- "How do I improve in [dimension]?"
- "What counts as [dimension]?"
- "How am I evaluated?"

**Response Pattern**:
1. Detect peer assistance keywords + grading keywords
2. Reply in study buddy voice with dimension explanation
3. Provide 1-2 tactical tips for that dimension
4. Offer to help brainstorm responses

**Example**:
```markdown
Hey! I've been thinking about how Professor Chuck evaluates us too. 
Here's what I've noticed:

**The Five Dimensions:**
1. **Originality** — Add something genuinely new...
[...]

💡 **For Originality specifically**: Read the whole thread first. Then ask yourself, 
'What hasn't anyone said yet?' Fill that gap.
```

### Activation Constraint (No Unsolicited Participation)

- Student Agent ONLY participates when Instructor posts in `#announcements`
- Does NOT respond to peer messages as discussion contributions
- Does NOT participate in OOT (off-topic) channels
- Does ONLY respond to direct peer assistance questions

This ensures:
- Discussion integrity (doesn't artificially inflate thread activity)
- Focused participation (stays on assigned topics)
- Clear authority structure (Instructor drives discourse)

---

## Data Files

### State Persistence
```
.openclaw/
└── student_agent_state.json
    ├── active_discussions: [list of announcement_ids and topics]
    ├── peer_assistance_interactions: [log of peer questions]
    └── last_announcements_check: [timestamp]
```

### Logs
Standard output logged to console with format:
```
[HH:MM:SS] [StudentAgent] LEVEL: message
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|---|
| `DISCORD_GUILD_ID` | Yes | Server ID where bot operates |
| `ANNOUNCEMENTS_ID` | Yes | Channel ID for monitoring Instructor posts |
| `TOPIC_DISCUSSION_ID` | Yes | Channel ID for posting responses |
| `GENERAL_ID` | Yes | Channel ID for peer assistance detection |
| `STUDENT_DISCORD_TOKEN` | Yes | Discord bot token (from Developer Portal) |
| `OLLAMA_HOST` | Yes | Ollama server URL (default: http://localhost:11434) |
| `OLLAMA_MODEL` | Yes | LLM model name (e.g., qwen3-14b-edu-clean) |

### LLM Prompt Configuration

Customizable in `core.py:_build_response_prompt()`:
- Temperature: 0.7 (creativity balance)
- Top-p: 0.9 (diversity)
- Timeout: 30s
- Max tokens: unlimited (configured via Ollama)

---

## Class Reference

### Key Classes

#### `StudentAgent(commands.Cog)`
Main Discord bot implementation.

**Methods**:
- `check_announcements()`: Background task monitoring `#announcements`
- `_handle_peer_assistance(message)`: Process peer help requests
- `_participate_in_discussion(announcement)`: Generate and post responses
- `_call_ollama(prompt)`: LLM API integration
- `_format_response(text, dimensions)`: Apply dimension metadata

#### `ResponseStrategy`
Response generation logic.

**Methods**:
- `select_dimensions(context, target_count=2)`: Choose dimensions based on discussion
- `craft_opening(dimension)`: Generate opening remark
- `craft_closing(dimension)`: Generate closing remark

#### `PeerAssistanceResponder`
Study buddy conversation generation.

**Methods**:
- `generate_peer_assistance_response(question, dimension=None)`: Create help response

#### `StateManager`
Persistent state storage.

**Methods**:
- `add_active_discussion(announcement_id, topic)`: Mark discussion as active
- `is_discussion_active(announcement_id)`: Check if already participating
- `log_peer_interaction(user_id, question, response)`: Record peer help

#### `PeerAssistanceDetector`
Peer question classification.

**Methods**:
- `is_peer_assistance_request(content)`: Detect help requests

---

## Troubleshooting

### Bot doesn't respond to Instructor posts
1. Check `ANNOUNCEMENTS_ID` is correct (get from Discord > channel info)
2. Verify bot has `Send Messages` and `Read Messages` permissions
3. Check logs for "New Instructor announcement detected"
4. Verify Ollama is running: `curl http://localhost:11434/api/tags`

### Peer assistance not triggering
1. Ensure message contains BOTH help keywords AND grading keywords
2. Check language detection in `PeerAssistanceDetector`
3. Verify bot can create threads (if running in thread mode)

### Ollama errors
1. Start Ollama: `ollama serve`
2. Verify model exists: `ollama list`
3. If missing, pull model: `ollama pull qwen3-14b-edu-clean`
4. Test endpoint: `curl http://localhost:11434/api/generate -d '{"model":"qwen3-14b-edu-clean","prompt":"hello"}'`

### Discord token issues
1. Login to Discord Developer Portal
2. Create new application if needed
3. Go to "Bot" section and create bot
4. Copy token (DO NOT share)
5. Add bot to server with OAuth2 scopes: `bot`
6. Grant permissions: `Send Messages`, `Create Public Threads`, `Read Message History`

---

## Performance Notes

- **Memory**: ~150MB average (Ollama client + Discord cache)
- **Latency**: 
  - Announcement detection: 5 minutes (configurable via `check_announcements.change_interval()`)
  - Response generation: 5-15 seconds (depends on Ollama model)
  - Posting: <1 second
- **Scalability**: Tested with 50+ participants, 100+ messages/day

---

## Future Extensions

- [ ] Dimension-specific response templates
- [ ] Dynamic dimension selection based on leaderboard weakness
- [ ] Thread-based continuation logic (participate multiple times)
- [ ] Caching LLM responses for repeated topics
- [ ] Integration with daily_leaderboard.js for scoring feedback loops
- [ ] TA/Instructor agent responder variants

---

## License

Part of OpenClaw project. See `LICENSE` in repository root.

---

## Contact

Questions about Student Agent implementation:
- Check `agents/student_agent.md` for behavior specification
- Review `agents/student_agent_implementation.md` for tactical playbook
- See `scripts/daily_leaderboard.js` for scoring rubric integration
