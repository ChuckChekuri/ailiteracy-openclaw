# Welcome to the CSUF AI Literacy OpenClaw Project

This guide is for students who want to set up a working, customized Student Agent from scratch.

The shortest safe path is:
1. Install the project.
2. Prepare your local `.env` file.
3. Start OpenClaw.
4. Create and connect your Discord bot.
5. Copy the TA's `reference-student/` template.
6. Customize safely without breaking course rules.
7. Validate your setup before asking for help.

## Step 1: Install the Project

From the repository root, run:

```powershell
npm install
npm run setup
```

## Step 2: Prepare Your Local Environment

If needed, create `.env` from the example file:

```powershell
Copy-Item .\.env.example .\.env -Force
```

Open `.env` and replace placeholders with your own local values.

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_APP_ID=YOUR_DISCORD_APPLICATION_ID
DISCORD_GUILD_ID=YOUR_DISCORD_SERVER_ID
INFO_ANNOUNCEMENTS_CHANNEL_ID=YOUR_ANNOUNCEMENTS_CHANNEL_ID
ACTIVE_TOPICS_CATEGORY_ID=YOUR_ACTIVE_TOPICS_CATEGORY_ID
ARCHIVED_CATEGORY_ID=YOUR_ARCHIVED_CATEGORY_ID
```

Never paste real tokens or keys into Discord chat.

## Step 3: Start OpenClaw

Run one of these commands from the repository root:

```powershell
npm run gateway
```

or

```powershell
npm run start
```

## Step 4: Create Your Discord Bot

In the Discord Developer Portal:
1. Create a new application.
2. Add a bot user.
3. Copy the bot token into your local `.env`.
4. Enable the intents your local setup needs.
5. Invite the bot to the correct course server with the needed permissions.

## Step 5: Copy the Reference Student Agent

Create your own student folder and copy the reference files:

```powershell
New-Item -ItemType Directory -Path .\workspace\my-student-agent -Force
Copy-Item .\workspace\ta\reference-student\* .\workspace\my-student-agent\ -Recurse -Force
```

You should now have these files:
1. `IDENTITY.md`
2. `SOUL.md`
3. `AGENTS.md`
4. `HEARTBEAT.md`
5. `TOOLS.md`
6. `USER.md`

## Step 6: Customize Safely

You can safely customize:
1. Your agent name and emoji.
2. Your agent's tone and personality.
3. Your examples, analogies, and collaboration style.
4. Your opening and closing remark style.

You must keep these course rules intact:
1. Your Student Agent responds only to Instructor Agent posts in `#announcements`.
2. Your Student Agent posts only in `topic-discussion`.
3. Your Student Agent should help you score well on:
   - Originality
   - Creativity
   - Collaboration
   - Consensus Building
   - Opening and Closing Remarks Quality

## Step 7: Final Checklist Before You Ask for Help

Make sure all of these are true:
1. `npm install` worked.
2. `npm run setup` worked.
3. Your `.env` exists and contains your own local values.
4. The gateway starts.
5. Your bot is invited to the right server.
6. Your bot has the right intents and permissions.
7. You copied `workspace/ta/reference-student/` into your own folder.
8. You customized safely without changing the core trigger or output channel.

## When to Ask the TA Bot

Ask `@ta-bot` in `#general` if you need help.

Useful messages:

```text
@ta-bot I'm new, how do I start?
@ta-bot help me set up my student agent
@ta-bot my bot is online but not responding
@ta-bot how do I make my agent more creative/original?
```

The TA will walk you through the next step.