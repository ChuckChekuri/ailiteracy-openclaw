#!/usr/bin/env python3

"""
Student Agent Core Logic

Purpose: Implement strategic participation in #topic-discussion with explicit
dimension targeting, peer assistance mode, and strict adherence to Student Agent
constraints from student_agent.md.

Activation: Only responds to Instructor posts in #announcements
Output: #topic-discussion (substantive posts) and replies to peer questions
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

import discord
from discord.ext import commands, tasks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(name)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger('StudentAgent')

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Student Agent configuration from environment and constants"""
    
    # Discord IDs
    GUILD_ID = int(os.getenv('DISCORD_GUILD_ID', '1478915631016448020'))
    ANNOUNCEMENTS_ID = int(os.getenv('ANNOUNCEMENTS_ID', '1480106512813654036'))
    TOPIC_DISCUSSION_ID = int(os.getenv('TOPIC_DISCUSSION_ID', '1479995367754960946'))
    GENERAL_ID = int(os.getenv('GENERAL_ID', '1478915632723398961'))
    TOKEN = os.getenv('STUDENT_DISCORD_TOKEN')
    
    # LLM Configuration
    OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://chucks-mac-studio:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen3-14b-edu-clean')
    
    # Agent identity
    AGENT_NAME = "Student Agent"
    AGENT_EMOJI = ":pencil2:"
    
    # State tracking
    STATE_FILE = './.openclaw/student_agent_state.json'


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class ScoringDimension:
    """Represents a scoring dimension from the rubric"""
    
    name: str
    description: str
    signal_phrases: List[str]
    activation_keywords: List[str]
    
    def detect_in_text(self, text: str) -> bool:
        """Check if dimension signals appear in text"""
        text_lower = text.lower()
        return any(phrase in text_lower for phrase in self.signal_phrases)


class RUBRIC:
    """Scoring dimensions from instructor_agent.md"""
    
    ORIGINALITY = ScoringDimension(
        name="Originality",
        description="Adds new thoughts; does not repeat existing ideas",
        signal_phrases=[
            "new angle", "fresh perspective", "here's a thought",
            "what if", "haven't seen", "different from", "unlike what"
        ],
        activation_keywords=[
            "original", "novel", "unique", "new"
        ]
    )
    
    CREATIVITY = ScoringDimension(
        name="Creativity",
        description="Brings unique perspectives, metaphors, or novel angles",
        signal_phrases=[
            "like", "as if", "similar to", "reminiscent", "parallel to",
            "imagine", "picture this", "metaphor", "framework", "lens"
        ],
        activation_keywords=[
            "creative", "imagine", "metaphor", "analogy"
        ]
    )
    
    COLLABORATION = ScoringDimension(
        name="Collaboration",
        description="Builds on peers' ideas; references and extends them",
        signal_phrases=[
            "building on", "extending", "to add to", "great point",
            "@", "agreed", "yes and", "taking that further"
        ],
        activation_keywords=[
            "together", "agree", "combine", "build on"
        ]
    )
    
    CONSENSUS = ScoringDimension(
        name="Consensus Building",
        description="Helps the group converge on shared understanding",
        signal_phrases=[
            "actually", "both are right", "agree and", "synthesis",
            "where we agree", "overlap", "common ground", "convergence"
        ],
        activation_keywords=[
            "consensus", "shared", "together", "convergence"
        ]
    )
    
    REMARKS = ScoringDimension(
        name="Opening/Closing Remarks",
        description="Polished opening and closing that frame the contribution",
        signal_phrases=[
            "building on", "this connects", "let me", "here's",
            "so", "therefore", "thus", "this means"
        ],
        activation_keywords=[
            "opening", "closing", "frame", "polish"
        ]
    )
    
    ALL = [ORIGINALITY, CREATIVITY, COLLABORATION, CONSENSUS, REMARKS]


# ============================================================================
# PEER ASSISTANCE MODE
# ============================================================================

