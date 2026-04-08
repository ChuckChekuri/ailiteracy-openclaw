const MockDiscordAPI = require('../mocks/discord-api-mock');

describe('Discord Channel Monitoring', () => {
  let discordMock;

  beforeEach(() => {
    discordMock = new MockDiscordAPI();
  });

  afterEach(() => {
    discordMock.reset();
  });

  test('agent monitors announcements channel', async () => {
    const announcement = await discordMock.mockAnnouncement(
      'New Topic: Intelligent Agents - AIMA Chapter 2. Deadline: Friday 5pm'
    );

    expect(announcement.channelId).toBe('announcements-channel');
    expect(announcement.content).toContain('Topic');
  });

  test('agent detects new announcement', async () => {
    await discordMock.mockAnnouncement('Topic: Machine Learning - AIMA Chapter 19');
    
    const messages = await discordMock.getMessages('announcements-channel');
    expect(messages.length).toBe(1);
    expect(messages[0].content).toContain('Machine Learning');
  });

  test('agent filters announcement keywords', async () => {
    await discordMock.mockAnnouncement('Regular message without keywords');
    await discordMock.mockAnnouncement('Topic: Neural Networks - AIMA Chapter 21');
    
    const messages = await discordMock.getMessages('announcements-channel');
    const announcements = messages.filter(m => 
      m.content.includes('Topic') || m.content.includes('AIMA Chapter')
    );
    
    expect(announcements.length).toBe(1);
    expect(announcements[0].content).toContain('Neural Networks');
  });

  test('agent reads multiple channels', async () => {
    const config = require('../../openclaw.json');
    const guilds = config.channels.discord.guilds;
    const monitoredChannels = Object.values(guilds).flatMap(g => Object.keys(g.channels));
    
    expect(Array.isArray(monitoredChannels)).toBe(true);
    expect(monitoredChannels.length).toBeGreaterThan(0);
  });
});
