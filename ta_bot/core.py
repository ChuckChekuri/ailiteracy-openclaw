#!/usr/bin/env python3

"""
TA Bot Core Logic

Purpose: Implement technical support and onboarding for OpenClaw students.
Provides interactive guidance through:
- Installation & setup workflow
- Discord bot configuration
- Environment (.env) troubleshooting
- Permission analysis
- Startup debugging
- Safe Student Agent customization

Voice: Patient, detail-oriented, structured with numbered lists.
Activation: Only responds to @TA-bot mentions in #general.
"""

import os
import sys
import re
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

import discord
from discord.ext import commands

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(name)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger('TABot')

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """TA Bot configuration"""
    
    # Discord IDs
    GUILD_ID = int(os.getenv('DISCORD_GUILD_ID', '1478915631016448020'))
    GENERAL_ID = int(os.getenv('GENERAL_ID', '1478915632723398961'))
    TOKEN = os.getenv('TA_DISCORD_TOKEN')
    
    # TA Bot identity
    AGENT_NAME = "TA Bot"
    AGENT_EMOJI = ":books:"
    MENTION_PREFIX = "@TA-bot"
    
    # State file
    STATE_FILE = './.openclaw/ta_bot_state.json'
    
    # Support channels (where to NOT respond)
    RESTRICTED_CHANNELS = ['topic-discussion', 'announcements']


# ============================================================================
# QUICK-START WORKFLOW
# ============================================================================

class QuickStartWorkflow:
    """Guides students through the 4-milestone setup process"""
    
    class Milestone:
        """Represents a setup milestone"""
        
        def __init__(self, name: str, description: str, steps: List[str]):
            self.name = name
            self.description = description
            self.steps = steps
    
    MILESTONES = [
        Milestone(
            name="Get Repo Running",
            description="Clone OpenClaw and verify Python/Node setup",
            steps=[
                "Clone the repository: `git clone https://github.com/ChuckChekuri/ailiteracy-openclaw.git`",
                "Navigate to the repo: `cd ailiteracy-openclaw`",
                "Check Python: `python3 --version` (need 3.9+)",
                "Check Node: `node --version` (need 14+)",
                "Check Git: `git --version`",
            ]
        ),
        Milestone(
            name="Connect Discord Bot",
            description="Create your own Discord bot and get the token",
            steps=[
                "Go to Discord Developer Portal: https://discord.com/developers/applications",
                "Click 'New Application', give it a name (e.g., 'My-Student-Agent')",
                "Go to 'Bot' section, click 'Add Bot'",
                "Under TOKEN, click 'Copy' (⚠️  Never share this token)",
                "Go to OAuth2 > URL Generator > Select scopes: 'bot'",
                "Select permissions: 'Send Messages', 'Read Messages/View Channels', 'Create Public Threads'",
                "Copy the generated URL and open it to add bot to your server",
                "Paste token into your `.env` file",
            ]
        ),
        Milestone(
            name="Copy Reference Student Agent",
            description="Start from workspace/ta/reference-student/ baseline",
            steps=[
                "Copy the reference baseline: `cp -r workspace/ta/reference-student/ my-student-agent/`",
                "Navigate to it: `cd my-student-agent`",
                "Verify directory structure: `ls` (should show IDENTITY.md, SOUL.md, etc.)",
                "Read the baseline: Start with `cat SOUL.md` to understand voice",
            ]
        ),
        Milestone(
            name="Customize Safely",
            description="Create your own Student Agent while preserving course rules",
            steps=[
                "Edit IDENTITY.md: Change Name, Role, but keep Primary Channel and Output Channel",
                "Edit SOUL.md: Change voice tone, examples, personality (preserve scoring dimension values)",
                "Test locally: Follow the testing checklist",
                "Verify rules are intact: Activation should still be Instructor-only",
                "Deploy when ready",
            ]
        ),
    ]
    
    @staticmethod
    def get_milestone_summary() -> str:
        """Get overview of all milestones"""
        summary = "**4-Milestone Quick-Start Workflow**\n\n"
        for i, milestone in enumerate(QuickStartWorkflow.MILESTONES, 1):
            summary += f"**{i}. {milestone.name}** — {milestone.description}\n"
        summary += "\nWhich milestone are you on, or do you want to start from Milestone 1?"
        return summary
    
    @staticmethod
    def get_milestone_detail(milestone_num: int) -> Optional[str]:
        """Get detailed steps for a specific milestone"""
        if not (1 <= milestone_num <= len(QuickStartWorkflow.MILESTONES)):
            return None
        
        milestone = QuickStartWorkflow.MILESTONES[milestone_num - 1]
        detail = f"**Milestone {milestone_num}: {milestone.name}**\n\n"
        detail += f"{milestone.description}\n\n"
        detail += "**Steps:**\n"
        
        for i, step in enumerate(milestone.steps, 1):
            detail += f"{i}. {step}\n"
        
        detail += f"\nOnce you've completed these steps, let me know and we'll move to Milestone {milestone_num + 1}."
        return detail


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