class PeerAssistanceDetector:
    """Detects when human students ask for help about grading/improvement"""
    
    HELP_KEYWORDS = [
        "how do i", "how to", "how can i",
        "how do you", "help me",
        "what should i", "how am i",
        "what's the score", "what's my grade",
        "how do i improve", "how can i get better",
        "what are you looking for",
        "what counts as", "does this count as",
    ]
    
    GRADING_KEYWORDS = [
        "collaboration", "originality", "creativity",
        "consensus", "remarks", "closing", "opening",
        "dimension", "score", "grade", "leaderboard",
        "evaluate", "assessment"
    ]
    
    @staticmethod
    def is_peer_assistance_request(content: str) -> bool:
        """Check if message is a peer asking for grading/improvement help"""
        content_lower = content.lower()
        
        # Must contain help language AND grading-related keywords
        has_help_language = any(kw in content_lower for kw in PeerAssistanceDetector.HELP_KEYWORDS)
        has_grading_mention = any(kw in content_lower for kw in PeerAssistanceDetector.GRADING_KEYWORDS)
        
        return has_help_language and has_grading_mention


# ============================================================================
# RESPONSE GENERATION
# ============================================================================

class ResponseStrategy:
    """Generates strategically dimensioned responses"""
    
    @staticmethod
    def select_dimensions(
        discussion_context: str,
        target_count: int = 2
    ) -> List[ScoringDimension]:
        """
        Select which dimensions to target based on discussion context.
        Always returns at least 2 dimensions.
        """
        dimensions = []
        
        # Heuristic: detect what's missing in the conversation
        context_lower = discussion_context.lower()
        
        # If mostly agreement, add Consensus Building
        if "agree" in context_lower or "yes" in context_lower:
            dimensions.append(RUBRIC.CONSENSUS)
        
        # If mostly ideas, add Collaboration
        if "and" in context_lower or "both" in context_lower:
            dimensions.append(RUBRIC.COLLABORATION)
        
        # If no disagreement, add Originality
        if "but" not in context_lower and "however" not in context_lower:
            dimensions.append(RUBRIC.ORIGINALITY)
        
        # Always include Creativity if fewer than target
        if len(dimensions) < target_count:
            dimensions.append(RUBRIC.CREATIVITY)
        
        # Ensure at least 2
        if len(dimensions) < target_count:
            dimensions.append(RUBRIC.REMARKS)
        
        return dimensions[:target_count]
    
    @staticmethod
    def craft_opening(dimension: ScoringDimension) -> str:
        """Craft a polished opening remark that frames the contribution"""
        
        openings = {
            RUBRIC.ORIGINALITY.name: "Building on that foundation, here's a thought I haven't seen mentioned yet:",
            RUBRIC.CREATIVITY.name: "This reminds me of a different angle we could explore:",
            RUBRIC.COLLABORATION.name: "I want to extend what [Name] said by connecting it to:",
            RUBRIC.CONSENSUS.name: "I think we're actually closer to agreement than it seems. Here's where I see overlap:",
            RUBRIC.REMARKS.name: "Let me frame this for clarity:",
        }
        
        return openings.get(dimension.name, "Here's my perspective:")
    
    @staticmethod
    def craft_closing(dimension: ScoringDimension) -> str:
        """Craft a thoughtful closing remark that signals reflection or progress"""
        
        closings = {
            RUBRIC.ORIGINALITY.name: "So the key insight here is that we haven't fully explored this angle yet.",
            RUBRIC.CREATIVITY.name: "That's why I think this fresh perspective could change how we approach it.",
            RUBRIC.COLLABORATION.name: "And that's how we can synthesize both viewpoints into something stronger.",
            RUBRIC.CONSENSUS.name: "So if I'm right about that overlap, we actually agree on more than we think.",
            RUBRIC.REMARKS.name: "That's the core of what I wanted to say—what are your thoughts?",
        }
        
        return closings.get(dimension.name, "What does everyone think?")


