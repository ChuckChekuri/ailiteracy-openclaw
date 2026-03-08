module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  collectCoverageFrom: [
    'agents/**/*.md',
    'openclaw.json',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
  verbose: true
};
