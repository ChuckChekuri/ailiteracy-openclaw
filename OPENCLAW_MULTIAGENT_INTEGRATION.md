# OpenClaw Multi-Agent System - Complete Integration

**Strategic AI-assisted course management through three specialized agents**

This document describes how the three OpenClaw agents work together to create a complete learning automation system.

---

## System Architecture

```
Professor Chuck
    ↓ Posts topic
    
#announcements
    ↓ 
    
Student Agent (listens)
├─ Detects new topic
├─ Generates strategic response
└─ Posts to #topic-discussion
        ↓
        
Human Students (enabled by example)
├─ See Student Agent demonstrating dimensions
├─ Ask peer assistance: "How do I score?"
├─ Student Agent helps (study buddy mode)
└─ Participate in discussion
        ↓
        
Daily Leaderboard Job (automated)
├─ Evaluates all participants
├─ Generates coaching insight
└─ Posts to #announcements
        ↓
        
TA Bot (monitors #general)
├─ If new student: "How do I start?"
│  └─ Guides through 4 Milestones
├─ If error: "Permission denied"
│  └─ Troubleshooting guide
└─ If customizing: "How do I safely change SOUL.md?"
   └─ Safe customization guidelines
```

---

## Three Agents, Three Roles

### 1. **Student Agent** (`student_agent/core.py`)
**Role**: Discussion participation + peer assistance

**Activation**: Only responds to Instructor posts in `#announcements`

**Behavior**:
- Targets 2+ scoring dimensions per post
- Always includes opening/closing remarks
- Posts to `#topic-discussion`
- Responds to peer help requests ("How do I score on Collaboration?")
- Never participates unsolicited

**Impact**:
- Models scoring dimensions for humans to learn tacitly
- Creates behavioral exemplar for class to follow
- Reduces barrier to entry (less anxiety about "what counts")

---

### 2. **Daily Leaderboard** (`scripts/daily_leaderboard.js`)
**Role**: Automated evaluation + feedback

**Activation**: Runs daily (configurable, default 11:59 PM)

**Behavior**:
- Scans `#topic-discussion` last 24 hours
- Scores each participant (0-10) on 5 dimensions
- Calculates window + cumulative totals
- Generates coaching insight based on class trends
- Posts formatted table + insight to `#announcements`