class Troubleshooter:
    """Provides structured debugging support for common issues"""
    
    class TroubleshootGuide:
        """Represents a troubleshooting guide for a common problem"""
        
        def __init__(self, name: str, symptoms: List[str], steps: List[str]):
            self.name = name
            self.symptoms = symptoms  # What user might complain about
            self.steps = steps        # Numbered troubleshooting steps
    
    GUIDES = [
        TroubleshootGuide(
            name=".env Configuration Mistakes",
            symptoms=[
                "bot token invalid", "environment error", "missing env", "env not found",
                "channel id wrong", "guild id error"
            ],
            steps=[
                "Check `.env` file exists: `ls -la | grep .env`",
                "Verify it's not hidden or in wrong directory",
                "Open and check format: `cat .env` (should be `KEY=value` per line)",
                "Verify no spaces around `=`: ✓ `TOKEN=abc123` ✗ `TOKEN = abc123`",
                "Verify all required keys are present (see .env.example for template)",
                "Verify no quotes around values: ✓ `TOKEN=abc123` ✗ `TOKEN='abc123'`",
                "If using Discord IDs, verify they're correct: Right-click channel/server → Copy ID",
                "Reload environment: `source .env` (Linux/Mac) or reopen terminal (Windows)",
                "Try again: `python3 launch.py --validate-only`",
            ]
        ),
        TroubleshootGuide(
            name="Discord Bot Permissions",
            symptoms=[
                "permission denied", "bot can't send", "no permission", "forbidden",
                "missing permissions", "bot can't post"
            ],
            steps=[
                "Go to Discord server, right-click bot user → 'Manage'",
                "Check roles: Should have at least one role with these permissions:",
                "  ✓ Send Messages",
                "  ✓ Read Messages/View Channels",
                "  ✓ Create Public Threads (if using threads)",
                "If roles look correct, also check channel-level overrides:",
                "  Go to #general → Settings (gear) → Permissions → Find bot role",
                "  Verify 'Send Messages' is not explicitly denied (red X)",
                "If still blocked, try giving bot a higher role (Admin test only)",
                "Restart bot after permission changes: Stop and re-run `python3 launch.py`",
            ]
        ),
        TroubleshootGuide(
            name="Startup Failures",
            symptoms=[
                "bot won't start", "connection error", "failed to connect", "crashed",
                "import error", "module not found", "token invalid"
            ],
            steps=[
                "Check error message carefully: `python3 launch.py 2>&1 | head -30`",
                "If 'module not found' (e.g., discord): Install dependencies",
                "  Run: `pip install -r requirements.txt`",
                "If 'token invalid': Verify TOKEN in .env is correct",
                "  Regenerate from Developer Portal if unsure",
                "If 'Connection refused': Check internet connection, Discord status page",
                "If 'getaddrinfo failed': Network/DNS issue → Try restarting terminal",
                "If 'Intents error': Update discord.py: `pip install --upgrade discord.py`",
                "Try debug mode: `python3 launch.py --debug` (verbose output)",
                "Still stuck? Share the exact error message in next reply",
            ]
        ),
        TroubleshootGuide(
            name="Discord Token Exposure (SECURITY)",
            symptoms=[
                "i posted token by accident", "token is compromised", "exposed token",
                "need to regenerate", "leaked token"
            ],
            steps=[
                "⚠️  **IMMEDIATELY regenerate token** (exposed tokens allow account hijack)",
                "Open Discord Developer Portal → Applications → Your App → Bot",
                "Click 'Regenerate' under TOKEN section",
                "Copy new token to `.env` file",
                "Restart bot: Stop it, then run `python3 launch.py`",
                "Verify new token works by checking Discord for bot connection message",
                "Delete any old message that contained the exposed token",
                "Remember: Never screenshot, paste, or share your bot token (it's like a password)",
            ]
        ),
        TroubleshootGuide(
            name="Student Agent Not Responding",
            symptoms=[
                "student agent never posts", "no response", "agent silent",
                "why isn't my bot working", "bot inactive"
            ],
            steps=[
                "Verify bot is running: Check if terminal shows 'Connected to Discord'",
                "Verify bot is in the server: Look for it in members list",
                "Verify bot has correct permissions: Follow 'Discord Bot Permissions' guide above",
                "Check if Instructor posted in #announcements: Is there a new topic?",
                "Allow 5-10 minutes for bot to detect and respond (default 5-min polling)",
                "Check logs for errors: `grep ERROR logs/student_agent.log` (if logging enabled)",
                "If Ollama-based: Verify Ollama is running: `curl http://chucks-mac-studio:11434/api/tags`",
                "If still stuck, restart bot: Stop (Ctrl+C) and run again",
            ]
        ),
    ]
    
    @staticmethod
    def detect_issue(message: str) -> Optional[TroubleshootGuide]:
        """Detect which issue the student is describing"""
        message_lower = message.lower()
        
        for guide in Troubleshooter.GUIDES:
            for symptom in guide.symptoms:
                if symptom in message_lower:
                    return guide
        
        return None
    
    @staticmethod
    def get_guide_for_issue(guide: TroubleshootGuide) -> str:
        """Format troubleshooting guide for display"""
        result = f"**Troubleshooting: {guide.name}**\n\n"
        result += "Let's work through this step by step:\n\n"
        
        for i, step in enumerate(guide.steps, 1):
            result += f"{i}. {step}\n"
        
        result += "\nTry the first step and let me know what happens!"
        return result


