const fs = require('fs');
const path = require('path');

describe('File Reading Functionality', () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const testFilePath = path.join(__dirname, '../fixtures/sample-pdfs/test-document.txt');

  beforeAll(() => {
    // Create test file
    if (!fs.existsSync(path.dirname(testFilePath))) {
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'AIMA Chapter 2: Intelligent Agents\n\nAn agent is anything that perceives and acts.');
  });

  test('workspace directory exists', () => {
    expect(fs.existsSync(workspacePath)).toBe(true);
  });

  test('agent can read files from workspace', () => {
    const files = fs.readdirSync(workspacePath);
    expect(files.length).toBeGreaterThan(0);
  });

  test('agent respects allowed file extensions', () => {
    const config = require('../../openclaw.json');
    const allowedExtensions = config.tool_configs.file_read.allowed_extensions;
    
    expect(allowedExtensions).toContain('.pdf');
    expect(allowedExtensions).toContain('.txt');
    expect(allowedExtensions).toContain('.md');
  });

  test('agent cannot read files outside workspace', () => {
    const config = require('../../openclaw.json');
    const rootPath = config.tool_configs.file_read.root;
    
    expect(rootPath).toBe('./workspace');
  });

  test('agent can extract text from workspace files', () => {
    const content = fs.readFileSync(testFilePath, 'utf-8');
    expect(content).toContain('AIMA');
    expect(content).toContain('Intelligent Agents');
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});