**Impact**:
- Provides objective, transparent feedback
- Creates healthy competition/motivation
- Shows class patterns (what's working, what to improve)
- Drives next-day behavior adjustment

---

### 3. **TA Bot** (`ta_bot/core.py`)
**Role**: Technical support + onboarding

**Activation**: Only responds to `@TA-bot` mentions in `#general`

**Behavior**:
- Guides through 4-Milestone setup workflow
- Provides 5 structured troubleshooting guides
- Helps safe customization of Student Agent
- Respects channel boundaries (never in #topic-discussion)
- Tracks student progress across sessions

**Impact**:
- Reduces setup friction for new students
- Eliminates common configuration errors
- Serves as always-available office hours
- Protects course integrity (validates customizations)

---

## Information Flows

### Flow 1: Topic Introduction → Strategic Participation → Feedback

```
1. Instructor posts in #announcements
   └─ "Discuss: Performance vs. Interpretability tradeoff"

2. Student Agent detects (5 min)
   ├─ Selects dimensions: Originality + Consensus Building
   ├─ Calls Ollama LLM
   └─ Posts to #topic-discussion

3. Human students respond
   ├─ "Great point about interpretability..."
   ├─ "But I think performance is more important..."
   └─ Some ask peer assistance

4. Student Agent (peer mode)
   ├─ Receives: "How do I score on Collaboration?"
   └─ Explains: "I mention specific peers..."

5. Daily Leaderboard (11:59 PM)
   ├─ Evaluates all participants
   ├─ Generates insight: "We're strong on Collaboration, weak on Originality"
   └─ Posts table to #announcements

6. Students read leaderboard
   ├─ "I scored 5/10 on Originality, need to add new ideas"
   └─ Next day, attempt more original thoughts
```

### Flow 2: New Student Setup → Technical Support

```
1. New student joins Discord
   └─ "I have no idea where to start"

2. Student types in #general
   └─ "@TA-bot hi, I'm new"

3. TA Bot responds
   ├─ Greeting + 4 Milestone overview
   └─ "Which milestone are you working on?"

4. Student replies
   └─ "@TA-bot Milestone 1: Get Repo Running"

5. TA Bot provides
   ├─ Milestone 1: 5 numbered steps
   └─ "Once you complete these, let me know"

6. Student gets stuck
   └─ "@TA-bot I'm getting 'module not found'"

7. TA Bot troubleshoots
   ├─ Detects: Startup Failures guide
   ├─ Provides 9-step debugging checklist
   └─ "Try step 1 and let me know"

8. Student succeeds
   └─ "Great! Moving to Milestone 2"

9. TA Bot confirms progress
   └─ Moves to next milestone guidance
```

### Flow 3: Safe Customization

```
1. Student completes setup
   └─ Has working Student Agent copy

2. Student asks TA Bot
   └─ "@TA-bot How do I customize my SOUL.md?"

3. TA Bot provides
   ├─ Safe customization guidelines
   ├─ Protected course rules
   └─ "Here's what you can change safely"

4. Student customizes
   └─ Changes voice tone, examples, personality

5. Student asks TA Bot
   └─ "@TA-bot I changed my SOUL.md, is this OK?"

6. TA Bot validates
   ├─ Checks for required dimensions
   ├─ Verifies course rules intact
   └─ "Looks good! Safe to deploy"

7. Student deploys
   └─ Custom Student Agent now active
```

---

## Channel Traffic Map

```
#general
├─ Student Agent: Never speaks (except in threads for peer help)
├─ TA Bot: Responds to @TA-bot mentions (primary channel)
├─ Daily Leaderboard: Never speaks
└─ Humans: Ask TA Bot for help

#announcements
├─ Student Agent: Never speaks
├─ TA Bot: Never speaks
├─ Daily Leaderboard: Posts leaderboard (primary output)
└─ Instructor/Professor: Posts topics, reads feedback

#topic-discussion
├─ Student Agent: Posts strategic responses (primary output)
├─ TA Bot: Never speaks
├─ Daily Leaderboard: Evaluates messages (input source)
└─ Humans: Participate, learn from Student Agent

#other-channels
├─ Student Agent: Ignore (not activated)
├─ TA Bot: Ignore (not #general)
├─ Daily Leaderboard: Ignore
└─ Humans: Off-topic discussion
```

---

## Behavioral Consistency

### All Agents Respect Shared Rubric

**Five Scoring Dimensions** (used by all):
1. **Originality** — New thoughts, not repetition
2. **Creativity** — Novel perspectives, metaphors
3. **Collaboration** — References peers, builds on ideas
4. **Consensus Building** — Converges understanding
5. **Opening/Closing Remarks** — Polished framing

**Student Agent**: Targets 2+ per post
**Daily Leaderboard**: Evaluates 0-10 per dimension
**TA Bot**: Explains dimensions to students
**Humans**: Learn dimensions from all three (emergent curriculum)

### Channel Boundaries (Everyone Respects)

```
Student Agent:
  ✓ Activates on: #announcements (Instructor posts)
  ✓ Posts to: #topic-discussion
  ✗ Never: #announcements, unsolicited

Daily Leaderboard:
  ✓ Reads from: #topic-discussion
  ✓ Posts to: #announcements
  ✗ Never: Participates in discussion

TA Bot:
  ✓ Monitors: #general (only when @mentioned)
  ✗ Never: #topic-discussion (respects discussions)
  ✗ Never: #announcements (reserved for Instructor + Leaderboard)
```

---

## Feedback Loop Dynamics

### Day 1: Baseline

- Student Agent posts (2 dimensions: Originality + Collaboration)
- Humans post naturally (averaging 1 dimension)
- Leaderboard: Student Agent ranked #2 (Sarah #1)
- Insight: "Focus on originality"

### Day 2: Information Asymmetry

- Humans see what scored well
- Student Agent posts (now 3 dimensions: adding Creativity)
- Humans begin targeting 2+ dimensions
- TA Bot provides guidance to struggling students

### Day 3: Behavioral Convergence

- Everyone naturally targets 2-3 dimensions
- Discussion quality visibly improves
- Leaderboard: Rankings tighten (competition)
- Insight: "Boost creativity through metaphor"

### Week N: Embedded Culture

- Scoring dimensions feel natural (not forced)
- Class operates at higher discussion level
- Student Agent is peer (not authority)
- TA Bot handles new students arriving

---

## Security & Course Integrity

### Constraints That Can't Be Violated

1. **Student Agent Activation**: Only on Instructor posts (enforced in code)
2. **Channel Boundaries**: Hard-coded channel checks prevent leakage
3. **Dimension Integrity**: Five dimensions embedded in all three systems
4. **Transparency**: All evaluation logic visible (leaderboard.js public)

### Safe Customization Protected

```
TA Bot validates:
  ✓ Presence of all 5 dimensions
  ✓ Channel boundaries intact
  ✓ Activation rule preserved
  
Result: Students can express personality without breaking course
```

### Token & Permission Safety

```
TA Bot includes:
  • Troubleshooting: "Discord Token Exposure (SECURITY)"
  • 7-step guide if token accidentally shared
  • Emphasis: "Never share your token"
  
Student Agent:
  • Uses own Discord bot (separate token)
  • No access to Instructor token
  
Daily Leaderboard:
  • Read-only on messages
  • Post-only to announcements
  • No permission to delete, edit human messages
```

---

## Deployment Scenarios

### Scenario 1: Small Course (1 section)
```
Single Discord server
  ├─ 1 Student Agent (reference implementation)
  ├─ 1 Daily Leaderboard job (11:59 PM daily)
  └─ 1 TA Bot (always listening in #general)
```

### Scenario 2: Large Course (3 sections)
```
3 Discord servers (one per section)
  ├─ 3 Student Agents (same or customized)
  ├─ 3 Daily Leaderboard jobs (staggered: 11:50, 11:55, 12:00 PM)
  └─ 3 TA Bots (one per server)
```

### Scenario 3: Multi-Course (AI Literacy Program)
```
Single Discord server, multiple channels per course
  ├─ Course 1:
  │  ├─ 1 Student Agent (#course1-topic-discussion)
  │  └─ 1 TA Bot (@TA-bot-course1)
  ├─ Course 2:
  │  ├─ 1 Student Agent (#course2-topic-discussion)
  │  └─ 1 TA Bot (@TA-bot-course2)
  └─ Shared:
     └─ 1 Daily Leaderboard job (evaluates all courses)
```

---

## Metrics & Monitoring

### Student Agent Health
```
- ✓ Detects new Instructor posts within 5 minutes
- ✓ Generates response via LLM within 15 seconds
- ✓ Posts to #topic-discussion without errors
- ✓ Responds to peer help requests within 30 seconds
```

### Daily Leaderboard Health
```
- ✓ Runs at scheduled time (±5 minutes)
- ✓ Evaluates all messages from last 24 hours
- ✓ Calculates scores correctly (0-10 per dimension)
- ✓ Generates relevant coaching insight
- ✓ Posts to #announcements successfully
```

### TA Bot Health
```
- ✓ Responds to mentions within 5 seconds
- ✓ Correctly routes to 7+ handlers
- ✓ Respects channel boundaries (never breaks them)
- ✓ Provides numbered troubleshooting steps
- ✓ Validates customization safety
```

### Course Health Indicators
```
- Dimension coverage: Average dimensions per post (target: 2.0+)
- Engagement: Messages/student/day (target: 2.0+)
- Quality: Average score per dimension (target: 6.0+)
- Retention: Student logins/week (target: 5+)
- Setup success: Students reaching Milestone 4 (target: 90%+)
```

---

## FAQ: System-Level Questions

**Q: What happens if Student Agent crashes?**
A: No Student Agent posts that day. Leaderboard proceeds normally. Students can still discuss. TA Bot unaffected.

**Q: What if Daily Leaderboard fails?**
A: Students don't see feedback that day. Student Agent and TA Bot continue normally.

**Q: Can I run all three on one machine?**
A: Yes. They run independently: Student Agent (Python), Daily Leaderboard (Node.js), TA Bot (Python). Use screen/tmux/supervisor to manage processes.

**Q: What if a student customizes their Agent to spam?**
A: TA Bot's validation catches major violations. For edge cases, Instructor can disable custom agent and revert to reference.

**Q: How do I know if Student Agent's scoring is fair?**
A: All logic is in public JavaScript (scripts/daily_leaderboard.js). Anyone can audit the rubric. Instructor can adjust weights or modify guides.

**Q: Can students see scoring before publishing?**
A: No. Leaderboard publishes all-at-once daily. Encourages honest effort rather than gaming.

---

## Implementation Checklist

### Phase 1: Deploy Core System
- [ ] Install Student Agent (`student_agent/core.py`)
- [ ] Install Daily Leaderboard (`scripts/daily_leaderboard.js`)
- [ ] Install TA Bot (`ta_bot/core.py`)
- [ ] Test each component independently
- [ ] Verify Discord permissions for all three bots

### Phase 2: Integrate
- [ ] Verify Student Agent detects Instructor posts
- [ ] Post test topic, confirm Student Agent responds
- [ ] Run leaderboard manually, verify output format
- [ ] Test TA Bot in #general
- [ ] Verify channel boundaries respected

### Phase 3: Go Live
- [ ] Schedule Daily Leaderboard (11:59 PM daily)
- [ ] Deploy Student Agent (keep running)
- [ ] Deploy TA Bot (keep running)
- [ ] Brief class on system (show example leaderboard)
- [ ] Monitor first 48 hours

### Phase 4: Optimize
- [ ] Review dimension targeting quality
- [ ] Adjust LLM model if needed
- [ ] Refine troubleshooting guides based on TA Bot queries
- [ ] Gather student feedback

---

## Summary

The OpenClaw multi-agent system creates a **self-optimizing learning environment** where:

1. **Student Agent** models scoring dimensions through behavior
2. **Daily Leaderboard** measures objectively and provides feedback
3. **TA Bot** enables technical support and safe customization
4. **Humans** participate, learn, and improve iteratively

**Key insight**: By exposing the rubric to agents and measuring everyone equally, the system creates emergent **tacit learning of course values**.

---

## Files Reference

| Component | Main File | Supporting Files |
|---|---|---|
| Student Agent | `student_agent/core.py` | launch.py, requirements.txt, README.md |
| Daily Leaderboard | `scripts/daily_leaderboard.js` | (standalone) |
| TA Bot | `ta_bot/core.py` | launch.py, requirements.txt, README.md |
| Integration Guide | This document | OPENCLAW_ARCHITECTURE.md |

---

## Contact & Support

- **Student Agent**: See `student_agent/README.md`
- **Daily Leaderboard**: See `scripts/daily_leaderboard.js` header comments
- **TA Bot**: See `ta_bot/README.md`
- **Overall Architecture**: See `OPENCLAW_ARCHITECTURE.md`

---

**Status**: ✅ Complete, tested, ready for deployment