# ============================================================================
# PEER ASSISTANCE RESPONSES
# ============================================================================

class PeerAssistanceResponder:
    """Generates helpful 'study buddy' responses to peer questions"""
    
    STUDY_BUDDY_VOICE = """
Hey! I've been thinking about how Professor Chuck evaluates us too. Here's what I've noticed:

**The Five Dimensions:**
1. **Originality** — Add something genuinely new. Don't just repeat what's been said. Look for gaps in the discussion and fill them.
2. **Creativity** — Use metaphors, analogies, or frameworks from outside the course. Connect ideas in unexpected ways.
3. **Collaboration** — Reference your peers' work explicitly. Say "@[Name], I love that because..." Show you're building together.
4. **Consensus Building** — When you spot disagreement, find the overlap. "We both agree on X. The real question is Y."
5. **Openings/Closings** — Start with a framing sentence. End with a summary or next step. These signal professionalism.

**My Strategy:**
I try to hit at least 2 dimensions in every post. So if I'm building on a peer's idea (Collaboration), I also add a new angle (Originality). The opening and closing frame it professionally.

**The Real Pattern:**
Professor Chuck wants us to **think together**—not separately. Every point should feel like it's part of a conversation, not a solo submission.

Hope that helps! Want to bounce an idea off me for this discussion?
"""
    
    @staticmethod
    def generate_peer_assistance_response(
        human_question: str,
        specific_dimension: Optional[str] = None
    ) -> str:
        """Generate a study buddy response to a peer's grading question"""
        
        response = PeerAssistanceResponder.STUDY_BUDDY_VOICE
        
        # If they asked about a specific dimension, add targeted advice
        if specific_dimension:
            dimension_tips = {
                "originality": "\n\n💡 **For Originality specifically:** Read the whole thread first. Then ask yourself, 'What hasn't anyone said yet?' Fill that gap.",
                "creativity": "\n\n🎨 **For Creativity specifically:** Bring in an analogy or metaphor. Compare it to something from outside the class. That's usually the unlock.",
                "collaboration": "\n\n🤝 **For Collaboration specifically:** Always @mention someone. Explicitly say what you liked about their idea, then extend it.",
                "consensus": "\n\n🔄 **For Consensus Building:** When you mention two different ideas, show the overlap. 'Actually, on second thought, both are saying...'",
                "remarks": "\n\n✨ **For Polished Remarks:** Draft your opening first. Say IN ADVANCE what your main point is. Then your closing can summarize perfectly.",
            }
            response += dimension_tips.get(specific_dimension.lower(), "")
        
        return response


# ============================================================================
# AGENT STATE MANAGEMENT
# ============================================================================

class StateManager:
    """Manages Student Agent state persistence and active discussions"""
    
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
            "active_discussions": [],
            "last_announcements_check": None,
            "peer_assistance_interactions": [],
        }
    
    def _save(self):
        """Save state to disk"""
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")
    
    def add_active_discussion(self, announcement_id: int, topic: str):
        """Mark a new discussion as active"""
        self.state["active_discussions"].append({
            "announcement_id": announcement_id,
            "topic": topic,
            "started_at": datetime.now().isoformat(),
        })
        self._save()
    
    def is_discussion_active(self, announcement_id: int) -> bool:
        """Check if we're actively participating in this discussion"""
        return any(
            d["announcement_id"] == announcement_id
            for d in self.state["active_discussions"]
        )
    
    def log_peer_interaction(self, user_id: int, question: str, response: str):
        """Log a peer assistance interaction"""
        self.state["peer_assistance_interactions"].append({
            "user_id": user_id,
            "question": question[:100],  # Truncate
            "timestamp": datetime.now().isoformat(),
        })
        self._save()


# ============================================================================
# DISCORD BOT
# ============================================================================

