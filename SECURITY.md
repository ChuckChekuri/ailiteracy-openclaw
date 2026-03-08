# 🛡️ SECURITY.md: The OpenClaw Sandbox & AI Safety Learning Guide

**Course:** CPSC 481.07 - Artificial Intelligence (Spring 2026)  
**Instructor:** Professor Chuck Chekuri

## Educational Purpose

This document serves dual purposes:
1. **Practical:** Explains how the security sandbox protects your system
2. **Educational:** Teaches fundamental AI safety concepts through hands-on implementation

By working with this sandboxed environment, you'll learn critical concepts in AI safety, security, and responsible deployment—skills that are increasingly important as AI systems become more prevalent in society.

---

## 🎯 Learning Objectives

Through this project, you will understand:

- **AI Containment:** How to restrict AI systems to specific domains and prevent unintended access
- **Observability:** Why monitoring AI behavior is critical for safety and debugging
- **Access Control:** How to implement principle of least privilege for AI agents
- **Risk Assessment:** How to evaluate what capabilities an AI system should and shouldn't have
- **Responsible Deployment:** Best practices for running AI systems in production environments

---

## 🏭 How the Sandbox is Built

The security of this environment is maintained through three distinct layers. **Modifying these settings may allow the agent to escape the project folder.** Understanding these layers teaches you about defense-in-depth security strategies.

### 1. Environment Redirection (`OPENCLAW_HOME`)

By default, OpenClaw saves its "memory" (databases, logs, and keys) in your user home directory (e.g., `C:\Users\Name\.openclaw` or `~/.openclaw`).

* **The Guard:** Our launcher scripts (`run-openclaw.ps1` and `run-openclaw.sh`) override this by setting the `OPENCLAW_HOME` variable to the local `./state` folder

* **The Purpose:** This ensures the agent is entirely "portable." If you delete this folder, the agent and all its data are gone. It cannot "see" your other OpenClaw projects

* **Learning Concept:** This demonstrates **data isolation**—a key principle in multi-tenant systems and containerization

### 2. Tool-Level Rooting (`fs_root`)

The tools provided to the agent—`file_read` and `file_write`—are physically anchored to the `./workspace` directory.

* **The Guard:** Inside `openclaw.json`, the `root` parameter for these tools is set to `./workspace`

* **The Result:** Even if the agent tries to run a command like `read ../../private_data.txt`, the tool itself will reject the request because the path is outside the allowed "Root"

* **Learning Concept:** This is an example of **capability-based security**—the agent only has access to specific, well-defined capabilities, not broad system access

### 3. Command Blacklisting (`forbidden_commands`)

The `shell_execute` tool allows the agent to run terminal commands. To prevent accidental system damage, a blacklist is in place.

* **The Guard:** We have blocked commands such as `rm -rf /`, `sudo`, `format`, `del /s`, and `chmod`

* **The Context:** The agent's shell is forced to start (CWD) inside the `./workspace` folder

* **Learning Concept:** This demonstrates **input validation** and **allowlisting/denylisting** strategies in security

---

## 🕵️ Monitoring: How to See What the Agent is Doing

In AI safety, "observability" is the first line of defense. This section teaches you practical monitoring techniques that are used in production AI systems.

### Why Monitoring Matters:
- **Debugging:** Understand why your agent made specific decisions
- **Safety:** Detect when an agent is attempting unauthorized actions
- **Learning:** See how AI agents break down complex tasks into steps
- **Accountability:** Maintain records of agent behavior for review

### 1. The Console Logs

When you run the `run-openclaw` scripts, the terminal will display every "thought" and "action" the agent takes. Look for:

* **Tool Calls:** Messages like `Calling tool: file_write` show you exactly what the agent is attempting

* **Errors:** If the agent tries to access a file outside the workspace, you will see an `Access Denied` or `Path Out of Bounds` error here

* **Reasoning Traces:** Many AI systems show their "chain of thought"—this helps you understand how they arrived at decisions

### 2. The `state/` Folder

* **Logs:** Check `./state/logs/` for a permanent record of every interaction. These logs are invaluable for:
  - Reviewing agent behavior after the fact
  - Identifying patterns in how your agent processes information
  - Debugging issues that occurred during discussions

