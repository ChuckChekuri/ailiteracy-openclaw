#!/usr/bin/env node

/**
 * Daily Leaderboard Automation Script
 * 
 * Purpose: Automatically evaluate all participants in #topic-discussion
 * and post a daily leaderboard to #announcements with scoring across
 * five dimensions: Originality, Creativity, Collaboration, Consensus Building,
 * and Opening/Closing Remarks.
 * 
 * Voice: Professor Chuck (professional, clear, encouraging)
 * Constraint: Observe only; never participate in discussion
 * 
 * Usage: node daily_leaderboard.js [--debug] [--date YYYY-MM-DD]
 */

const { Client, ChannelType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Discord IDs from .env
  GUILD_ID: process.env.DISCORD_GUILD_ID || '1478915631016448020',
  TOPIC_DISCUSSION_ID: process.env.TOPIC_DISCUSSION_ID || '1479995367754960946',
  ANNOUNCEMENTS_ID: process.env.INFO_ANNOUNCEMENTS_CHANNEL_ID || '1480106512813654036',
  TOKEN: process.env.INSTRUCTOR_DISCORD_TOKEN,

  // Scoring window
  HOURS_WINDOW: 24,
  
  // Data persistence
  DATA_DIR: './.openclaw/leaderboard-data',
  SCORES_FILE: './.openclaw/leaderboard-data/scores.json',

  // Debug mode
  DEBUG: process.argv.includes('--debug'),
};

// ============================================================================
// SCORING RUBRIC (from instructor_agent.md)
// ============================================================================

const RUBRIC = {
  originality: {
    name: 'Originality',
    description: 'Adds new thoughts; does not repeat existing ideas',
    weight: 1,
  },
  creativity: {
    name: 'Creativity',
    description: 'Brings unique perspectives, metaphors, or novel angles',
    weight: 1,
  },
  collaboration: {
    name: 'Collaboration',
    description: 'Builds on peers\' ideas; references and extends them',
    weight: 1,
  },
  consensus: {
    name: 'Consensus Building',
    description: 'Helps the group converge on shared understanding',
    weight: 1,
  },
  remarks: {
    name: 'Opening/Closing Remarks',
    description: 'Polished opening and closing that frame the contribution',
    weight: 1,
  },
};

// ============================================================================
// DISCORD CLIENT SETUP
// ============================================================================

const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] });

client.on('error', (error) => {
  console.error('Discord client error:', error);
  process.exit(1);
});

// ============================================================================
// SCORING LOGIC
// ============================================================================

/**
 * Evaluate a single message against the five-dimension rubric.
 * Returns an object with scores for each dimension (0-10).
 */
function evaluateMessage(message) {
  const text = message.content.toLowerCase();
  const author = message.author.username;

  const scores = {
    originality: scoreOriginality(message, text),
    creativity: scoreCreativity(message, text),
    collaboration: scoreCollaboration(message, text),
    consensus: scoreConsensus(message, text),
    remarks: scoreRemarks(message, text),
  };

  return scores;
}

/**
 * Score Originality (0-10)
 * Looks for: new concepts, unique angles, ideas not yet mentioned
 */
function scoreOriginality(message, text) {
  let score = 0;

  // High signals
  if (text.includes("here's a thought") || 
      text.includes("i haven't seen") ||
      text.includes("new angle") ||
      text.includes("different perspective")) {
    score += 5;
  }

  // Medium signals
  if (text.includes("what if") || 
      text.includes("consider") ||
      text.includes("alternatively")) {
    score += 2;
  }

  // Penalty: Simple agreement without addition
  if (text.match(/^(i agree|yep|✓|yes|true|agreed)[\s.]*$/i)) {
    score -= 3;
  }

  // Penalty: Obvious repetition
  if (text.length < 50) {
    score -= 1;
  }

  return Math.max(0, Math.min(10, score + 2)); // Base score: 2, cap at 10
}

/**
 * Score Creativity (0-10)
 * Looks for: metaphors, analogies, novel frameworks, unexpected connections
 */
function scoreCreativity(message, text) {
  let score = 0;

  // High signals: metaphor/analogy language
  if (text.match(/like|as if|similar to|reminiscent|parallel to/i)) {
    score += 5;
  }

  // Medium signals: novel framing
  if (text.includes("lens") || 
      text.includes("framework") ||
      text.includes("paradigm") ||
      text.includes("think of")) {
    score += 3;
  }

  // Creativity keywords
  if (text.includes("imagine") || 
      text.includes("picture this") ||
      text.includes("twist")) {
    score += 2;
  }

  // Penalty: Purely technical/mechanical
  if (text.match(/^(the answer is|according to|based on)[\s\w]*$/i)) {
    score -= 2;
  }

  return Math.max(0, Math.min(10, score + 1)); // Base score: 1, cap at 10
}