# ============================================================================
# CUSTOMIZATION GUIDANCE
# ============================================================================

class CustomizationGuide:
    """Helps students safely customize Student Agent while preserving course rules"""
    
    PROTECTED_ELEMENTS = {
        "activation_rule": "Only respond to Instructor posts in #announcements",
        "channel_boundaries": "Never speak in #topic-discussion or #announcements",
        "scoring_dimensions": "Must target the five dimensions: Originality, Creativity, Collaboration, Consensus Building, Remarks",
        "opening_closing": "Must include polished opening and closing remarks",
    }
    
    SAFE_CUSTOMIZATIONS = {
        "IDENTITY.md": [
            "✓ Change agent Name (e.g., 'Alice-Bot' instead of 'Student Agent')",
            "✓ Change Emoji to match personality",
            "✓ Adjust Role description (e.g., 'Discussion Lead' vs 'Active Participant')",
            "✗ DO NOT change Primary Channel or Output Channel",
        ],
        "SOUL.md": [
            "✓ Rewrite voice tone and personality (sarcastic, formal, casual, etc.)",
            "✓ Add personal examples or catchphrases",
            "✓ Adjust discussion values and priorities",
            "✗ DO NOT remove the five scoring dimensions",
            "✗ DO NOT change when/where bot responds",
        ],
        "AGENTS.md": [
            "✓ Clarify activation logic in your own words",
            "✓ Add agent-specific interaction details",
            "✗ DO NOT change the activation rule (Instructor-only)",
            "✗ DO NOT add responding to peer messages",
        ],
    }
    
    @staticmethod
    def get_customization_overview() -> str:
        """Overview of safe customization"""
        overview = "**Safe Student Agent Customization**\n\n"
        overview += "Great! You can make your agent unique while staying within course rules.\n\n"
        
        for file, guidelines in CustomizationGuide.SAFE_CUSTOMIZATIONS.items():
            overview += f"**{file}**:\n"
            for guideline in guidelines:
                overview += f"  {guideline}\n"
            overview += "\n"
        
        overview += "**Protected Course Rules** (never change these):\n"
        for rule, description in CustomizationGuide.PROTECTED_ELEMENTS.items():
            overview += f"• {description}\n"
        
        return overview
    
    @staticmethod
    def validate_customization(soul_content: str) -> Tuple[bool, List[str]]:
        """Validate that customized SOUL.md still meets course requirements"""
        issues = []
        
        # Check for five dimensions
        dimensions = [
            "originality", "creativity", "collaboration", "consensus", "remarks"
        ]
        
        soul_lower = soul_content.lower()
        missing_dimensions = [d for d in dimensions if d not in soul_lower]
        
        if missing_dimensions:
            issues.append(f"Missing dimensions: {', '.join(missing_dimensions)}")
        
        # Check for channel boundaries (should still reference only topic-discussion)
        if "#announcements" in soul_content and "never" not in soul_content.lower():
            issues.append("SOUL.md should state you never speak in #announcements")
        
        return len(issues) == 0, issues


