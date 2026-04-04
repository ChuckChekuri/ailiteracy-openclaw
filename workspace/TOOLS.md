# TOOLS.md - TA Bot Knowledge Base

This file provides the agent with specific, actionable information to help students with the CPSC 481.07 OpenClaw project. It acts as a "cheat sheet" for answering common questions and troubleshooting setup issues.

## Core Project Files

This is the list of essential files the agent should be able to explain to students.

- **`README.md`**: The primary instruction manual. Contains the full setup process, from Discord bot creation to running the agent. **This is the first place to look for answers.**
- **`SECURITY.md`**: Explains the "sandbox" environment. Details how `OPENCLAW_HOME` is redirected, how file system access is restricted to the `./workspace` directory, and why this is important for AI safety.
- **`openclaw.json`**: The main configuration file. Defines the agent's identity, Discord channel bindings, and gateway settings.
- **`.env`**: The file for secret keys. Stores the `OPENAI_API_KEY` and all `DISCORD_*` credentials. **Never ask the student to share the contents of this file.**
- **`package.json`**: Defines the project's `npm` scripts (`setup`, `check`, `onboard`, `start`, `restart`). The agent should be able to explain what each of these scripts does.
- **`run-openclaw.ps1` / `run-openclaw.sh`**: The launcher scripts that set the `OPENCLAW_HOME` and `OPENCLAW_CONFIG_PATH` environment variables before starting the agent.

## Common Student Questions & Troubleshooting Steps

Use this section to provide quick, accurate answers to frequent problems.

### "My agent won't start" or "channels unresolved"

1. **Verify `.env`**: Ask the student to confirm they have created a `.env` file and filled in all the required `DISCORD_*` and `OPENAI_API_KEY` values.
2. **Check `openclaw.json`**: The `channels.discord.guilds` section should use the literal numeric IDs for the guild and channels, not `${...}` placeholders.
3. **Restart Process**: Advise the student to stop the agent (`Ctrl+C`) and use `npm run restart:win` (or `:mac`) to ensure a clean start.

### "My agent is online but not sending messages"

1. **Check Discord Permissions**: This is the most common cause. The bot's role needs `Send Messages` and `Send Messages in Threads` in the relevant channels/categories. The `audit` section of the gateway health status can confirm this.
2. **Review Agent Logic**: Remind the student that their agent has specific triggers defined in its persona files (e.g., `agents/my_agent.md`). It won't respond to everything, only to the inputs it's programmed to look for.
3. **Check for API Errors**: Ask the student to check the terminal logs for any errors related to OpenAI (e.g., authentication, billing issues) or Discord (e.g., rate limits).

### "What does `npm run onboard` do?"

- It's a connection test wizard. It verifies that the API keys and Discord credentials in the `.env` file are correct *before* doing a full start. It ensures the agent can connect to all necessary services.

### "What is the `workspace/` folder for?"

- It's the agent's "brain" or knowledge base. It contains the `IDENTITY.md`, `AGENTS.md`, and `SOUL.md` files that define the agent's personality and rules. It's also where students should place course materials (like PDFs) for their agents to read. The agent cannot access any files outside this folder.

---
This document is the agent's primary reference for providing support. It should be updated as new common questions or issues arise.
