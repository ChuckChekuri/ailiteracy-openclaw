# TA Bot - Technical Support & Onboarding

**Status**: Complete implementation of teaching assistant support agent for OpenClaw

This directory contains the TA Bot implementation, a Discord-based technical support agent that guides students through onboarding and troubleshooting.

---

## Overview

The TA Bot provides structured support for OpenClaw students across four key areas:

### 1. **Quick-Start Workflow** (4 Milestones)
Guides new students through setup with clear, sequential milestones:
- Milestone 1: Get Repo Running
- Milestone 2: Connect Discord Bot
- Milestone 3: Copy Reference Student Agent
- Milestone 4: Customize Safely

### 2. **Technical Troubleshooting**
Structured debugging guides for common issues:
- `.env` Configuration Mistakes
- Discord Bot Permissions
- Startup Failures
- Token Security (if exposed)
- Student Agent Not Responding

### 3. **Discord Bot Setup**
Step-by-step guidance for creating and configuring Discord bots

### 4. **Safe Customization**
Helps students personalize their Student Agent while preserving course rules

---

## Core Features

### Mention-Based Activation
- **Only responds when**: Student types `@TA-bot [question]` in `#general`
- **Never speaks in**: `#topic-discussion`, `#announcements`
- **Respects boundaries**: No unsolicited participation

### Intelligent Routing
Questions automatically routed to appropriate handler:
```
"Hey @TA-bot, I'm new, where do I start?"
  → Greeting + 4 Milestone Overview

"@TA-bot Milestone 1: Get Repo Running"
  → Detailed steps for Milestone 1

"@TA-bot permission denied error"
  → Discord Permissions troubleshooting guide

"@TA-bot how do I customize?"
  → Safe customization guidelines
```

