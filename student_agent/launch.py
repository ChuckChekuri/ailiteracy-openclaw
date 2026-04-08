#!/usr/bin/env python3

"""
Student Agent Launcher

Convenience script to initialize and run the Student Agent with proper
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
logger = logging.getLogger('StudentAgent.Launcher')


def validate_environment():
    """Validate required environment variables"""
    
    required_vars = [
        'DISCORD_GUILD_ID',
        'ANNOUNCEMENTS_ID',
        'TOPIC_DISCUSSION_ID',
        'GENERAL_ID',
        'STUDENT_DISCORD_TOKEN',
        'OLLAMA_HOST',
        'OLLAMA_MODEL',
    ]
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        logger.error(f"Missing environment variables: {', '.join(missing)}")
        logger.error(f"Copy .env.example to .env and fill in the values")
        return False
    
    logger.info("✓ Environment validation passed")
    return True


def test_discord_token():
    """Test Discord bot token validity"""
    try:
        import discord
        logger.info("✓ discord.py library found")
        return True
    except ImportError:
        logger.error("discord.py not installed. Run: pip install -r requirements.txt")
        return False


def test_ollama_connection():
    """Test Ollama server connectivity"""
    try:
        import requests
        
        ollama_host = os.getenv('OLLAMA_HOST', 'http://chucks-mac-studio:11434')
        ollama_model = os.getenv('OLLAMA_MODEL', 'qwen3-14b-edu-clean')
        
        response = requests.get(f"{ollama_host}/api/tags", timeout=5)
        
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [m.get('name') for m in models]
            
            if any(ollama_model in name for name in model_names):
                logger.info(f"✓ Ollama connected ({ollama_host})")
                logger.info(f"✓ Model '{ollama_model}' available")
                return True
            else:
                logger.warning(f"Model '{ollama_model}' not found on Ollama server")
                logger.warning(f"Available models: {', '.join(model_names)}")
                return False
        else:
            logger.error(f"Ollama server error: {response.status_code}")
            return False
    
    except requests.exceptions.ConnectionError:
        logger.error(f"Cannot connect to Ollama at {os.getenv('OLLAMA_HOST')}")
        logger.error("Make sure Ollama is running (ollama serve)")
        return False
    except Exception as e:
        logger.error(f"Error testing Ollama: {e}")
        return False


def main():
    """Main launcher"""
    
    parser = argparse.ArgumentParser(description='Run Student Agent')
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
    
    if not test_ollama_connection():
        logger.warning("Ollama connection test failed (non-fatal)")
    
    if args.validate_only:
        logger.info("✓ All validations passed")
        return
    
    # Start Student Agent
    logger.info("=" * 60)
    logger.info("Starting Student Agent...")
    logger.info("=" * 60)
    
    try:
        from core import create_bot, setup_student_agent
        import asyncio
        
        bot = create_bot()
        asyncio.run(setup_student_agent(bot))
        
        logger.info("Student Agent initialized and ready")
        logger.info("Bot connecting to Discord...")
        
        bot.run(os.getenv('STUDENT_DISCORD_TOKEN'))
    
    except ImportError as e:
        logger.error(f"Import error: {e}")
        logger.error("Run: pip install -r requirements.txt")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Student Agent stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
