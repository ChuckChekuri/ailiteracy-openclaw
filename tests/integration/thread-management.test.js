const MockDiscordAPI = require('../mocks/discord-api-mock');

describe('Thread Management', () => {
  let discordMock;

  beforeEach(() => {
    discordMock = new MockDiscordAPI();
  });

  afterEach(() => {
    discordMock.reset();
  });

  test('agent creates thread in active category', async () => {
    require('dotenv').config();
    const activeCategoryId = process.env.ACTIVE_TOPICS_CATEGORY_ID;
    
    const thread = await discordMock.createThread(
      activeCategoryId,
      'Discussion: Intelligent Agents',
      { content: 'Let\'s discuss AIMA Chapter 2' }
    );

    expect(thread.name).toContain('Intelligent Agents');
    expect(thread.archived).toBe(false);
  });

  test('agent formats thread title correctly', async () => {
    const topicName = 'Search Algorithms';
    const threadTitle = `Discussion: ${topicName}`;
    
    const thread = await discordMock.createThread(
      'active-category',
      threadTitle,
      { content: 'Initial post' }
    );

    expect(thread.name).toMatch(/Discussion:/);
    expect(thread.name).toContain(topicName);
  });

  test('agent posts initial message in thread', async () => {
    const initialMessage = {
      content: 'Based on AIMA Chapter 2, let\'s explore intelligent agents.'
    };

    const thread = await discordMock.createThread(
      'active-category',
      'Discussion: Agents',
      initialMessage
    );

    expect(thread.messages.length).toBe(1);
    expect(thread.messages[0].content).toContain('AIMA Chapter 2');
  });

  test('agent archives thread to correct category', async () => {
    require('dotenv').config();
    const archiveCategoryId = process.env.ARCHIVED_CATEGORY_ID;
    
    const thread = await discordMock.createThread(
      'active-category',
      'Discussion: Test',
      { content: 'Test' }
    );

    const archived = await discordMock.archiveThread(thread.id, archiveCategoryId);

    expect(archived.archived).toBe(true);
    expect(archived.categoryId).toBe(archiveCategoryId);
  });

  test('agent includes summary when archiving', async () => {
    const summaryMessage = await discordMock.sendMessage(
      'thread-123',
      'Summary: We reached consensus that intelligent agents require perception and action.'
    );

    expect(summaryMessage.content).toContain('Summary:');
    expect(summaryMessage.content).toContain('consensus');
  });
});