# ============================================================================
# STATE MANAGEMENT
# ============================================================================

class StateManager:
    """Manages TA Bot state and student support context"""
    
    def __init__(self, state_file: str = Config.STATE_FILE):
        self.state_file = state_file
        self.state = self._load()
    
    def _load(self) -> Dict:
        """Load state from disk"""
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load state: {e}")
        
        return {
            "student_contexts": {},      # user_id → {milestone, status, blockers}
            "support_interactions": [],  # List of all support interactions
            "faq_queries": {},           # Frequently asked questions tracking
        }
    
    def _save(self):
        """Save state to disk"""
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")
    
    def get_student_context(self, user_id: int) -> Dict:
        """Get a student's support context"""
        user_id_str = str(user_id)
        if user_id_str not in self.state["student_contexts"]:
            self.state["student_contexts"][user_id_str] = {
                "current_milestone": 1,
                "status": "new",
                "blockers": [],
                "first_contact": datetime.now().isoformat(),
            }
            self._save()
        return self.state["student_contexts"][user_id_str]
    
    def update_milestone(self, user_id: int, milestone: int):
        """Track which milestone student is on"""
        context = self.get_student_context(user_id)
        context["current_milestone"] = milestone
        context["status"] = f"milestone_{milestone}"
        self._save()
    
    def log_interaction(self, user_id: int, interaction_type: str, content: str):
        """Log support interaction for future reference"""
        self.state["support_interactions"].append({
            "user_id": user_id,
            "type": interaction_type,
            "timestamp": datetime.now().isoformat(),
            "content": content[:200],  # Truncate
        })
        self._save()


# ============================================================================
# RESPONSE GENERATION
# ============================================================================

