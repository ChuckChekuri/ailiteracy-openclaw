const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 }
    };
  }

  async runUnitTests() {
    console.log('\n🧪 Running Unit Tests...\n');
    return this.runJest('unit');
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...\n');
    return this.runJest('integration');
  }

  async runE2ETests() {
    console.log('\n🎬 Running E2E Tests (with video recording)...\n');
    return this.runPlaywright();
  }

  runJest(suite) {
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', `--testPathPattern=tests/${suite}`, '--verbose'], {
        cwd: path.join(__dirname, '..'),
        shell: true
      });

      jest.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      jest.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      jest.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${suite} tests passed`);
          resolve(true);
        } else {
          console.log(`❌ ${suite} tests failed`);
          resolve(false);
        }
      });
    });
  }

  runPlaywright() {
    return new Promise((resolve, reject) => {
      const playwright = spawn('npx', ['playwright', 'test', '--config=tests/playwright.config.js'], {
        cwd: path.join(__dirname, '..'),
        shell: true
      });

      playwright.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      playwright.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      playwright.on('close', (code) => {
        if (code === 0) {
          console.log('✅ E2E tests passed');
          console.log('📹 Videos saved to tests/videos/');
          resolve(true);
        } else {
          console.log('❌ E2E tests failed');
          resolve(false);
        }
      });
    });
  }

  async runAll() {
    console.log('🚀 Starting OpenClaw Functionality Tests\n');
    console.log('=' .repeat(50));

    const unitPassed = await this.runUnitTests();
    const integrationPassed = await this.runIntegrationTests();
    const e2ePassed = await this.runE2ETests();

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary:');
    console.log(`   Unit Tests: ${unitPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Integration Tests: ${integrationPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   E2E Tests: ${e2ePassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('\n' + '='.repeat(50));

    const allPassed = unitPassed && integrationPassed && e2ePassed;
    process.exit(allPassed ? 0 : 1);
  }

  async runScenario(scenarioName) {
    console.log(`\n🎯 Running Scenario: ${scenarioName}\n`);
    return this.runPlaywright();
  }
}

// CLI handling
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.includes('--all')) {
  runner.runAll();
} else if (args.includes('--suite=setup')) {
  runner.runUnitTests();
} else if (args.includes('--suite=integration')) {
  runner.runIntegrationTests();
} else if (args.includes('--suite=e2e')) {
  runner.runE2ETests();
} else if (args.includes('--scenario=')) {
  const scenario = args.find(arg => arg.startsWith('--scenario=')).split('=')[1];
  runner.runScenario(scenario);
} else {
  console.log('Usage:');
  console.log('  node test-runner.js --all');
  console.log('  node test-runner.js --suite=unit');
  console.log('  node test-runner.js --suite=integration');
  console.log('  node test-runner.js --suite=e2e');
  console.log('  node test-runner.js --scenario=announcement');
}

module.exports = TestRunner;