/**
 * Score Collaboration (0-10)
 * Looks for: mentions of peers, building on previous points, explicit references
 */
function scoreCollaboration(message, text) {
  let score = 0;

  // High signals: direct peer reference
  if (message.mentions.has(client.user) === false) {
    // Check for @mentions of others
    const mentions = message.mentions.users.size;
    score += Math.min(mentions * 3, 6);
  }

  // Medium signals: reference without @
  if (text.includes("building on") || 
      text.includes("extending") ||
      text.includes("to add to") ||
      text.includes("great point")) {
    score += 3;
  }

  // Collaboration keywords
  if (text.includes("agree") || 
      text.includes("combine") ||
      text.includes("together")) {
    score += 2;
  }

  return Math.max(0, Math.min(10, score + 1)); // Base score: 1, cap at 10
}

/**
 * Score Consensus Building (0-10)
 * Looks for: synthesis, agreement signals, bridge-building between ideas
 */
function scoreConsensus(message, text) {
  let score = 0;

  // High signals: explicit synthesis
  if (text.includes("actually") || 
      text.includes("both are right") ||
      text.includes("agree and") ||
      text.includes("synthesis")) {
    score += 5;
  }

  // Medium signals: finding common ground
  if (text.includes("where we agree") || 
      text.includes("overlap") ||
      text.includes("convergence") ||
      text.includes("common ground")) {
    score += 4;
  }

  // Consensus keywords
  if (text.includes("shared") || 
      text.includes("together") ||
      text.includes("progress")) {
    score += 2;
  }

  return Math.max(0, Math.min(10, score)); // Base score: 0, cap at 10
}

/**
 * Score Opening/Closing Remarks (0-10)
 * Looks for: polished opening framing and closing summary
 */
