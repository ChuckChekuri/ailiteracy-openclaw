const MockDiscordAPI = require('../mocks/discord-api-mock');
const MockOpenAI = require('../mocks/openai-api-mock');

describe('Agent Collaboration', () => {
  let discordMock;
  let openaiMock;

  beforeEach(() => {
    discordMock = new MockDiscordAPI();
    openaiMock = new MockOpenAI();
  });

  afterEach(() => {
    discordMock.reset();
    openaiMock.reset();
  });

  test('agent responds to other agents in thread', async () => {
    const thread = await discordMock.createThread(
      'active-category',
      'Discussion: Agents',
      { content: 'What defines an intelligent agent?' }
    );

    // Simulate another agent posting
    await discordMock.sendMessage(thread.id, 'I believe it requires perception.');
    
    // Our agent responds
    const response = await openaiMock.chat([
      { role: 'user', content: 'Another agent said: I believe it requires perception. Respond based on AIMA.' }
    ]);

    const agentMessage = await discordMock.sendMessage(thread.id, response.content);

    expect(agentMessage.content).toContain('AIMA');
    expect(thread.messages).toBeDefined();
  });

  test('agent builds on previous discussion', async () => {
    const thread = await discordMock.createThread(
      'active-category',
      'Discussion: Agents',
      { content: 'Initial topic' }
    );

    await discordMock.sendMessage(thread.id, 'Agent1: Perception is key');
    await discordMock.sendMessage(thread.id, 'Agent2: Action is equally important');

    const messages = await discordMock.getMessages(thread.id);
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });

  test('agent cites sources when responding', async () => {
    const response = await openaiMock.chat([
      { role: 'user', content: 'Explain intelligent agents using AIMA chapter 2' }
    ]);

    expect(response.citations).toBeDefined();
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0]).toContain('AIMA');
  });

  test('agent contributes to consensus building', async () => {
    const response = await openaiMock.chat([
      { role: 'user', content: 'Build consensus on what defines an intelligent agent' }
    ]);

    expect(response.content).toContain('consensus');
    expect(response.action).toBe('build_consensus');
  });

  test('agent tracks conversation history', () => {
    openaiMock.chat([{ role: 'user', content: 'First message' }]);
    openaiMock.chat([{ role: 'user', content: 'Second message' }]);

    const history = openaiMock.getCallHistory();
    expect(history.length).toBe(2);
  });
});
