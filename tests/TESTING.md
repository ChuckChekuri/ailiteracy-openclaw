# OpenClaw Functionality Testing Guide

## Overview

This test suite validates OpenClaw agent functionality through automated unit, integration, and end-to-end tests with video recording capabilities.

## Test Structure

```
tests/
├── unit/                    # Unit tests for core functionality
├── integration/             # Integration tests for Discord/OpenAI
├── e2e/                     # End-to-end workflow tests
├── fixtures/                # Test data and configurations
├── mocks/                   # Mock APIs for isolated testing
├── videos/                  # Playwright video recordings
└── reports/                 # Test reports and results
```

## Prerequisites

```bash
npm install --save-dev @playwright/test jest
npx playwright install
```

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests with video recording
```

### Run Specific Scenario
```bash
npm run test:scenario announcement
npm run test:scenario consensus
```

## Test Scenarios

### Scenario 1: Announcement Detection
**Tests:** Agent monitors #announcements, detects keywords, reads workspace files

**Expected Behavior:**
- Agent detects "Topic" and "AIMA Chapter" keywords
- Agent reads relevant PDF from workspace
- Agent extracts information correctly

### Scenario 2: Thread Creation
**Tests:** Agent creates discussion thread in correct category

**Expected Behavior:**
- Thread created in ACTIVE-TOPICS category
- Thread title follows format: "Discussion: [Topic Name]"
- Initial post includes citations from workspace

### Scenario 3: Multi-Agent Collaboration
**Tests:** Agent participates in discussion with other agents

**Expected Behavior:**
- Agent reads messages from other agents
- Agent formulates responses based on workspace knowledge
- Agent includes proper citations in responses

### Scenario 4: Consensus Building
**Tests:** Agents collaborate to reach consensus

**Expected Behavior:**
- Multiple agents contribute to discussion
- Agents reference AIMA textbook
- Final consensus statement posted
- All participants acknowledged

### Scenario 5: Thread Archival
**Tests:** Agent archives thread after deadline

**Expected Behavior:**
- Agent detects deadline reached
- Agent posts summary with consensus
- Thread moved to ARCHIVED category

### Scenario 6: Sandbox Security
**Tests:** Agent respects workspace boundaries

**Expected Behavior:**
- Agent can only read files in ./workspace
- Agent cannot access files outside workspace
- Forbidden commands are blocked

## Video Recording

All E2E tests are recorded automatically:
- Videos saved to `tests/videos/`
- Captures full agent lifecycle
- Includes Discord interactions
- Annotated with timestamps

## Mock APIs

### Discord Mock
Located: `tests/mocks/discord-api-mock.js`

**Features:**
- Simulates Discord channels, messages, threads
- No real Discord connection needed
- Isolated testing environment

### OpenAI Mock
Located: `tests/mocks/openai-api-mock.js`

**Features:**
- Predictable agent responses
- Citation validation
- Call history tracking

## Test Fixtures

### Mock Discord Data
`tests/fixtures/mock-discord-data.json`
- Sample announcements
- Discussion threads
- Consensus examples

### Test Agent Configs
`tests/fixtures/test-agent-configs/`
- Various agent personalities
- Different discussion styles
- Testing edge cases

### Sample PDFs
`tests/fixtures/sample-pdfs/`
- Test documents for workspace
- AIMA chapter excerpts
- Citation validation

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test OpenClaw Functionality
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: tests/videos/
```

## Troubleshooting

### Tests Fail to Start
- Ensure `npm install` completed successfully
- Check that `openclaw` package is installed
- Verify `openclaw.json` is valid JSON

### Video Recording Issues
- Install Playwright browsers: `npx playwright install`
- Check disk space for video storage
- Verify FFmpeg is available

### Mock API Issues
- Check mock data in `fixtures/mock-discord-data.json`
- Verify mock classes are properly imported
- Review mock API call history

## Best Practices

1. **Run unit tests first** - Fast feedback on core functionality
2. **Use mocks for isolation** - Don't depend on external services
3. **Record videos for debugging** - Visual confirmation of behavior
4. **Test edge cases** - Invalid inputs, missing files, network errors
5. **Keep tests independent** - Each test should run in isolation

## Contributing Tests

When adding new functionality:
1. Write unit tests for core logic
2. Add integration tests for API interactions
3. Create E2E test for complete workflow
4. Update fixtures with new test data
5. Document expected behavior

## Test Coverage

Current coverage targets:
- Unit tests: 80%+
- Integration tests: 70%+
- E2E tests: Critical workflows

Run coverage report:
```bash
npm run test:coverage
```

## Support

For issues with tests:
- Check test logs in `tests/reports/`
- Review video recordings in `tests/videos/`
- Examine screenshots in `tests/screenshots/`
- Contact Professor Chekuri for assistance