class ResponseGenerator:
    """Generates structured TA Bot responses"""
    
    @staticmethod
    def greeting(user_name: str, is_new: bool = True) -> str:
        """Generate greeting based on student status"""
        
        if is_new:
            greeting = f"Hi {user_name}! 👋 Welcome to OpenClaw setup help.\n\n"
            greeting += "I'm here to help you:\n"
            greeting += "1. Get the repo running\n"
            greeting += "2. Connect a Discord bot\n"
            greeting += "3. Copy the reference Student Agent\n"
            greeting += "4. Customize safely\n\n"
            greeting += "**Are you brand new to this, or are you already working on a specific step?**"
        else:
            greeting = f"Hey {user_name}! 👋 What can I help you with today?"
        
        return greeting
    
    @staticmethod
    def guide_next_step(current_milestone: int) -> str:
        """Guide to next setup step"""
        
        if current_milestone > len(QuickStartWorkflow.MILESTONES):
            return "🎉 You've completed all milestones! Your custom Student Agent is ready. Good luck in the course!"
        
        milestone = QuickStartWorkflow.MILESTONES[current_milestone - 1]
        guidance = f"**Let's work on Milestone {current_milestone}: {milestone.name}**\n\n"
        guidance += f"{milestone.description}\n\n"
        guidance += "**Here are the steps:**\n"
        
        for i, step in enumerate(milestone.steps, 1):
            guidance += f"{i}. {step}\n"
        
        guidance += f"\n**What was the first step you've already completed, or are you starting fresh?**"
        return guidance
    
    @staticmethod
    def permission_check_guide() -> str:
        """Guide for verifying Discord bot permissions"""
        guide = "**Discord Bot Permission Check**\n\n"
        guide += "Let's verify your bot has the right permissions:\n\n"
        guide += "1. Go to Discord → Server Settings (gear icon)\n"
        guide += "2. Click 'Roles'\n"
        guide += "3. Find your bot's role (e.g., 'My-Student-Agent')\n"
        guide += "4. Click the role and scroll down to Permissions\n"
        guide += "5. Check that these are ✓ (enabled):\n"
        guide += "   - **Send Messages**\n"
        guide += "   - **Read Messages/View Channels**\n"
        guide += "   - **Create Public Threads** (optional but recommended)\n\n"
        guide += "6. Also check channel-level permissions:\n"
        guide += "   - Go to #general Channel Settings → Permissions\n"
        guide += "   - Find your bot's role\n"
        guide += "   - Verify nothing is explicitly denied (red ✗)\n\n"
        guide += "**Screenshot or tell me: Are all checkmarks green, or do you see any red X marks?**"
        return guide
    
    @staticmethod
    def env_template() -> str:
        """Provide .env template with explanation"""
        template = "**.env Template and Explanation**\n\n"
        template += "Create a file called `.env` in your project root with these values:\n\n"
        template += "```\n"
        template += "# Discord Configuration\n"
        template += "DISCORD_GUILD_ID=your_server_id_here\n"
        template += "GENERAL_ID=your_general_channel_id_here\n"
        template += "ANNOUNCEMENTS_ID=your_announcements_channel_id_here\n"
        template += "TOPIC_DISCUSSION_ID=your_topic_discussion_channel_id_here\n"
        template += "\n"
        template += "# Your Discord Bot Token (KEEP SECRET!)\n"
        template += "STUDENT_DISCORD_TOKEN=your_bot_token_here\n"
        template += "\n"
        template += "# LLM Configuration (if using Ollama)\n"
        template += "OLLAMA_HOST=http://localhost:11434\n"
        template += "OLLAMA_MODEL=qwen3-14b-edu-clean\n"
        template += "```\n\n"
        template += "**How to find each ID:**\n"
        template += "• **Server ID**: Right-click server name → Copy Server ID\n"
        template += "• **Channel IDs**: Right-click channel → Copy Channel ID\n"
        template += "• **Bot Token**: Discord Developer Portal → Applications → Your App → Bot → Copy Token\n\n"
        template += "**Do NOT share or post your bot token anywhere!**"
        return template


# ============================================================================
# DISCORD BOT
# ============================================================================