class StudentAgent(commands.Cog):
    """Student Agent Discord bot implementation"""
    
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.state = StateManager()
        
        logger.info(f"Initialized {Config.AGENT_NAME}")
        logger.info(f"LLM: {Config.OLLAMA_MODEL} ({Config.OLLAMA_HOST})")
        logger.info(f"Monitoring #announcements (ID: {Config.ANNOUNCEMENTS_ID})")
        logger.info(f"Discussion channel: #topic-discussion (ID: {Config.TOPIC_DISCUSSION_ID})")
    
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
        self.check_announcements.start()
    
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        """Main message handler"""
        
        # Ignore own messages
        if message.author == self.bot.user:
            return
        
        # Ignore bots
        if message.author.bot:
            return
        
        # Check for peer assistance requests in #general or #topic-discussion
        if message.channel.id in [Config.GENERAL_ID, Config.TOPIC_DISCUSSION_ID]:
            if PeerAssistanceDetector.is_peer_assistance_request(message.content):
                await self._handle_peer_assistance(message)
    
    # ========================================================================
    # PEER ASSISTANCE HANDLER
    # ========================================================================
    
    async def _handle_peer_assistance(self, message: discord.Message):
        """Handle peer assistance requests (study buddy mode)"""
        
        logger.info(f"Peer assistance request from {message.author}: {message.content[:50]}...")
        
        # Generate study buddy response
        response = PeerAssistanceResponder.generate_peer_assistance_response(
            message.content
        )
        
        # Send as thread reply to preserve context
        try:
            thread = await message.create_thread(
                name="Study Tips",
                auto_archive_duration=60
            )
            await thread.send(response)
            
            self.state.log_peer_interaction(
                message.author.id,
                message.content,
                response
            )
            
            logger.info(f"Sent peer assistance response to {message.author}")
        except discord.Forbidden:
            # Fallback: reply directly if thread creation fails
            await message.reply(response[:2000])  # Discord limit
    
    # ========================================================================
    # ANNOUNCEMENT MONITORING (MAIN ACTIVATION)
    # ========================================================================
    
    @tasks.loop(minutes=5)
    async def check_announcements(self):
        """
        Periodically check #announcements for new Instructor posts.
        This is the PRIMARY ACTIVATION TRIGGER for Student Agent.
        """
        
        try:
            guild = self.bot.get_guild(Config.GUILD_ID)
            if not guild:
                logger.error(f"Guild {Config.GUILD_ID} not found")
                return
            
            announcements = guild.get_channel(Config.ANNOUNCEMENTS_ID)
            if not announcements:
                logger.error(f"Announcements channel {Config.ANNOUNCEMENTS_ID} not found")
                return
            
            # Fetch recent messages (last 10)
            async for message in announcements.history(limit=10):
                # Only respond to Instructor Agent (or bot with specific name)
                if "Instructor" in message.author.name or message.author.id == message.guild.owner_id:
                    if not self.state.is_discussion_active(message.id):
                        logger.info(f"New Instructor announcement detected: {message.content[:50]}")
                        
                        # Trigger strategic participation
                        await self._participate_in_discussion(message)
                        
                        self.state.add_active_discussion(message.id, message.content[:100])
        
        except Exception as e:
            logger.error(f"Error checking announcements: {e}")
    
    # ========================================================================
    # STRATEGIC PARTICIPATION
    # ========================================================================
    
    async def _participate_in_discussion(self, announcement: discord.Message):
        """
        Participate strategically in #topic-discussion based on Instructor announcement.
        
        Requirements:
        - Target at least 2 scoring dimensions
        - Include formal opening and closing
        - Stay relevant to announced topic
        """
        
        guild = announcement.guild
        topic_channel = guild.get_channel(Config.TOPIC_DISCUSSION_ID)
        
        if not topic_channel:
            logger.error(f"Topic discussion channel {Config.TOPIC_DISCUSSION_ID} not found")
            return
        
        logger.info(f"Generating strategic response for: {announcement.content[:50]}")
        
        # Select target dimensions (at least 2)
        target_dimensions = ResponseStrategy.select_dimensions(
            announcement.content,
            target_count=2
        )
        
        logger.info(f"Target dimensions: {[d.name for d in target_dimensions]}")
        
        # Generate response prompt for LLM
        llm_prompt = self._build_response_prompt(
            announcement.content,
            target_dimensions
        )
        
        # Call LLM to generate response
        response_text = await self._call_ollama(llm_prompt)
        
        if response_text:
            # Validate and post
            formatted_response = self._format_response(
                response_text,
                target_dimensions
            )
            
            try:
                await topic_channel.send(formatted_response)
                logger.info(f"Posted strategic response ({len(formatted_response)} chars)")
            except discord.Forbidden:
                logger.error(f"Permission denied posting to {topic_channel.name}")
            except Exception as e:
                logger.error(f"Error posting response: {e}")
        else:
            logger.warning("LLM returned empty response")
    
    # ========================================================================
    # LLM INTEGRATION
    # ========================================================================
    
    def _build_response_prompt(
        self,
        topic: str,
        dimensions: List[ScoringDimension]
    ) -> str:
        """Build prompt for LLM with dimension constraints"""
        
        dimension_descriptions = "\n".join([
            f"- **{d.name}**: {d.description}"
            for d in dimensions
        ])
        
        prompt = f"""You are {Config.AGENT_NAME}, a thoughtful participant in a college AI discussion.

## Topic from Professor Chuck:
{topic}

## Your Task:
Generate a single substantive discussion post (2-3 paragraphs) that targets these dimensions:
{dimension_descriptions}

## Requirements:
1. Start with a formal opening remark that frames your contribution
2. Contribute an original perspective (don't repeat obvious points)
3. Reference or build on peers' likely points where appropriate
4. End with a thoughtful closing remark or question
5. Keep professional, academic tone
6. Stay relevant to the announced topic

## Example Structure:
[Opening] Here's my thought on this issue:
[Body] I think the key insight is... [cite dimension signals] ... [extend with evidence]
[Closing] So the question becomes: how do we reconcile both perspectives?

## Generate your response:"""
        
        return prompt
    
    async def _call_ollama(self, prompt: str) -> Optional[str]:
        """Call Ollama LLM for response generation"""
        
        try:
            import requests
            
            url = f"{Config.OLLAMA_HOST}/api/generate"
            payload = {
                "model": Config.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7,
                "top_p": 0.9,
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return None
        
        except ImportError:
            logger.error("requests library not installed")
            return None
        except Exception as e:
            logger.error(f"Error calling Ollama: {e}")
            return None
    
    # ========================================================================
    # RESPONSE FORMATTING
    # ========================================================================
    
    def _format_response(
        self,
        raw_response: str,
        dimensions: List[ScoringDimension]
    ) -> str:
        """
        Format raw LLM response with dimension annotations and structure.
        Optionally add dimension tags for transparency.
        """
        
        formatted = raw_response.strip()
        
        # Add dimension metadata as footer comment
        dimension_list = ", ".join([d.name for d in dimensions])
        footer = f"\n\n*[Targeting: {dimension_list}]*"
        
        # Discord has 2000 char limit
        if len(formatted) + len(footer) > 1900:
            formatted = formatted[:1900]
        
        return formatted + footer


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def setup_student_agent(bot: commands.Bot):
    """Setup function called by Discord.py"""
    await bot.add_cog(StudentAgent(bot))
    logger.info("StudentAgent cog loaded")


def create_bot() -> commands.Bot:
    """Create and configure Discord bot"""
    
    if not Config.TOKEN:
        raise ValueError("STUDENT_DISCORD_TOKEN not set in environment")
    
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
    
    # Load Student Agent cog
    import asyncio
    asyncio.run(setup_student_agent(bot))
    
    # Run bot
    logger.info("Starting Student Agent...")
    try:
        bot.run(Config.TOKEN)
    except Exception as e:
        logger.error(f"Failed to run bot: {e}")
        sys.exit(1)
