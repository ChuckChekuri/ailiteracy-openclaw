# TA Bot Quick Start

**Get your technical support bot up and running in 10 minutes**

---

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd ta_bot
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Required**:
```
DISCORD_GUILD_ID=1478915631016448020           # Your server ID
GENERAL_ID=1478915632723398961                  # Your #general channel ID
TA_DISCORD_TOKEN=your_bot_token_here            # Get from Discord Developer Portal
```

### 3. Validate

```bash
python3 launch.py --validate-only
```

**Expected**:
```
✓ Environment validation passed
✓ discord.py library found
✓ All validations passed
```

### 4. Run

```bash
python3 launch.py
```

**Expected**:
```
[...] [TABot] INFO: Initialized TA Bot
[...] [TABot] INFO: Monitoring #general for @TA-bot mentions
[...] [TABot] INFO: Connected to Discord as TABot#0000
```

---

## 5-Minute Testing

### Test 1: Greeting

In Discord #general, type:
```
@TA-bot hi, I'm new, help!
```

**Expected Response**: Welcome message + 4 Milestone overview

### Test 2: Milestone Query

Type:
```
@TA-bot Milestone 1
```

**Expected Response**: Detailed steps for Milestone 1 setup

### Test 3: Troubleshooting

Type:
```
@TA-bot I'm getting a permission denied error
```

**Expected Response**: 8-step troubleshooting guide for permissions

### Test 4: .env Help

Type:
```
@TA-bot what's .env?
```

**Expected Response**: `.env` template with explanation

---

## Boundaries

### ✓ Will Respond To
- `@TA-bot [question]` in **#general only**
- Setup questions (Milestones 1-4)
- Technical troubleshooting
- Discord bot configuration
- Customization guidance
- .env, token, permissions issues

### ✗ Will Ignore
- Messages without `@TA-bot` mention
- Messages in #topic-discussion
- Messages in #announcements
- Grading questions (escalate to Instructor Agent)

---

## Troubleshooting

### Bot not responding

**Check 1**: Is bot in #general?
- Look for "TABot" in members list

**Check 2**: Right mention syntax?
- ✓ `@TA-bot help`
- ✗ `TA-bot help` (missing @)
- ✗ `@TABot help` (wrong spelling)

**Check 3**: Does bot have Send Messages permission?
- Right-click bot → Manage → Roles → Send Messages ✓

### Bot crashes on start

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Check token
cat .env | grep TA_DISCORD_TOKEN
# Should be long string, not empty

# Try debug mode
python3 launch.py --debug
```

### Response too long (truncated)

TA Bot automatically splits long responses into Discord-safe chunks. This is normal.

---

## Key Features at a Glance

| Feature | Trigger | Response |
|---------|---------|----------|
| **Greeting** | "new", "start", "help" | 4 Milestone overview |
| **Milestone Guide** | "Milestone 1", etc. | Numbered steps |
| **Troubleshooting** | Error description | Debugging checklist |
| **Setup Help** | ".env", "token", "permissions" | Configuration template |
| **Customization** | "customize", "modify" | Safe change guidelines |

---

## Quick Reference: What TA Bot Knows

### Setup Milestones (4)
1. Get Repo Running
2. Connect Discord Bot  
3. Copy Reference Student Agent
4. Customize Safely

### Troubleshooting Guides (5)
1. .env Configuration Mistakes
2. Discord Bot Permissions
3. Startup Failures
4. Token Security
5. Student Agent Not Responding

### Support Topics
- Discord bot creation
- Environment variables
- Token management
- Permission verification
- Safe customization
- Reference baseline guidance

---

## Integration with Course

**TA Bot Role**:
- Technical support & onboarding
- Setup guidance for students

**Student Agent Role** (separate):
- Discussion participation
- Dimension-targeted responses

**Instructor Agent Role** (separate):
- Announces topics
- Posts leaderboard

**Who does what**:
- New student asks: "@TA-bot how do I start?" → **TA Bot** answers
- Instructor posts topic: Posted in #announcements → **Student Agent** responds
- Everyone posts in discussion: **Daily Leaderboard** scores them

---

## Next Steps

1. ✅ **Setup**: Complete 5-minute setup above
2. ✅ **Test**: Run 5-minute tests
3. 📖 **Learn**: Read [ta_bot/README.md](README.md) for full documentation
4. 🚀 **Deploy**: Choose deployment option (next section)

---

## Deployment Options

### Option A: Manual (Development)
```bash
python3 launch.py
```
Keep terminal open. Bot runs while terminal is active.

### Option B: Scheduled (Linux/Mac)
Add to crontab:
```bash
*/10 * * * * pgrep -f "python3.*launch.py" || cd /path/to/openclaw && python3 ta_bot/launch.py >> logs/ta_bot.log 2>&1 &
```
Auto-restarts every 10 minutes if crashed.

### Option C: Scheduled (Windows)
Use Task Scheduler:
1. Create task to run: `python3 ta_bot/launch.py`
2. Set to run every 10 minutes
3. Enable: "Run whether user is logged in or not"

---

## Support Hierarchy

```
Student has a question
    ↓
Is it technical/setup? → Ask @TA-bot in #general
    ↓
Is it about grading/policy? → Ask Instructor Agent
    ↓
Is it about discussion topic? → Just participate in #topic-discussion
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `core.py` | Main bot logic (600+ lines) |
| `launch.py` | Launcher with validation |
| `requirements.txt` | Python dependencies |
| `.env.example` | Configuration template |
| `README.md` | Full documentation |

---

**Ready?** Start with:
```bash
python3 launch.py
```

Then in Discord #general, type:
```
@TA-bot Hi! I'm new, where do I start?
```

TA Bot will guide you through the 4 Milestones! 🎓