class TABot(commands.Cog):
    """TA Bot Discord integration"""
    
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.state = StateManager()
        
        logger.info(f"Initialized {Config.AGENT_NAME}")
        logger.info(f"Monitoring #general for @{Config.MENTION_PREFIX} mentions")
    
    # ========================================================================
    # EVENT HANDLERS
    # ========================================================================
    
    @commands.Cog.listener()
    async def on_ready(self):
        """Bot startup"""
        logger.info(f"Connected to Discord as {self.bot.user}")
        guild = self.bot.get_guild(Config.GUILD_ID)
        if guild:
            logger.info(f"Guild: {guild.name}")
    
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        """Main message handler"""
        
        # Ignore own messages
        if message.author == self.bot.user:
            return
        
        # Ignore bots
        if message.author.bot:
            return
        
        # Only respond in #general
        if message.channel.id != Config.GENERAL_ID:
            if message.channel.name and any(
                restricted in message.channel.name 
                for restricted in Config.RESTRICTED_CHANNELS
            ):
                logger.debug(f"Ignored message in restricted channel: {message.channel.name}")
            return
        
        # Only respond to mentions
        if Config.MENTION_PREFIX not in message.content:
            return
        
        logger.info(f"Mention detected from {message.author}: {message.content[:50]}...")
        
        await self._handle_mention(message)
    
    # ========================================================================
    # MENTION HANDLER
    # ========================================================================
    
    async def _handle_mention(self, message: discord.Message):
        """Handle @TA-bot mentions in #general"""
        
        author = message.author
        user_context = self.state.get_student_context(author.id)
        
        # Extract actual question (remove mention)
        question = message.content.replace(Config.MENTION_PREFIX, "").strip()
        
        # Log the interaction
        self.state.log_interaction(author.id, "mention", question)
        
        # Route to appropriate handler
        response = await self._route_question(question, user_context, author.name)
        
        if response:
            # Send response in chunks if needed (Discord 2000 char limit)
            for chunk in self._chunk_response(response, 2000):
                await message.reply(chunk, mention_author=False)
    
    async def _route_question(self, question: str, context: Dict, user_name: str) -> str:
        """Route question to appropriate handler"""
        
        question_lower = question.lower()
        
        # Check for workflow/milestone questions
        if any(word in question_lower for word in ["milestone", "step", "where", "start", "begin", "hello", "hi", "help"]):
            if not question_lower or "hi" in question_lower or "help" in question_lower or "start" in question_lower:
                # First contact or asking for overview
                return ResponseGenerator.greeting(user_name, is_new=True)
        
        # Check for quick-start workflow overview
        if any(word in question_lower for word in ["milestone", "overview", "workflow", "steps"]):
            return QuickStartWorkflow.get_milestone_summary()
        
        # Check for specific milestone (Milestone 1, 2, 3, 4)
        milestone_match = re.search(r'milestone\s+(\d)', question_lower)
        if milestone_match:
            milestone_num = int(milestone_match.group(1))
            detail = QuickStartWorkflow.get_milestone_detail(milestone_num)
            if detail:
                self.state.update_milestone(author.id, milestone_num)
                return detail
        
        # Check for troubleshooting/error questions
        issue_guide = Troubleshooter.detect_issue(question)
        if issue_guide:
            return Troubleshooter.get_guide_for_issue(issue_guide)
        
        # Check for customization questions
        if any(word in question_lower for word in ["customize", "custom", "change", "modify", "my own", "personalize"]):
            return CustomizationGuide.get_customization_overview()
        
        # Check for .env or Discord setup
        if any(word in question_lower for word in [".env", "environment", "token"]):
            return ResponseGenerator.env_template()
        
        # Check for permissions
        if any(word in question_lower for word in ["permission", "can't send", "forbidden", "access", "role"]):
            return ResponseGenerator.permission_check_guide()
        
        # Default: offer help
        return (
            f"Hi {user_name}! I can help with:\n"
            f"1. **Setup Workflow** — Ask about 'Milestone 1', 'Milestone 2', etc.\n"
            f"2. **Troubleshooting** — Describe any errors you're seeing\n"
            f"3. **.env Setup** — Ask about 'token' or 'environment'\n"
            f"4. **Discord Permissions** — Ask about 'permissions' or 'bot roles'\n"
            f"5. **Customization** — Ask how to safely customize your Student Agent\n\n"
            f"**What do you need help with?**"
        )
    
    # ========================================================================
    # UTILITIES
    # ========================================================================
    
    @staticmethod
    def _chunk_response(text: str, chunk_size: int = 2000) -> List[str]:
        """Split response into Discord-safe chunks"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        current_chunk = ""
        
        # Split by paragraphs to preserve formatting
        paragraphs = text.split("\n\n")
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= chunk_size:
                if current_chunk:
                    current_chunk += "\n\n"
                current_chunk += paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = paragraph
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def setup_ta_bot(bot: commands.Bot):
    """Setup function called by Discord.py"""
    await bot.add_cog(TABot(bot))
    logger.info("TABot cog loaded")


def create_bot() -> commands.Bot:
    """Create and configure Discord bot"""
    
    if not Config.TOKEN:
        raise ValueError("TA_DISCORD_TOKEN not set in environment")
    
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guilds = True
    
    bot = commands.Bot(command_prefix='!', intents=intents)
    
    @bot.event
    async def on_ready():
        logger.info(f"Bot connected as {bot.user}")
    
    return bot


if __name__ == "__main__":
    bot = create_bot()
    
    # Load TA Bot cog
    import asyncio
    asyncio.run(setup_ta_bot(bot))
    
    # Run bot
    logger.info("Starting TA Bot...")
    try:
        bot.run(Config.TOKEN)
    except Exception as e:
        logger.error(f"Failed to run bot: {e}")
        sys.exit(1)
