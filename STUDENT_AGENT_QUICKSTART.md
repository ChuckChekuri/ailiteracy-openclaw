# Quick Start: Student Agent Automation

**Get up and running in 15 minutes**

---

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Install Node dependencies (for leaderboard)
cd scripts
npm install discord.js

# Install Python dependencies (for Student Agent)
cd ../student_agent
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy template
cp student_agent/.env.example student_agent/.env

# Edit with your values (Discord IDs and tokens)
# Get IDs from Discord: Right-click channel → Copy Channel ID
nano student_agent/.env
```

**Required values**:
```
DISCORD_GUILD_ID=1478915631016448020           # Your server ID
ANNOUNCEMENTS_ID=1480106512813654036           # Your #announcements ID
TOPIC_DISCUSSION_ID=1479995367754960946        # Your #topic-discussion ID
GENERAL_ID=1478915632723398961                 # Your #general ID
STUDENT_DISCORD_TOKEN=your_bot_token_here      # Get from Discord Developer Portal
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3-14b-edu-clean
```

### 3. Verify Ollama

```bash
# Start Ollama (if not already running)
ollama serve

# In another terminal, verify model
curl http://localhost:11434/api/tags

# If qwen3-14b-edu-clean not in list, pull it:
ollama pull qwen3-14b-edu-clean
```

### 4. Validate Configuration

```bash
cd student_agent
python3 launch.py --validate-only
```

**Expected output**:
```
✓ Environment validation passed
✓ discord.py library found
✓ Ollama connected (http://localhost:11434)
✓ Model 'qwen3-14b-edu-clean' available
✓ All validations passed
```

---

## 10-Minute Test Run

### Start Student Agent

```bash
cd student_agent
python3 launch.py
```

**Expected output**:
```
[HH:MM:SS] [StudentAgent] INFO: Initialized Student Agent
[HH:MM:SS] [StudentAgent] INFO: LLM: qwen3-14b-edu-clean (http://localhost:11434)
[HH:MM:SS] [StudentAgent] INFO: Monitoring #announcements (ID: 1480106512813654036)
[HH:MM:SS] [StudentAgent] INFO: Connected to Discord as StudentAgent#0000
[HH:MM:SS] [StudentAgent] INFO: Found guild: Your Server Name
[HH:MM:SS] [StudentAgent] INFO: Found topic channel: topic-discussion
```

### Test: Trigger Student Agent

1. Go to Discord #announcements
2. Post a test message: `"Discuss: What's the most important principle in machine learning?"`
3. Wait 5-6 minutes
4. Student Agent should post response in #topic-discussion

**If it works**: ✅ Core system operational
**If it doesn't**: See Troubleshooting below

### Test: Peer Assistance

1. Go to #general
2. Ask: `"How do I improve on Originality?"`
3. Student Agent replies in thread with study buddy tips

**If it works**: ✅ Peer assistance operational

### Test: Daily Leaderboard

```bash
cd scripts
node daily_leaderboard.js
```

**Expected output**:
```
[Leaderboard] Starting daily leaderboard automation...
[Leaderboard] Connected to Discord
[Leaderboard] Found guild: Your Server Name
[Leaderboard] Found topic channel: topic-discussion
[Leaderboard] Fetching messages from last 24 hours...
[Leaderboard] Found N messages to evaluate
[Leaderboard] ✅ Posted leaderboard to #announcements
```

**Result**: Leaderboard table posted to #announcements

---

## Deployment (Production)

### Option A: Manual (Development)

**Terminal 1: Student Agent** (keep running)
```bash
cd /path/to/openclaw_multiagent
python3 student_agent/launch.py
```

**Terminal 2: Daily Leaderboard** (run at 11:59 PM)
```bash
cd /path/to/openclaw_multiagent
node scripts/daily_leaderboard.js
```

### Option B: Scheduled (Linux/Mac)

1. Create startup script `start_student_agent.sh`:
```bash
#!/bin/bash
cd /path/to/openclaw_multiagent
python3 student_agent/launch.py >> logs/student_agent.log 2>&1
```

2. Edit crontab:
```bash
crontab -e
```

3. Add jobs:
```cron
# Keep Student Agent running (restart every 15 min if crashed)
*/15 * * * * pgrep -f "python3 student_agent" || /path/to/start_student_agent.sh

# Daily leaderboard at 11:59 PM
59 23 * * * cd /path/to/openclaw_multiagent && node scripts/daily_leaderboard.js >> logs/leaderboard.log 2>&1
```

### Option C: Scheduled (Windows)

1. Create scheduled tasks in Task Scheduler
2. Task 1: Run every 5 minutes
   ```
   Program: python.exe
   Args: /path/to/openclaw_multiagent/student_agent/launch.py
   ```

3. Task 2: Run daily at 11:59 PM
   ```
   Program: node.exe
   Args: /path/to/openclaw_multiagent/scripts/daily_leaderboard.js
   ```

---

## Monitoring

### Check Student Agent Status

```bash
# See live activity
tail -f logs/student_agent.log

# Filter for errors
grep ERROR logs/student_agent.log | tail -10

# Check participation
grep "Posted strategic response" logs/student_agent.log | wc -l
```

### Check Leaderboard Status

```bash
# See latest leaderboard posts
tail -f logs/leaderboard.log

# Check for errors
grep ERROR logs/leaderboard.log
```

### Manual Leaderboard Update

Force run leaderboard anytime:
```bash
node scripts/daily_leaderboard.js
```

---

## Troubleshooting

### Problem: Bot not responding to announcements

**Check 1**: Verify bot received permission
```bash
# In Discord: Right-click bot → Roles → Should have Send Messages, Read Messages
```

**Check 2**: Verify announcement was detected
```bash
grep "New Instructor announcement detected" logs/student_agent.log
```

**Check 3**: Verify Ollama is running
```bash
curl http://localhost:11434/api/tags
# Should return: {"models":[...]}
```

**Fix**:
1. Give bot Send Messages permission
2. Verify ANNOUNCEMENTS_ID is correct
3. Start Ollama: `ollama serve`

### Problem: Leaderboard not posting

**Check**: Verify previous leaderboard was deleted
```bash
# Leaderboard tries to delete yesterday's post
grep "Deleted previous leaderboard" logs/leaderboard.log
```

**Fix**: Manually delete old leaderboard post from #announcements, then re-run script

### Problem: Peer assistance not triggering

**Check**: Verify detection keywords
```bash
# Message must contain BOTH help words AND grading words
# ✓ "How do I improve on Collaboration?"  (help + dimension)
# ✗ "How do I improve my writing?"        (help, but no dimension)
```

**Fix**: Ask using both keywords: `"How do I get better at Originality scoring?"`

### Problem: "[Errno 11001] getaddrinfo failed"

**Cause**: Network issue or wrong Ollama host

**Fix**:
```bash
# Check connectivity
ping localhost

# Check Ollama is running
ps aux | grep ollama

# Verify OLLAMA_HOST in .env
cat student_agent/.env | grep OLLAMA_HOST
```

---

## Configuration Quick Ref

### Get Discord IDs

**Server ID**: Right-click server → Copy server ID
```
DISCORD_GUILD_ID = 1478915631016448020
```

**Channel IDs**: Right-click channel → Copy channel ID
```
ANNOUNCEMENTS_ID = 1480106512813654036
TOPIC_DISCUSSION_ID = 1479995367754960946
GENERAL_ID = 1478915632723398961
```

**Bot Token**: Developer Portal → Applications → Your App → Bot → Copy token
```
STUDENT_DISCORD_TOKEN = xxx_your_token_here_xxx
```

### Adjust Logging

Increase verbosity (debug mode):
```bash
python3 student_agent/launch.py --debug
```

---

## Next Steps

1. ✅ **Installation**: Complete 5-minute setup
2. ✅ **Testing**: Run 10-minute test suite
3. ✅ **Deployment**: Choose scheduling option
4. 📖 **Reading**: Review core documentation
   - `agents/student_agent.md` (behavioral spec)
   - `agents/student_agent_implementation.md` (tactical playbook)
   - `STUDENT_AGENT_AUTOMATION.md` (system architecture)
5. 🔧 **Customization**: Adjust dimensions, weights, timing
6. 📊 **Monitoring**: Set up daily leaderboard review

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `student_agent/core.py` | Main Student Agent logic |
| `student_agent/launch.py` | Launcher with validation |
| `scripts/daily_leaderboard.js` | Automated scoring & leaderboard |
| `agents/student_agent.md` | Behavioral specification |
| `agents/student_agent_implementation.md` | Tactical playbook |
| `STUDENT_AGENT_AUTOMATION.md` | System architecture guide |

---

## Support

- **Agent not posting?** Check `logs/student_agent.log`
- **Leaderboard issues?** Check `logs/leaderboard.log`
- **Discord permissions?** Review bot role capabilities
- **LLM problems?** Verify Ollama is running: `ollama serve`

For detailed debugging, see `student_agent/README.md` troubleshooting section.

---

**Ready to launch?** Start with:
```bash
python3 student_agent/launch.py
```

Good luck! 🚀
