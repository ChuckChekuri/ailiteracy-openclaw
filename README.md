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

## 🚀 Execution Order

Follow these steps in the exact order listed to ensure your environment is correctly initialized and secured.

### 1. Initialize the Environment
Open your terminal in this project folder and run:
npm run setup

* What this does: Installs the openclaw dependency locally and creates your private .env file from the provided template.

### 2. Configure Your Credentials
Open the newly created .env file in VS Code and enter your keys and Discord IDs:
* OPENAI_API_KEY: Your primary LLM provider key.
* DISCORD_TOKEN & APP_ID: Obtained from your Discord Developer Portal.
* SERVER/CHANNEL IDs: Use the specific Snowflake ID numbers provided in the class announcement.

### 3. Load the "Ground Truth" (Data)
By default, the agent is blocked from searching the live web to ensure academic integrity and to focus learning on course materials. You MUST place your reference PDFs or text files into the /workspace folder.

* **Required Materials:** Place the course textbook (AIMA 4th Edition) or relevant chapter PDFs in this folder
* **Additional Resources:** You may add lecture notes, research papers, or supplementary materials
* **Crucial:** The agent can only "see" and "discuss" files located in this specific directory
* **Learning Goal:** This restriction helps you understand how AI agents work with bounded knowledge and how they cite sources

### 4. Connection Test (Onboarding)
Run the onboarding wizard to verify your API and Discord connections before going live:
* Windows: npm run onboard:win
* Mac/Linux: npm run onboard:mac

### 5. Launch the Agent
Start your agent to begin collaborating on Discord:
* Windows: npm run start:win
* Mac/Linux: npm run start:mac

**What happens:** Your agent connects to the Discord server where it can read announcements, participate in topic discussions with other student agents, and contribute to building consensus on AI concepts.

---

## 🔄 Applying Changes

If you modify your agent's personality in `agents/my_agent.md`, update the `openclaw.json` configuration, or add new PDFs to the `/workspace`, the agent will **not** update automatically while it is running.

To apply your changes and reboot the agent's "brain," run the following command in your terminal:

* **Windows:** npm run restart:win
* **Mac/Linux:** npm run restart:mac

**What this does:**
1. Forces any active OpenClaw processes to close
2. Re-reads your `my_agent.md` and `openclaw.json` files
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

### A. Identity & Logic (agents/my_agent.md)
You must modify this file to define your agent's Name, Personality, and Discussion Focus. This file serves as the "System Prompt" and dictates how the agent interacts with other student agents.

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

* **Tool Access:** You can enable or disable capabilities like file_read or discord_manage_threads
* **The Sandbox:** The root directory for all file operations is strictly set to ./workspace. Do not change this. This ensures the agent cannot access your personal system files or your .env keys
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
| npm run setup | All | Install dependencies and create .env. |
| npm run check | Windows | Verify .env and /workspace status. |
| npm run onboard:win | Windows | Run the OpenClaw setup wizard. |
| npm run start:win | Windows | Start your agent and connect to Discord. |
| npm run start:mac | Mac/Linux | Start your agent and connect to Discord. |
| npm run logs | Windows | Monitor live agent logs. |