function scoreRemarks(message, text) {
  let score = 0;
  const lines = message.content.split('\n');
  const hasMultipleParagraphs = lines.length > 2;

  // High signals: clear opening
  const hasOpening = text.match(/^(building on|this connects|let me|here's|i want to|looking at)/i);
  if (hasOpening) {
    score += 3;
  }

  // High signals: clear closing
  const hasClosing = text.match(/(so|therefore|thus|this means|the real|what we've|that's why)[.,]?\s*\w+.*[.!?]$/i);
  if (hasClosing) {
    score += 3;
  }

  // Medium signals: structured format (line breaks, bullets)
  if (lines.length >= 3) {
    score += 1;
  }

  // Penalty: Single-line, no structure
  if (lines.length === 1 && message.content.length < 100) {
    score -= 2;
  }

  return Math.max(0, Math.min(10, score + 2)); // Base score: 2, cap at 10
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Initialize data directory and files
 */
function initializeDataStore() {
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(CONFIG.SCORES_FILE)) {
    fs.writeFileSync(CONFIG.SCORES_FILE, JSON.stringify({
      lastUpdate: null,
      participants: {},
    }, null, 2));
  }
}

/**
 * Load scores from persistent storage
 */
function loadScores() {
  try {
    const data = fs.readFileSync(CONFIG.SCORES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading scores:', error);
    return { lastUpdate: null, participants: {} };
  }
}

/**
 * Save scores to persistent storage
 */
function saveScores(data) {
  try {
    fs.writeFileSync(CONFIG.SCORES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving scores:', error);
  }
}

/**
 * Update scores with new message evaluations
 */
function updateScores(messages) {
  const scores = loadScores();
  const now = new Date();

  messages.forEach((message) => {
    const author = message.author.username;
    const userId = message.author.id;
    const timestamp = message.createdTimestamp;

    if (!scores.participants[userId]) {
      scores.participants[userId] = {
        username: author,
        evaluations: [],
        cumulative: { originality: 0, creativity: 0, collaboration: 0, consensus: 0, remarks: 0 },
      };
    }

    const evaluation = evaluateMessage(message);
    evaluation.timestamp = timestamp;

    scores.participants[userId].evaluations.push(evaluation);

    // Update cumulative
    Object.keys(evaluation).forEach((dimension) => {
      if (dimension !== 'timestamp') {
        scores.participants[userId].cumulative[dimension] += evaluation[dimension];
      }
    });
  });

  scores.lastUpdate = now.toISOString();
  saveScores(scores);

  return scores;
}

/**
 * Calculate scores for a given time window (in hours)
 */
function calculateWindowScores(participants, hours = 24) {
  const now = Date.now();
  const windowStart = now - (hours * 60 * 60 * 1000);

  const result = {};

  Object.entries(participants).forEach(([userId, data]) => {
    const windowEvals = data.evaluations.filter((e) => e.timestamp >= windowStart);

    if (windowEvals.length > 0) {
      const windowScores = {
        originality: 0,
        creativity: 0,
        collaboration: 0,
        consensus: 0,
        remarks: 0,
        messageCount: windowEvals.length,
      };

      windowEvals.forEach((eval) => {
        Object.keys(windowScores).forEach((key) => {
          if (key !== 'messageCount' && eval[key] !== undefined) {
            windowScores[key] += eval[key];
          }
        });
      });

      // Average per message for consistency
      Object.keys(windowScores).forEach((key) => {
        if (key !== 'messageCount') {
          windowScores[key] /= windowEvals.length;
        }
      });

      result[userId] = {
        username: data.username,
        ...windowScores,
      };
    }
  });

  return result;
}

/**
 * Generate coaching insight based on aggregated behavior
 */
function generateCoachingTip(participants) {
  const allEvals = [];

  Object.values(participants).forEach((data) => {
    data.evaluations.forEach((eval) => {
      allEvals.push(eval);
    });
  });

  if (allEvals.length === 0) {
    return "Keep the discussion going—every voice matters!";
  }

  // Calculate dimension averages
  const dims = ['originality', 'creativity', 'collaboration', 'consensus', 'remarks'];
  const averages = {};

  dims.forEach((dim) => {
    const scores = allEvals.map((e) => e[dim]).filter((s) => s !== undefined);
    if (scores.length > 0) {
      averages[dim] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  });

  // Find weakest dimension
  let weakest = null;
  let weakestScore = 10;

  Object.entries(averages).forEach(([dim, score]) => {
    if (score < weakestScore) {
      weakest = dim;
      weakestScore = score;
    }
  });

  // Generate tip based on weakest dimension
  const tips = {
    originality:
      "This week, focus on **original thinking**. Instead of building on existing ideas, ask: 'What hasn't been said yet?' Look for gaps in the discussion and fill them with truly new angles.",
    creativity:
      "Let's boost **creativity**. Try using metaphors, analogies, or frameworks from outside the course. What unexpected connections can you draw to strengthen your arguments?",
    collaboration:
      "I'm noticing we could deepen **collaboration**. When you agree with a peer, say it explicitly: '@[Name], I love that point because...' This signals teamwork and builds community.",
    consensus:
      "Great discussions! Now let's practice **consensus building**. When you see disagreement, try finding the overlap: 'We both agree on X. The real question is Y.' Help us converge.",
    remarks:
      "Polish your **opening and closing remarks**. Start with a framing sentence that orients the reader. End with a summary or a next step. These bookends are easy points and signal professionalism.",
  };

  return tips[weakest] || "You're all doing great—keep pushing each other's thinking!";
}

// ============================================================================
// LEADERBOARD FORMATTING
// ============================================================================

/**
 * Format the leaderboard as a Markdown table for Discord
 */
function formatLeaderboard(windowScores, period = '24h') {
  const sorted = Object.entries(windowScores)
    .sort(([, a], [, b]) => {
      const totalA =
        a.originality + a.creativity + a.collaboration + a.consensus + a.remarks;
      const totalB =
        b.originality + b.creativity + b.collaboration + b.consensus + b.remarks;
      return totalB - totalA;
    });

  let table = `## Daily Leaderboard (Last ${period})\n\n`;
  table += `| Rank | Participant | Originality | Creativity | Collaboration | Consensus | Remarks | Total |\n`;
  table += `|------|-------------|-------------|-----------|---------------|-----------|---------|---------|\n`;

  sorted.forEach(([_, scores], index) => {
    const total = (
      scores.originality +
      scores.creativity +
      scores.collaboration +
      scores.consensus +
      scores.remarks
    ).toFixed(1);

    table += `| ${index + 1} | ${scores.username} | `;
    table += `${scores.originality.toFixed(1)} | `;
    table += `${scores.creativity.toFixed(1)} | `;
    table += `${scores.collaboration.toFixed(1)} | `;
    table += `${scores.consensus.toFixed(1)} | `;
    table += `${scores.remarks.toFixed(1)} | **${total}** |\n`;
  });

  return table;
}

/**
 * Format the full leaderboard post as Professor Chuck
 */
function formatProfessorChuckPost(leaderboardTable, coachingTip) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `🏆 **Daily Leaderboard — ${date}**

${leaderboardTable}

---

### Coaching Insight

${coachingTip}

**Keep pushing, everyone. Originality, creativity, and collaboration are what make this community great.**

— Professor Chuck`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('[Leaderboard] Starting daily leaderboard automation...');

  if (!CONFIG.TOKEN) {
    console.error('[Leaderboard] Error: INSTRUCTOR_DISCORD_TOKEN not set in .env');
    process.exit(1);
  }

  initializeDataStore();

  try {
    await client.login(CONFIG.TOKEN);
    console.log('[Leaderboard] Connected to Discord');

    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    console.log(`[Leaderboard] Found guild: ${guild.name}`);

    const topicChannel = await guild.channels.fetch(CONFIG.TOPIC_DISCUSSION_ID);
    if (!topicChannel) {
      throw new Error(`Channel ${CONFIG.TOPIC_DISCUSSION_ID} not found`);
    }
    console.log(`[Leaderboard] Found topic channel: ${topicChannel.name}`);

    // Fetch messages from the last 24 hours
    const now = Date.now();
    const windowStart = now - CONFIG.HOURS_WINDOW * 60 * 60 * 1000;

    let messages = [];
    let lastId = undefined;

    console.log(`[Leaderboard] Fetching messages from last ${CONFIG.HOURS_WINDOW} hours...`);

    while (true) {
      const batch = await topicChannel.messages.fetch({
        limit: 100,
        ...(lastId && { before: lastId }),
      });

      if (batch.size === 0) break;

      const relevantMessages = batch.filter((msg) => {
        return (
          msg.createdTimestamp >= windowStart &&
          msg.author.id !== client.user.id && // Exclude self
          msg.content.length > 0
        );
      });

      messages = [...messages, ...relevantMessages.values()];

      if (batch.size < 100) break;

      lastId = batch.last().id;
    }

    console.log(`[Leaderboard] Found ${messages.length} messages to evaluate`);

    if (messages.length === 0) {
      console.log('[Leaderboard] No messages to evaluate');
      await client.destroy();
      return;
    }

    // Evaluate all messages
    const scores = updateScores(messages);
    console.log(`[Leaderboard] Evaluated ${messages.length} messages`);

    if (CONFIG.DEBUG) {
      console.log('[DEBUG] Scores data:', JSON.stringify(scores, null, 2));
    }

    // Calculate window scores
    const windowScores = calculateWindowScores(scores.participants, CONFIG.HOURS_WINDOW);
    console.log(`[Leaderboard] Calculated scores for ${Object.keys(windowScores).length} participants`);

    // Generate coaching tip
    const coachingTip = generateCoachingTip(scores.participants);
    console.log(`[Leaderboard] Generated coaching tip`);

    // Format leaderboard
    const leaderboardTable = formatLeaderboard(windowScores, '24h');
    const fullPost = formatProfessorChuckPost(leaderboardTable, coachingTip);

    if (CONFIG.DEBUG) {
      console.log('[DEBUG] Full post:\n', fullPost);
    }

    // Post to announcements
    const announcementsChannel = await guild.channels.fetch(CONFIG.ANNOUNCEMENTS_ID);
    if (!announcementsChannel) {
      throw new Error(`Announcements channel ${CONFIG.ANNOUNCEMENTS_ID} not found`);
    }

    // Delete previous leaderboard post (if exists)
    const existingPosts = await announcementsChannel.messages.fetch({ limit: 10 });
    const oldLeaderboard = existingPosts.find((msg) => msg.content.includes('Daily Leaderboard'));
    if (oldLeaderboard) {
      await oldLeaderboard.delete();
      console.log('[Leaderboard] Deleted previous leaderboard post');
    }

    // Post new leaderboard
    await announcementsChannel.send(fullPost);
    console.log('[Leaderboard] ✅ Posted leaderboard to #announcements');

    await client.destroy();
  } catch (error) {
    console.error('[Leaderboard] Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  evaluateMessage,
  formatLeaderboard,
  formatProfessorChuckPost,
  calculateWindowScores,
  generateCoachingTip,
};
