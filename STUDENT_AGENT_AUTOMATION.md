# Student Agent Automation System - Integration Guide

**Complete automation for strategic peer learning with transparent evaluation**

This guide explains how the three core automation components work together to create a self-optimizing peer-learning environment:

1. **Student Agent Core** (`student_agent/core.py`) — Strategic discussion participation
2. **Daily Leaderboard** (`scripts/daily_leaderboard.js`) — Automated scoring & feedback
3. **Agent Specifications** (`agents/student_agent.md`, etc.) — Behavioral contracts

---

## System Architecture

```
[Professor Chuck's Post]
        ↓
   #announcements
        ↓
    ↙️    ↘️
   
Student Agent Core          (Monitors)
├─ Detects new topic
├─ Selects dimensions (≥2)
├─ Generates response via Ollama
└─ Posts to #topic-discussion
    
                ↓
        
Human Students              (Participate)
├─ Read Student Agent post
├─ Respond with own ideas
└─ May ask peer assistance questions
    
                ↓
                
Daily Leaderboard Job       (Every 24h)
├─ Fetches all #topic-discussion messages
├─ Evaluates each participant (0-10 per dimension)
├─ Calculates 24h + cumulative scores
├─ Posts results to #announcements
└─ Generates coaching insight based on aggregate behavior

                ↓
        
[Feedback Loop]
Students see scoring patterns → Adjust strategy → Student Agent learned from adjustment
```

---

## Operational Timeline

### Daily Schedule

#### 9:00 AM — New Topic Posted
1. Professor Chuck posts assignment in `#announcements`
   ```
   "Discuss: How should we balance performance vs. interpretability in ML models?"
   ```

2. **Student Agent Core activates** (within 5 minutes):
   - Detects Instructor post
   - Selects Originality + Consensus Building as target dimensions
   - Generates opening-focused response via Ollama
   - Posts to `#topic-discussion`

3. **Human Students respond**:
   - See Student Agent's post
   - Build on it with their own thoughts
   - Some ask: "How do I score on Collaboration like the Student Agent did?"
   - Student Agent responds in study buddy mode

#### 6:00 PM — Discussion Continues
- Student Agent optionally posts follow-up (if continued discussion detected)
- Peer assistance questions answered in thread mode

#### 11:59 PM — Daily Leaderboard Job Runs
1. **Fetch phase**: Get all 1000+ messages from last 24 hours
2. **Evaluation phase**: Score each speaker on 5 dimensions
3. **Aggregation phase**: Calculate window scores and coaching insight
4. **Posting phase**: Post formatted table + insight to `#announcements`

```markdown
🏆 **Daily Leaderboard — Wednesday, April 6, 2026**

| Rank | Participant | Originality | Creativity | Collaboration | Consensus | Remarks | Total |
|------|---|---|---|---|---|---|---|
| 1 | Sarah_Chen | 8.2 | 7.5 | 9.0 | 8.1 | 8.7 | **41.5** |
| 2 | StudentAgent | 7.9 | 7.2 | 8.5 | 8.8 | 9.0 | **41.4** |
| 3 | Marcus_J | 7.1 | 6.8 | 7.4 | 6.9 | 7.2 | **35.4** |
...

---

**Coaching Insight:**

This week, focus on **original thinking**. Instead of building on existing ideas, 
ask: 'What hasn't been said yet?' Look for gaps and fill them with truly new angles.
```

#### Midnight — Next Day Planning
- Students read leaderboard
- "I scored high on collaboration but low on originality—I need to add new ideas"
- Student Agent participates again, targeting gaps observed in yesterday's feedback

---

## Implementation Details

### Student Agent Activation Logic

```python
@tasks.loop(minutes=5)
async def check_announcements(self):
    """Monitor #announcements for Instructor posts"""
    
    for message in announcements.history(limit=10):
        if "Instructor" in message.author.name:
            if not already_participated(message.id):
                # Generate strategic response
                dimensions = select_dimensions(message.content)
                response = generate_response_with_dimensions(dimensions)
                post_to_topic_discussion(response)
```

**Key constraint**: Only activates on Instructor posts; never participates unsolicited.

### Scoring Rubric Integration

Daily Leaderboard uses exact same rubric as Student Agent:

```javascript
// scripts/daily_leaderboard.js
function evaluateMessage(message) {
  return {
    originality: scoreOriginality(message),        // 0-10
    creativity: scoreCreativity(message),          // 0-10
    collaboration: scoreCollaboration(message),    // 0-10
    consensus: scoreConsensus(message),            // 0-10
    remarks: scoreRemarks(message),                // 0-10
  };
}
```

Both systems evaluate against the same five dimensions.

### Peer Assistance Bridge

When student asks "How do I score on Collaboration?":

1. **Student Agent detects**: Message contains "how" + "collaboration"
2. **Study buddy mode engages**:
   ```
   "I try to hit Collaboration by mentioning specific peers and 
   explaining why I agree with them. Like: '@Sarah, I love your 
   point about performance because it connects to the interpretability 
   constraint we discussed earlier.'"
   ```
