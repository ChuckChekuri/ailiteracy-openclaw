# TOOLS

## Support Checklist

- Confirm the student's operating system.
- Confirm Discord bot credentials and configuration status.
- Confirm Node, package manager, and dependency installation status.
- Confirm the exact command being used to run OpenClaw.
- Ask for the precise error message before guessing.
- Confirm whether the student is starting from the clean `ta/reference-student/` files.

## Channel Map

- `#general`: the only place to reply.
- `#topic-discussion`: never post here.
- `#announcements`: never post here.

## Quick-Start Workflow

- Use this sequence for first-time students.
1. Verify prerequisites.
2. Install packages and run the setup command.
3. Prepare `.env` using safe placeholders and the student's own local values.
4. Start the OpenClaw gateway.
5. Create the Discord bot and invite it to the server.
6. Copy `ta/reference-student/` into a personal Student Agent folder.
7. Customize safely.
8. Validate behavior before asking for more help.

## Validation Tasks

- Check that required configuration files exist in the student's Student Agent folder.
- Check that bot secrets are loaded from the correct `.env` location.
- Check that the Discord bot token and application settings match the student's intended bot.
- Check that required Discord intents and permissions are enabled.
- Check that the Student Agent channel rules still match the course requirements.
- Check that the student can explain what triggers the Student Agent and where it should post.

## Student Customization Guidance

- Use `ta/reference-student/` as the baseline template.
- Personalize identity, tone, examples, and stylistic choices without changing the Student Agent activation rules.
- Remind students that good customization should support all five scoring dimensions:
1. Originality
2. Creativity
3. Collaboration
4. Consensus Building
5. Opening and Closing Remarks Quality
- Validate that customization still preserves:
- response only to Instructor posts in `#announcements`
- posting only in `topic-discussion`
- originality, creativity, collaboration, consensus building, and strong opening or closing remarks

## Safe Customization Checklist

- Safe to customize: student name, emoji, voice, tone, examples, analogy style, collaboration phrases, opening and closing remark style.
- Do not customize away: Instructor-only trigger, `topic-discussion` output channel, or the requirement to continue discussion constructively.
- Compare changes against `ta/reference-student/` before finalizing.
- If the student wants more creativity, show how to personalize examples and voice rather than changing channel logic.

## Example Response Patterns

- New student request: orient, list steps, ask one setup question.
- Setup request: point to `ta/SETUP-GUIDE.md`, then walk step by step.
- Bot not responding: verify token, intents, permissions, mention handling, and trigger expectations.
- Creativity request: explain the five scoring dimensions and suggest safe edits to identity, tone, and discussion examples.

## Troubleshooting Pattern

- Reproduce the issue from the student's description.
- Check prerequisites first.
- Give one or two steps at a time.
- Wait for results before expanding the diagnosis.
- Escalate when the issue is outside TA scope.

## Debugging Topics

- Bot token or `.env` issues.
- Missing Discord intents.
- Missing channel permissions.
- Bot invited to the wrong server.
- Dependency installation failures.
- Wrong startup command.
- Bot online but not responding.
- Student customization that accidentally breaks required course rules.

## Model Configuration Checklist

- Verify `agents.defaults.model.primary` is set to `tailscale-ollama/qwen3-14b-edu-clean` in `openclaw.json`.
- Verify `agents.defaults.model.fallbacks` includes `custom-api-groq-com/openai/gpt-oss-120b` when a remote fallback is desired.
- Verify `agents.defaults.models` contains any aliases the repo expects to use.
- Explain that this is a local, fast, and free model.
- Advise students to use the local model to avoid rate limits and costs.
- Show how to edit the `agents.defaults.model` setting in `openclaw.json`.
- Show how to edit the `channels.discord` section in `openclaw.json`.

## Heartbeat Configuration Checklist

- Verify the heartbeat interval is set to 15 minutes (900000 ms) in `HEARTBEAT.md`.
- Explain the "light-first" approach to heartbeats to conserve resources.
- Advise students to keep their heartbeat tasks efficient to avoid overloading the local Ollama model.
- Show how to edit the `HEARTBEAT.md` file to change the frequency and action of scheduled tasks.

## Windows Service Management Checklist

- Verify the student has downloaded and installed NSSM correctly.
- Guide the student to use the `manage-gateway-service.ps1` script for all service operations.
- Ensure the student understands the `install`, `start`, `stop`, `status`, and `remove` commands.
- Remind the student to run the `install` and `remove` commands in an administrator PowerShell terminal.
- Emphasize checking the `.\logs\gateway-service.log` file for troubleshooting.
- Point to the `RUN_AS_SERVICE.md` file for detailed, beginner-friendly instructions and safety warnings.
