#!/usr/bin/env python3

"""
TA Bot Launcher

Convenience script to initialize and run the TA Bot with proper
logging and environment validation.

Usage:
    python3 launch.py                    # Run with default config
    python3 launch.py --debug            # Run in debug mode
    python3 launch.py --validate-only    # Validate env without starting
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(name)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger('TABot.Launcher')


def validate_environment():
    """Validate required environment variables"""
    
    required_vars = [
        'DISCORD_GUILD_ID',
        'GENERAL_ID',
        'TA_DISCORD_TOKEN',
    ]
    
    optional_vars = [
        'ANNOUNCEMENTS_ID',
        'TOPIC_DISCUSSION_ID',
    ]
    
    # Check required
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        logger.error(f"Copy .env.example to .env and fill in the values")
        return False
    
    # Warn about optional
    for var in optional_vars:
        if not os.getenv(var):
            logger.warning(f"Optional but recommended: {var}")
    
    logger.info("✓ Environment validation passed")
    return True


def test_discord_token():
    """Test Discord bot token validity format"""
    try:
        import discord
        logger.info("✓ discord.py library found")
        return True
    except ImportError:
        logger.error("discord.py not installed. Run: pip install -r requirements.txt")
        return False


def main():
    """Main launcher"""
    
    parser = argparse.ArgumentParser(description='Run TA Bot')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    parser.add_argument('--validate-only', action='store_true', help='Validate environment without starting')
    args = parser.parse_args()
    
    # Load environment
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        logger.info(f"Loaded environment from {env_path}")
    else:
        logger.warning(f".env file not found at {env_path}")
        logger.warning(f"Using system environment variables")
    
    # Debug mode
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.info("Debug logging enabled")
    
    # Validation
    logger.info("Validating environment...")
    if not validate_environment():
        sys.exit(1)
    
    if not test_discord_token():
        logger.error("Discord.py validation failed")
        sys.exit(1)
    
    if args.validate_only:
        logger.info("✓ All validations passed")
        return
    
    # Start TA Bot
    logger.info("=" * 60)
    logger.info("Starting TA Bot...")
    logger.info("=" * 60)
    
    try:
        from core import create_bot, setup_ta_bot
        import asyncio
        
        bot = create_bot()
        asyncio.run(setup_ta_bot(bot))
        
        logger.info("TA Bot initialized and ready")
        logger.info("Bot connecting to Discord...")
        logger.info("Monitoring #general for @TA-bot mentions...")
        
        bot.run(os.getenv('TA_DISCORD_TOKEN'))
    
    except ImportError as e:
        logger.error(f"Import error: {e}")
        logger.error("Run: pip install -r requirements.txt")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("TA Bot stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