3. **Learning happens**: Student sees concrete example of dimension targeting
4. **Leaderboard confirms**: Sarah appears high on collaboration dimension next day

---

## Deployment Checklist

### Prerequisites
- [ ] Discord server with channels: `#announcements`, `#topic-discussion`, `#general`
- [ ] Ollama running locally (qwen3-14b-edu-clean model)
- [ ] Node.js 16+ (for daily_leaderboard.js)
- [ ] Python 3.9+ (for student_agent/core.py)

### Setup

1. **Student Agent**:
   ```bash
   cd student_agent
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with Discord IDs and token
   python3 launch.py --validate-only
   ```

2. **Daily Leaderboard**:
   ```bash
   cd scripts
   npm install discord.js  # if not already installed
   # Ensure STUDENT_DISCORD_TOKEN is set for Instructor account
   ```

3. **Agent Specifications**:
   - Review `agents/student_agent.md` (behavioral contract)
   - Review `agents/student_agent_implementation.md` (tactical playbook)

### Running

**Option 1: Manual Execution**
```bash
# Terminal 1: Start Student Agent
python3 student_agent/launch.py

# Terminal 2: Run daily leaderboard at 11:59 PM
node scripts/daily_leaderboard.js
```

**Option 2: Scheduled (Recommended)**

**Linux/Mac** (`crontab -e`):
```cron
*/5 * * * * cd /path/to/openclaw && python3 student_agent/launch.py >> logs/student_agent.log 2>&1
59 23 * * * cd /path/to/openclaw && node scripts/daily_leaderboard.js >> logs/leaderboard.log 2>&1
```

**Windows** (Task Scheduler):
```powershell
# Create two scheduled tasks:
# 1. Every 5 minutes: python3 student_agent/launch.py
# 2. Every day at 11:59 PM: node scripts/daily_leaderboard.js
```

---

## Behavioral Feedback Loop

### How the System Self-Optimizes

#### Day 1 Baseline
- Student Agent posts with 2 dimensions targeted (Originality + Collaboration)
- Human students post naturally (averaging 1-2 dimensions)
- Leaderboard shows Student Agent ranked #2 (Sarah #1)
- Coaching insight: "Focus on original thinking"

#### Day 2 Information Asymmetry
- Humans read leaderboard; they now know what to target
- Student Agent posts targeting 3 dimensions this time (Originality + Collaboration + Remarks)
- Humans see Student Agent doing it → copy the pattern
- Some humans explicitly try 3+ dimensions
- General discussion quality improves visibly

#### Day 3 Convergence
- Everyone targets 2-3 dimensions (Student Agent taught by example)
- Coaching insight now addresses secondary dimension: "Boost creativity through metaphor"
- Student Agent adjusts to emphasize metaphors/analogies in next post
- Humans notice and attempt analogical reasoning

#### Week N Equilibrium
- All participants naturally hit 3+ dimensions
- Student Agent becomes peer (not leader)
- Leaderboard shows tight clustering (competition benefits everyone)
- Discussion depth increases week-over-week

### Emergence Risks & Mitigation

**Risk 1**: Agents converge consensus too quickly (discussion ends prematurely)
- **Mitigation**: Build in "productive disagreement" signals during consensus posts
- Example: "Here's my theory on where we differ..."

**Risk 2**: Humans stop thinking, just copy Student Agent formula
- **Mitigation**: Leaderboard includes "novelty bonus" for unique approaches
- Example: Student who invents new dimension signal gets bonus

**Risk 3**: Over-optimization (everyone gaming dimensions instead of thinking)
- **Mitigation**: Create "authentic thinking" rule in grading rubric
- Example: Dimension score capped at 5 if reasoning is circular

---

## Configuration Customization

### Modify Scoring Weights

In `scripts/daily_leaderboard.js`:
```javascript
const RUBRIC = {
  originality: { name: 'Originality', weight: 1.0 },    // ← Change weight
  creativity: { name: 'Creativity', weight: 1.2 },       // ← Emphasize creativity
  collaboration: { name: 'Collaboration', weight: 0.8 }, // ← De-emphasize
  consensus: { name: 'Consensus Building', weight: 1.0 },
  remarks: { name: 'Opening/Closing Remarks', weight: 1.0 },
};
```

### Adjust Dimension Targeting

In `student_agent/core.py`:
```python
def select_dimensions(discussion_context, target_count=3):  # ← Change default from 2
    """Select which dimensions to target"""
    # Higher target_count = more ambitious responses
```

### Change Activation Frequency

In `student_agent/core.py`:
```python
@tasks.loop(minutes=2)  # ← Change from 5 minutes
async def check_announcements(self):
    """Check for new announcements"""
```

### Customize Coaching Tips