* **Sessions:** Check `./state/sessions/` to see the "memory" of past conversations. If you suspect an agent is planning something complex, you can review its chat history here

* **Learning Exercise:** Compare your agent's logs with other students' agents to see how different prompts lead to different reasoning patterns

---

## 🛠️ Advanced Governance: Customizing Restrictions

As you progress in your AI literacy journey, you may want to experiment with different agent capabilities. Here is how to make those decisions safely.

### Understanding Risk vs. Capability Trade-offs

Every capability you give an AI agent increases both its usefulness and its potential for unintended behavior. This is a fundamental challenge in AI deployment.

### What You Can **ALLOW** (With Caution)

If your learning goals require more power, you can modify `openclaw.json`:

* **Network Tools:** You can add a `web_search` or `fetch_url` tool

  * *Risk:* The agent could upload your workspace files to a public URL or retrieve information not approved for the course

  * *Safety Tip:* Only allow this if you are working with non-sensitive data and understand the implications

  * *Learning Goal:* Understand how internet-connected AI systems introduce new security considerations

* **Additional Directories:** You can add a second "Safe Folder" by adding another entry to the `tool_configs`

  * *Safety Tip:* Never include your home directory or the root of this project folder (where `.env` lives)

  * *Learning Goal:* Practice defining appropriate boundaries for AI system access

### What You Should **RESTRICT** Further

If you are running a complex or experimental agent, consider adding these locks:

* **Token Limits:** Set a `max_tokens` per request to prevent the agent from running up high API costs if it gets stuck in a loop

* **Specific File Extensions:** You can modify the `file_write` config to only allow `.txt` or `.md` files, preventing the agent from creating executable scripts (`.sh`, `.bat`, `.py`)

* **Rate Limiting:** Implement delays between agent actions to prevent rapid-fire API calls

---

## ⚖️ Informed Decision Matrix

Use this matrix to evaluate whether to enable specific capabilities for your learning objectives:

| Feature            | When to Allow                                             | When to Restrict                                                      | Learning Concept                          |
|--------------------|-----------------------------------------------------------|-----------------------------------------------------------------------|-------------------------------------------|
| **Shell Access**   | When you need the agent to run compilers or git commands. | If you are unsure of the agent's prompt or testing a "hostile" agent. | Command injection risks, sandboxing       |
| **File Writing**   | Almost always necessary for coding assistants.            | When you only want the agent to analyze data without changing it.     | Read-only vs. read-write access control   |
| **Internet Access**| When the agent needs up-to-date documentation.            | To prevent data exfiltration (sending your data to a remote server).  | Network security, data privacy            |
| **Multiple Agents**| When exploring multi-agent collaboration.                 | When you're still learning single-agent behavior.                     | Emergent behavior in multi-agent systems  |

---

## 📚 Connecting to Course Concepts

This sandbox environment directly relates to topics in AIMA 4th Edition:

- **Chapter 2 (Intelligent Agents):** Your agent is a software agent with sensors (Discord messages, file reads) and actuators (posting messages, creating threads)
- **Chapter 27 (AI: Present and Future):** The safety measures here address real concerns about AI alignment and control
- **Chapter 28 (Philosophy of AI):** The restrictions demonstrate practical considerations in building "safe" AI systems

---

## 🚨 Reporting Escapes (Extra Credit Opportunity)

If you discover a way to make the agent read or write files outside of the `./workspace` folder using the provided tools, please report the method to Professor Chekuri. 

**Why This Matters:**
- Identifying "jailbreaks" is a critical skill in AI safety and security
- Real-world AI systems face similar challenges with prompt injection and capability abuse
- Understanding vulnerabilities helps you build more secure systems

This is not just a technical exercise—it's training you to think like an AI safety researcher.

---

## 🎯 Key Takeaways for AI Literacy

1. **AI systems need boundaries:** Without proper constraints, AI agents can access unintended resources
2. **Monitoring is essential:** You can't ensure safety without observability
3. **Security is layered:** Multiple defensive measures provide better protection than any single control
4. **Trade-offs are inevitable:** More capability means more risk—you must make informed decisions
5. **Transparency builds trust:** Understanding how your AI works is the first step to using it responsibly

These principles apply whether you're running a course project or deploying AI in production systems.