### Structured Voice
- Patient and detail-oriented
- Numbered lists for all procedural steps
- Confirmation checks before advancing
- Progressive problem narrowing (don't expand scope)
- Celebration of progress after fixes

### State Tracking
- Remembers which milestone each student is on
- Logs all support interactions for future reference
- Provides context for returning students

---

## Installation

### Prerequisites
- Python 3.9+
- Discord.py 2.4+
- Discord bot token with permissions: `Send Messages`, `Read Messages`

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
   GENERAL_ID=1478915632723398961
   TA_DISCORD_TOKEN=your_bot_token
   ```

3. **Verify environment**:
   ```bash
   python3 launch.py --validate-only
   ```

---

## Running the Bot

### Start TA Bot
```bash
python3 launch.py
```

### Debug Mode
```bash
python3 launch.py --debug
```

### Expected Output
```
[...] [TABot] INFO: Initialized TA Bot
[...] [TABot] INFO: Monitoring #general for @TA-bot mentions
[...] [TABot] INFO: Connected to Discord as TABot#0000
[...] [TABot] INFO: Guild: Your Course Server
```

---

## Usage Examples

### Student: "Hi @TA-bot, I'm new, can you help?"

**TA Bot Response**:
```
Hi Sarah! 👋 Welcome to OpenClaw setup help.

I'm here to help you:
1. Get the repo running
2. Connect a Discord bot
3. Copy the reference Student Agent
4. Customize safely

Are you brand new to this, or are you already working on a specific step?
```

### Student: "@TA-bot Milestone 2: Connect Discord Bot"

**TA Bot Response**:
```
**Milestone 2: Connect Discord Bot** — Create your own Discord bot and get the token

**Steps:**
1. Go to Discord Developer Portal: https://discord.com/developers/applications
2. Click 'New Application', give it a name (e.g., 'My-Student-Agent')
3. Go to 'Bot' section, click 'Add Bot'
4. Under TOKEN, click 'Copy' (⚠️ Never share this token)
5. Go to OAuth2 > URL Generator > Select scopes: 'bot'
6. Select permissions: 'Send Messages', 'Read Messages/View Channels', 'Create Public Threads'
7. Copy the generated URL and open it to add bot to your server
8. Paste token into your `.env` file

Once you've completed these steps, let me know and we'll move to Milestone 3.
```

### Student: "@TA-bot permission denied error"

**TA Bot Response**:
```
**Troubleshooting: Discord Bot Permissions**

Let's work through this step by step:

1. Go to Discord server, right-click bot user → 'Manage'
2. Check roles: Should have at least one role with these permissions:
   ✓ Send Messages
   ✓ Read Messages/View Channels
   ✓ Create Public Threads (if using threads)
3. If roles look correct, also check channel-level overrides:
   - Go to #general → Settings (gear) → Permissions → Find bot role
   - Verify 'Send Messages' is not explicitly denied (red X)
4. If still blocked, try giving bot a higher role (Admin test only)
5. Restart bot after permission changes: Stop and re-run `python3 launch.py`

Try the first step and let me know what happens!
```

### Student: "@TA-bot how do I customize my agent?"

**TA Bot Response**:
```
**Safe Student Agent Customization**

Great! You can make your agent unique while staying within course rules.

**IDENTITY.md:**
  ✓ Change agent Name (e.g., 'Alice-Bot' instead of 'Student Agent')
  ✓ Change Emoji to match personality
  ✓ Adjust Role description
  ✗ DO NOT change Primary Channel or Output Channel

**SOUL.md:**
  ✓ Rewrite voice tone and personality (sarcastic, formal, casual, etc.)
  ✓ Add personal examples or catchphrases
  ✓ Adjust discussion values and priorities
  ✗ DO NOT remove the five scoring dimensions
  ✗ DO NOT change when/where bot responds

**AGENTS.md:**
  ✓ Clarify activation logic in your own words
  ✓ Add agent-specific interaction details
  ✗ DO NOT change the activation rule (Instructor-only)
  ✗ DO NOT add responding to peer messages

**Protected Course Rules** (never change these):
• Only respond to Instructor posts in #announcements
• Never speak in #topic-discussion or #announcements
• Must target the five dimensions: Originality, Creativity, Collaboration, Consensus Building, Remarks
• Must include polished opening and closing remarks
```

---

## Supported Troubleshooting Guides

### 1. ".env Configuration Mistakes"
**Triggers**: "env error", "token invalid", "missing env", "channel id wrong"
**Steps**: 9-step guide covering file location, format, spacing, syntax, validation

### 2. "Discord Bot Permissions"
**Triggers**: "permission denied", "bot can't send", "no permission", "forbidden"
**Steps**: 8-step guide for role checks, channel overrides, permission verification

### 3. "Startup Failures"
**Triggers**: "bot won't start", "connection error", "failed to connect", "module not found"
**Steps**: 9-step guide covering error analysis, dependency installation, token verification

### 4. "Discord Token Exposure (SECURITY)"
**Triggers**: "token exposed", "token compromised", "i posted token by accident"
**Steps**: 7-step emergency guide for token regeneration and recovery

### 5. "Student Agent Not Responding"
**Triggers**: "student agent never posts", "no response", "agent silent", "bot inactive"
**Steps**: 8-step diagnostic guide for connectivity, permissions, configuration

---

## Class Reference

### Main Classes

#### `TABot(commands.Cog)`
Main Discord bot implementation.

**Methods**:
- `on_message(message)`: Detects @TA-bot mentions in #general
- `_handle_mention(message)`: Routes questions to appropriate handler
- `_route_question(question, context, user_name)`: Intelligent routing

#### `QuickStartWorkflow`
Manages the 4-milestone onboarding sequence.

**Methods**:
- `get_milestone_summary()`: Overview of all milestones
- `get_milestone_detail(milestone_num)`: Detailed steps for specific milestone

**Milestones**:
1. Get Repo Running (5 steps)
2. Connect Discord Bot (8 steps)
3. Copy Reference Student Agent (4 steps)
4. Customize Safely (5 steps)

#### `Troubleshooter`
Provides structured debugging support.

**Methods**:
- `detect_issue(message)`: Classify student's problem
- `get_guide_for_issue(guide)`: Format troubleshooting guide

**Guides** (5 total):
- .env Configuration Mistakes
- Discord Bot Permissions
- Startup Failures
- Token Exposure
- Student Agent Not Responding

#### `CustomizationGuide`
Helps with safe customization.

**Methods**:
- `get_customization_overview()`: Overview of safe/unsafe changes
- `validate_customization(soul_content)`: Verify student's changes meet requirements

#### `StateManager`
Tracks student progress and support history.

**Methods**:
- `get_student_context(user_id)`: Get student's current milestone and status
- `update_milestone(user_id, milestone)`: Track progress
- `log_interaction(user_id, type, content)`: Record support interaction

#### `ResponseGenerator`
Generates formatted responses.

**Methods**:
- `greeting(user_name, is_new)`: Welcome message
- `guide_next_step(current_milestone)`: Milestone guidance
- `permission_check_guide()`: Permission verification walkthrough
- `env_template()`: .env setup template

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|---|
| `DISCORD_GUILD_ID` | Yes | Server ID where bot operates |
| `GENERAL_ID` | Yes | Channel ID for mention monitoring |
| `TA_DISCORD_TOKEN` | Yes | Discord bot token |
| `ANNOUNCEMENTS_ID` | No | For context (informational) |
| `TOPIC_DISCUSSION_ID` | No | For context (informational) |

### Customization Points

**Response Templates** (in `ResponseGenerator`):
- `greeting()`: Change welcome message
- `guide_next_step()`: Adjust milestone instructions
- `env_template()`: Update .env template

**Milestone Details** (in `QuickStartWorkflow.MILESTONES`):
- Add/remove steps
- Modify descriptions
- Update with new workflow

**Troubleshooting Guides** (in `Troubleshooter.GUIDES`):
- Add new issue type
- Update detection keywords
- Modify steps

---

## Behavioral Specifications

### Activation: Mention-Only
```
✓ Responds to: "@TA-bot [question]" in #general
✗ Never speaks in: #topic-discussion, #announcements
✗ Never unsolicited: Doesn't respond to off-topic messages
```

### Voice: Patient & Structured
```
• Friendly and calm
• Detail-oriented for troubleshooting
• Numbered lists for procedures
• Confirmation checks before advancing
• Progressive narrowing (don't overwhelm)
• Celebrate progress after fixes
```

### Channel Boundaries
```
Monitoring: #general (only channel where it responds)
Restricted: #topic-discussion (never)
Restricted: #announcements (never)
```

### Support Philosophy
```
1. Solve one step at a time
2. Prioritize the next blocker
3. Explain why each step matters
4. Celebrate progress
5. Start with smallest next action if student is lost
```

---

## Deployment

### Local Development
```bash
python3 launch.py
```

### Scheduled (Linux/Mac)
```bash
# In crontab -e:
# Keep TA Bot running (restart every 10 min if crashed)
*/10 * * * * pgrep -f "python3 launch.py" || cd /path/to/openclaw && python3 ta_bot/launch.py
```

### Scheduled (Windows)
Use Task Scheduler to run `python3 ta_bot/launch.py` every 10 minutes

---

## Monitoring

### Check Bot Status
```bash
# See live activity
tail -f logs/ta_bot.log

# Filter for errors
grep ERROR logs/ta_bot.log

# Check mentions handled
grep "Mention detected" logs/ta_bot.log | wc -l
```

---

## Troubleshooting

### Bot not responding to mentions

**Check 1**: Verify bot is in #general
```bash
# In Discord, check members list in #general
```

**Check 2**: Verify bot has Send Messages permission
```bash
# Right-click bot → Manage → Roles → Send Messages ✓
```

**Check 3**: Verify token is correct
```bash
python3 launch.py --validate-only
```

### Bot crashes on startup

**Check 1**: Verify dependencies
```bash
pip install -r requirements.txt
```

**Check 2**: Check token format
```bash
# Should be long string from Discord Developer Portal
cat ta_bot/.env | grep TA_DISCORD_TOKEN
```

### Responses not appearing

**Check 1**: Verify mention syntax
```
✓ "@TA-bot help"
✗ "TA-bot help" (no @)
✗ "@TABot help" (wrong handle)
```

**Check 2**: Check channel
```
✓ #general
✗ #topic-discussion (ignored)
✗ #announcements (ignored)
```

---

## FAQ

**Q: Can the TA Bot answer grading questions?**
A: No. TA Bot handles setup/technical issues. Grading questions go to Instructor Agent.

**Q: What if a student needs help outside #general?**
A: They should mention @TA-bot in #general. TA Bot doesn't respond elsewhere.

**Q: Can I customize the troubleshooting guides?**
A: Yes. Edit `Troubleshooter.GUIDES` array in `core.py`.

**Q: Does TA Bot interfere with Student Agent?**
A: No. Different activation patterns: TA Bot (mentions in #general), Student Agent (Instructor posts in #announcements).

---

## References

- **Behavioral Specification**: `agents/ta_agent.md`
- **Related Systems**: 
  - Student Agent Core: `student_agent/core.py`
  - Daily Leaderboard: `scripts/daily_leaderboard.js`
  - Integration Guide: `STUDENT_AGENT_AUTOMATION.md`

---

## Summary

TA Bot provides **structured, patient technical support** that:
1. **Guides** students through 4-milestone setup workflow
2. **Troubleshoots** common configuration and permission issues
3. **Helps** students customize safely while preserving course rules
4. **Tracks** progress and provides personalized assistance
5. **Respects** boundaries (only #general, only when mentioned)

The key design principle: **One step at a time, with confirmation before moving forward.**