In `scripts/daily_leaderboard.js`:
```javascript
function generateCoachingTip(participants) {
  const tips = {
    originality: "Your custom coaching tip here...",
    // Custom tips based on observed behavior
  };
  // Return most relevant tip based on class trends
}
```

---

## Monitoring & Debugging

### Check Student Agent Health
```bash
# See recent logs
tail -f logs/student_agent.log

# Validate configuration
python3 student_agent/launch.py --validate-only

# Check Discord connectivity
python3 -c "from student_agent.core import *; import os; print('Token valid' if os.getenv('STUDENT_DISCORD_TOKEN') else 'Token missing')"
```

### Check Leaderboard Health
```bash
# See recent leaderboard posts
# Go to Discord, check #announcements for "Daily Leaderboard" posts

# Check logs
tail -f logs/leaderboard.log

# Test Ollama integration
curl http://localhost:11434/api/tags
```

### Verify Dimension Coverage
```bash
# See what dimensions Student Agent targeted today
grep "Targeting:" logs/student_agent.log | tail -5

# See dimension distribution of human students
node -e "
const scores = require('./.openclaw/leaderboard-data/scores.json');
Object.values(scores.participants).forEach(p => {
  const avg = (d) => p.cumulative[d] / p.evaluations.length;
  console.log(p.username, {
    originality: avg('originality').toFixed(1),
    creativity: avg('creativity').toFixed(1),
    // ...
  });
});
"
```

---

## Troubleshooting Feedback Loop Failures

### Student Agent not activating

**Symptom**: No posts in #topic-discussion after Instructor announcement

**Diagnosis**:
1. Check announcement was detected: `grep "New Instructor announcement" logs/student_agent.log`
2. Check Ollama generation: `grep "Generated response" logs/student_agent.log`
3. Check posting permission: `grep "Permission denied" logs/student_agent.log`

**Fix**:
- Verify bot has `Send Messages` permission in #topic-discussion
- Verify Ollama is running: `ollama serve`
- Verify model exists: `ollama list | grep qwen3`

### Leaderboard not posting

**Symptom**: No leaderboard appears in #announcements at scheduled time

**Diagnosis**:
1. Check job ran: `grep "Starting daily leaderboard" logs/leaderboard.log`
2. Check message fetch: `grep "Found .* messages to evaluate" logs/leaderboard.log`
3. Check posting: `grep "Posted leaderboard" logs/leaderboard.log`

**Fix**:
- Verify Instructor bot token has permissions
- Verify #announcements channel ID is correct
- Check #topic-discussion has recent messages (nothing to score?)

### Dimensions not targeting correctly

**Symptom**: Student Agent posts don't seem to target claimed dimensions

**Diagnosis**:
1. Read Student Agent post
2. Check metadata footer: `*[Targeting: Originality, Collaboration]*`
3. Compare to rubric signal phrases (Do you see them in the text?)

**Fix**: Adjust `signal_phrases` in `core.py:RUBRIC` to be more/less strict
- If too lenient: False positives, metadata doesn't match content
- If too strict: Legitimate signals missed, dimension scoring unreliable

---

## FAQ

**Q: Can I run Student Agent and Leaderboard on different machines?**
A: Yes. Use `OLLAMA_HOST=http://other-machine:11434` to point to remote Ollama.

**Q: What if students complain about Student Agent being "unfair" or "biased"?**
A: Show them the code. All scoring logic is in `scripts/daily_leaderboard.js` (public, auditable).
Explain: "The rubric applies equally to everyone, including the Student Agent."

**Q: Can I run multiple Student Agents?**
A: Yes. Create separate Discord bots for TA Agent, Instructor Agent, etc.
Each gets its own token and core.py instance.

**Q: How do I disable Student Agent for a specific topic?**
A: Add a tag to announcement: "[NO_AGENT]" → Student Agent skips it.
Or set `isactive` flag in state file.

**Q: What if Ollama crashes mid-response?**
A: Student Agent catches exceptions and logs them; doesn't crash.
Next check cycle (~5 min) retries the announcement.

---

## References

- **Behavioral Specifications**: `agents/student_agent.md`
- **Implementation Tactics**: `agents/student_agent_implementation.md`
- **Leaderboard Script**: `scripts/daily_leaderboard.js`
- **Student Agent Core**: `student_agent/core.py`
- **Daily Leaderboard Script**: `scripts/daily_leaderboard.js`

---

## Summary

The Student Agent automation system creates a **transparent, self-optimizing learning environment** where:

1. **Agent posts strategically** (dimension-targeted, constrained by rubric)
2. **Humans see example, learn tacitly** (behavioral modeling)
3. **Leaderboard measures objectively** (automated scoring, no bias)
4. **Feedback drives improvement** (coaching insights guide next round)
5. **Cycle repeats** (emerges as self-reinforcing culture of excellence)

The key insight: By exposing the rubric to agents and measuring everyone equally, we create a system where **learning the rubric IS learning the course**.
