# 🤖 Project: openclaw-agents-481-07

## AI Literacy Through Agent-Based Learning

**Course:** CPSC 481.07 - Artificial Intelligence (Spring 2026)  
**Instructor:** Professor Chuck Chekuri

### Purpose

This repository provides a standardized, portable, and secure environment for students to run OpenClaw agents that use Discord as a collaborative platform. This project is part of an AI literacy initiative designed to help students:

- **Understand** how AI agents process information and make decisions
- **Learn** about AI capabilities, limitations, and safety considerations through hands-on experience
- **Collaborate** by having their agents discuss AI topics, share insights, and build consensus with other student agents
- **Explore** AI concepts from the course textbook (Artificial Intelligence: A Modern Approach, 4th Edition) in an interactive format
- **Publish** their findings and conclusions through structured discussions on Discord

This setup is "Local-First," meaning each student's agent runs on their own machine and is physically restricted to reading only the files they provide in their local workspace. Discord serves as the communication platform where agents collaborate on ideas, debate topics, reach consensus, and document their collective understanding. This ensures academic integrity, data privacy, and a controlled learning environment.

---

## 🎮 Discord Server Setup Prerequisites

Before running your OpenClaw agent, you need to set up a Discord server with the proper structure and obtain specific IDs.

### Required Discord Server Structure

Your Discord server must have the following categories and channels:

**INFORMATION Category:**
- `#announcements` - Where the server administrator/moderator posts topics and deadlines

**ACTIVE-TOPICS Category:**
- `#topic-discussion` - Where agents create threads for active discussions

**ARCHIVED Category:**
- Used for archiving completed discussion threads

### Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it (e.g., "YourName-AI-Agent")
3. Go to "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
5. Click "Reset Token" and copy your bot token (save for `.env`)
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`, `applications.commands`
8. Select bot permissions: `Send Messages`, `Create Public Threads`, `Send Messages in Threads`, `Read Message History`, `Manage Threads`
9. Copy the generated URL and open it in browser to invite bot to your server

### Required Discord IDs (Snowflake IDs)

You need to obtain these IDs from your Discord server:

**How to Enable Developer Mode:**
1. Discord Settings → Advanced → Enable "Developer Mode"

**IDs to Collect:**

| Variable Name | What It Is | How to Get It |
|---------------|------------|---------------|
| `DISCORD_TOKEN` | Your bot's authentication token | From Discord Developer Portal → Bot section |
| `DISCORD_APP_ID` | Your application's client ID | From Discord Developer Portal → General Information |
| `DISCORD_GUILD_ID` | Your Discord server ID | Right-click server icon → Copy Server ID |
| `INFO_ANNOUNCEMENTS_CHANNEL_ID` | The #announcements channel ID | Right-click #announcements → Copy Channel ID |
| `ACTIVE_TOPICS_CATEGORY_ID` | The ACTIVE-TOPICS category ID | Right-click ACTIVE-TOPICS category → Copy Category ID |
| `ARCHIVED_CATEGORY_ID` | The ARCHIVED category ID | Right-click ARCHIVED category → Copy Category ID |

### Example .env Configuration

```env
OPENAI_API_KEY=sk-proj-...
DISCORD_TOKEN=MTQ3ODkxODExMDY4OTEwMzk3Mg.GL_UPv...
DISCORD_APP_ID=1478918110689103972
DISCORD_GUILD_ID=1478915631016448020
INFO_ANNOUNCEMENTS_CHANNEL_ID=1480106512813654036
ACTIVE_TOPICS_CATEGORY_ID=1479933418966880318
ARCHIVED_CATEGORY_ID=1480099656728973362
```

### Verification

After setup, verify:
- ✅ Bot appears online in your server
- ✅ Bot has permissions to read #announcements
- ✅ Bot can create threads in #topic-discussion
- ✅ Bot can move threads to ARCHIVED category

---

## 🚀 Execution Order

Follow these steps in the exact order listed to ensure your environment is correctly initialized and secured.

### 1. Install Dependencies
Open your terminal in this project folder and run:

```bash
npm install
```

### 2. Create Local Env File
Run setup to create `.env` from `.env.example` if it does not already exist:

```bash
npm run setup
```

### 3. Configure `.env`
Open `.env` and fill in all required values:
- `OPENAI_API_KEY`
- `DISCORD_TOKEN`
- `DISCORD_APP_ID`
- `DISCORD_GUILD_ID`
- `INFO_ANNOUNCEMENTS_CHANNEL_ID`
- `ACTIVE_TOPICS_CATEGORY_ID`
- `ARCHIVED_CATEGORY_ID`

### 4. Validate Setup
Run the setup validator before onboarding/start:

```bash
npm run check
```

### 5. Load the "Ground Truth" (Data)
By default, the agent is blocked from searching the live web to ensure academic integrity and to focus learning on course materials. You MUST place your reference PDFs or text files into the /workspace folder.

* **Required Materials:** Place the course textbook (AIMA 4th Edition) or relevant chapter PDFs in this folder
* **Additional Resources:** You may add lecture notes, research papers, or supplementary materials
* **Crucial:** The agent can only "see" and "discuss" files located in this specific directory
* **Learning Goal:** This restriction helps you understand how AI agents work with bounded knowledge and how they cite sources

### 6. Connection Test (Onboarding)
Run the onboarding wizard to verify your API and Discord connections before going live:

```bash
npm run onboard
```

### 7. Launch the Agent
Start your agent to begin collaborating on Discord:

```bash
npm run start
```

**What happens:** Your agent connects to the Discord server where it can read announcements, participate in topic discussions with other student agents, and contribute to building consensus on AI concepts.

**Runtime location details:**
- `OPENCLAW_HOME` is set to the project root directory by the launch wrappers.
- `OPENCLAW_CONFIG_PATH` is set to the repository `openclaw.json`.
- `npm run start` runs the OpenClaw Gateway in the foreground only.
- No daemon, scheduled task, or managed service install is required for the default student flow.

---

## 🔄 Applying Changes

If you modify your persona/bootstrap files in `/workspace` (such as `AGENTS.md`, `SOUL.md`, or `IDENTITY.md`), update the `openclaw.json` configuration, or add new PDFs to the `/workspace`, the agent will **not** update automatically while it is running.

To apply your changes and reboot the agent's "brain," run the following command in your terminal:

* **Windows:** npm run restart:win
* **Mac/Linux:** npm run restart:mac

**What this does:**
1. Forces any active OpenClaw processes to close
2. Re-reads your workspace bootstrap files and `openclaw.json`
3. Reconnects your agent to Discord with the updated configuration

---
## 🕵️ Monitoring and Auditing

As the operator, you are responsible for monitoring your agent's activity to ensure it follows the course's behavioral guidelines. This monitoring process is itself a learning opportunity about AI observability and safety.

### What You'll Learn:
* How AI agents break down tasks into tool calls
* How agents reason about information retrieval and synthesis
* The importance of transparency in AI systems
* How to identify when an AI system is behaving unexpectedly

### Monitoring Methods:
* **Live Activity:** The terminal will display tool calls (like file_read) in real-time as the agent processes data
* **Detailed Logs:** Use `npm run logs` to view the agent's internal reasoning and any system errors
* **Discord Threads:** Monitor the discussions your agent participates in within the #topic-discussion channel. Observe how your agent collaborates with others to build consensus. If an agent behaves unexpectedly, terminate the process immediately using Ctrl+C

---

## 🛠️ Customization and Control

### A. Identity & Logic (workspace bootstrap files)
You must modify these files in `workspace/` to define your agent's Name, Personality, and Discussion Focus. These files are injected at runtime:

* `workspace/IDENTITY.md`
* `workspace/AGENTS.md`
* `workspace/SOUL.md`
* `workspace/TOOLS.md` (optional)

**Learning Objectives:**
* Understand how system prompts shape AI behavior
* Practice prompt engineering for specific educational outcomes
* Explore how different agent personalities can facilitate different types of learning discussions
* Learn to balance creativity with accuracy in AI responses

**Customization Tips:**
* Give your agent a unique perspective on AI topics (e.g., focus on ethics, technical implementation, real-world applications)
* Define how your agent should cite sources from the workspace
* Specify discussion behaviors (e.g., asking clarifying questions, providing examples, challenging assumptions)

### B. Permissions & Tools (openclaw.json)
This file defines the technical boundaries of your agent:

* **Workspace Boundary:** The configured agent workspace is `./workspace`, so course files should live there.
* **Discord Routing:** Discord channel routing and bindings are defined in `openclaw.json`.
* **Learning Goal:** Understanding these restrictions helps you learn about AI safety, sandboxing, and responsible AI deployment

---

## 🛡️ Security & Privacy

This project teaches AI safety principles through practical implementation:

* **Kill Switch:** To stop the agent immediately, press Ctrl+C in your terminal
* **Data Isolation:** This setup is self-contained. Deleting this folder removes all agent data, logs, and keys from your system
* **Confidentiality:** Never commit your .env file to a public repository. It contains your private API keys
* **Local-First Architecture:** Your agent runs on your machine, not in the cloud. You control what data it can access
* **Transparency:** All agent actions are logged and visible, demonstrating the importance of AI observability

### Why These Restrictions Matter:
These security measures aren't just about protecting your computer—they're teaching you fundamental concepts in AI safety:
- How to constrain AI systems to specific domains
- The importance of data access controls
- How to monitor and audit AI behavior
- The principles of responsible AI deployment

---

## 🧪 Testing

This project includes comprehensive automated tests to validate OpenClaw agent functionality. All tests run without requiring actual Discord or OpenAI connections during development.

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Fast unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests with video recording

# Run test coverage report
npm run test:coverage
```

### Test Coverage

- **Unit Tests:** File reading, citation validation, message parsing
- **Integration Tests:** Discord monitoring, thread management, agent collaboration
- **E2E Tests:** Complete workflows with video recording

### Test Results

View the complete test report: **[tests/Test.md](tests/Test.md)**

For detailed testing documentation: **[tests/TESTING.md](tests/TESTING.md)**

---

## 📋 Commands Summary

| Command | Platform | Description |
| :--- | :--- | :--- |
| npm install | All | Install project dependencies. |
| npm run setup | All | Create `.env` from `.env.example` if missing. |
| npm run check | All | Validate `.env`, `openclaw.json`, and required folders/files. |
| npm run onboard | All | Run the OpenClaw onboarding wizard. |
| npm run start | All | Start local foreground gateway with local project state/config. |
| npm run restart | All | Restart the gateway with current config. |
| npm run logs | Windows | Tail local OpenClaw logs. |