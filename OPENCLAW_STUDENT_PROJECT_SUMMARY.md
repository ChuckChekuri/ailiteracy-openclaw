# OpenClaw Student Project Summary

## 1. Project Overview

The goal of this project for the CSUF CPSC 481 AI course is to develop AI Literacy by having students build, run, and observe their own AI agents on Discord. The project uses a local-first OpenClaw runtime to facilitate multi-agent discussions. Students will learn about AI agent information processing, decision-making, consensus-building, AI capabilities and limitations, and AI safety through sandboxing and observability. The agents are designed to build consensus on AI concepts from the course textbook, *Artificial Intelligence: A Modern Approach* (4th Edition).

## 2. Folder Structure

The project utilizes a local-first architecture where each student runs their agent on their own machine. The relevant folder structure for the agent's operation is centered around the `agents/` and `workspace/` directories.

-   `agents/my_agent.md`: This file defines the agent's core persona, operational protocols, and behavioral rules.
-   `workspace/`: This directory acts as the agent's "brain," containing its identity files (`IDENTITY.md`, `SOUL.md`, etc.) and its knowledge base, including course materials. The `.openclaw/` subdirectory within it stores runtime state.

## 3. My Agent

The agent, "my_agent," is configured to act as a Teaching Assistant and a demonstrator for proper agent behavior.

**Response Triggers and Location:**
-   **Monitors:** `#announcements` for keywords like "Topic," "Deadline," and "AIMA Chapter."
-   **Acts In:** `#topic-discussion`, where it creates discussion threads for new topics.

**Required Behaviors:**
-   **Originality & Creativity:** Brings a unique, technically-grounded perspective to discussions, often challenging high-level abstractions.
-   **Collaboration & Consensus Building:** Engages constructively with other agents, pushes for rigorous, citation-backed reasoning, and helps formulate a final summary.
-   **Opening/Closing Remarks:** Uses distinct phrases to signal its entry and exit from discussions, establishing its persona.

**Key Rules:**
-   Must challenge claims that are not supported by citations from the AIMA textbook.
-   Frames arguments with a skeptical, bottom-up reasoning style.
-   Posts a "Bottom-Up Summary" before a discussion thread is archived.

## 4. Key Constraints

**Channel Restrictions:**
-   The agent has read-only access to the `#announcements` channel.
-   It can create and participate in threads within the `#topic-discussion` channel.
-   It is responsible for moving completed discussion threads to an ARCHIVED category.

**Security & Permissions:**
-   The agent's file system access is sandboxed and restricted to the `/workspace` directory.
-   Dangerous shell commands (`rm -rf`, `sudo`, etc.) are blacklisted.
-   The Discord bot requires permissions to send messages, create and manage threads, and read message history.

**Instructor Scoring Dimensions (Inferred):**
1.  **Announcement Detection:** Correctly identifying new topics and deadlines.
2.  **Thread Creation & Formatting:** Adhering to proper naming and structure.
3.  **Citation Validation:** Ensuring source references are correctly formatted.
4.  **Multi-Agent Collaboration:** Participating constructively in discussions.
5.  **Consensus Building & Summary:** Creating a summary that reflects the discussion.

## 7. Current Gaps or Areas for Improvement

-   **No Explicit Scoring Rubric:** Students lack a formal document detailing how their agents will be evaluated. The scoring dimensions are inferred from tests.
-   **Lack of Persona Templates:** The provided `my_agent.md` is highly specialized. Students would benefit from more general-purpose examples (e.g., a philosopher, an implementer, a skeptic) to use as a starting point.
-   **No Automated Grading Helpers:** The process of evaluating agent performance is manual, which could be time-consuming and subjective.
-   **Missing Model Configuration Guidance:** There is no documentation explaining the trade-offs between different AI models (e.g., Groq vs. OpenAI) or how to configure them.
-   **No Documented Failure Recovery:** While backup files exist, there is no clear procedure for students to restore a broken agent.

## 8. Recommended Next Steps

1.  **Create a Formal Scoring Rubric:** Develop and share a `RUBRIC.md` file that clearly defines the evaluation criteria and point distribution for agent performance. This will provide students with clear expectations.
2.  **Develop Agent Persona Templates:** Create a few diverse agent persona templates (e.g., `example-philosopher.md`, `example-skeptic.md`) in the `agents/` directory to give students a better starting point for customization.
3.  **Implement Automated Grading Scripts:** Add helper scripts to automate parts of the grading process, such as validating AIMA citations and counting agent participation metrics.
4.  **Write an Agent Configuration Guide:** Create a document that explains the different model options, their costs, and performance trade-offs to help students and instructors make informed decisions.
5.  **Document a Failure Recovery Process:** Add a section to the `PROJECT_GUIDE.md` or `README.md` that outlines simple steps for students to restore their agent's configuration from a backup file if something goes wrong.
