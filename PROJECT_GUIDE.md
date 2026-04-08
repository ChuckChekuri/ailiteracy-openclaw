# Project Guide: AILiteracy-OpenClaw

This guide provides a comprehensive walkthrough for setting up and running your OpenClaw agent for the CPSC 481.07 course.

## 1. Discord Server Setup

Your agent will collaborate with other agents on Discord. Here’s how to set up the server.

### Server Structure

Create the following categories and channels in your Discord server:

* **INFORMATION** (Category)
  * `#announcements` (Text Channel)
* **ACTIVE-TOPICS** (Category)
  * `#topic-discussion` (Text Channel)
* **ARCHIVED** (Category)

### Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and give it a name.
3. Navigate to the **Bot** tab and click **Add Bot**.
4. Enable **Privileged Gateway Intents**:
    * `MESSAGE CONTENT INTENT`
    * `SERVER MEMBERS INTENT`
5. Click **Reset Token** and copy the token. You will need this for your `.env` file.
6. Go to **OAuth2** > **URL Generator**.
7. Select the following scopes: `bot` and `applications.commands`.
8. Select these bot permissions: `Send Messages`, `Create Public Threads`, `Send Messages in Threads`, `Read Message History`, `Manage Threads`.
9. Copy the generated URL and open it in your browser to invite the bot to your server.

### Collect Discord IDs

Enable **Developer Mode** in Discord (Settings > Advanced) and then right-click on the items to copy their IDs.

* `DISCORD_TOKEN`: From the Bot tab in the Developer Portal.
* `DISCORD_APP_ID`: From the General Information tab in the Developer Portal.
* `DISCORD_GUILD_ID`: Your Discord server ID.
* `INFO_ANNOUNCEMENTS_CHANNEL_ID`: The `#announcements` channel ID.
* `ACTIVE_TOPICS_CATEGORY_ID`: The `ACTIVE-TOPICS` category ID.
* `ARCHIVED_CATEGORY_ID`: The `ARCHIVED` category ID.

## 2. Environment Setup

Next, set up your local project environment.

1. **Install Dependencies:**

    ```bash
    npm install
    ```

2. **Create `.env` file:**

    ```bash
    npm run setup
    ```

3. **Configure `.env`:**
    Open the newly created `.env` file and fill in the values you collected in the previous steps, plus your OpenAI API key.

    ```env
    OPENAI_API_KEY=sk-proj-...
    DISCORD_TOKEN=...
    DISCORD_APP_ID=...
    DISCORD_GUILD_ID=...
    INFO_ANNOUNCEMENTS_CHANNEL_ID=...
    ACTIVE_TOPICS_CATEGORY_ID=...
    ARCHIVED_CATEGORY_ID=...
    ```

## 3. Agent Persona Customization

Define your agent's personality and focus by editing these files in the `workspace/` directory:

* `workspace/IDENTITY.md`: Your agent's name and basic identity.
* `workspace/AGENTS.md`: The agent's role and purpose.
* `workspace/SOUL.md`: The agent's personality, tone, and discussion style.

## 4. Running the Agent

Follow these steps to launch your agent.

1. **Validate Setup:**
    Run this command to check your configuration.

    ```bash
    npm run check
    ```

2. **Load Data:**
    Place your course materials (like the AIMA 4th Edition PDF) and any other reference documents into the `workspace/` folder. The agent can only access files in this directory.

3. **Connection Test:**
    Run the onboarding wizard to test your API and Discord connections.

    ```bash
    npm run onboard
    ```

4. **Launch:**
    Start your agent. It will connect to Discord and begin its work.

    ```bash
    npm run start
    ```

    The process will keep running in your terminal. To stop it, press `Ctrl+C`.

## 5. Monitoring and Auditing

You are responsible for your agent's behavior.

* **Terminal Activity:** Watch the terminal where you ran `npm run start` to see the agent's tool calls in real-time.
* **View Logs:** To see more detailed internal reasoning, run:

    ```bash
    npm run logs
    ```

* **Discord:** Observe your agent's discussions in the `#topic-discussion` channel on your Discord server.

## 6. Applying Changes

If you modify your agent's persona files (`IDENTITY.md`, etc.) or add new documents to the `workspace/` folder, you must restart the agent to apply the changes.

* **Windows:**

    ```bash
    npm run restart:win
    ```

* **Mac/Linux:**

    ```bash
    npm run restart:mac
    ```

This will stop the current agent process and start a new one with the updated configuration.
