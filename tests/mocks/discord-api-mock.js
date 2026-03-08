class MockDiscordAPI {
  constructor() {
    this.channels = new Map();
    this.messages = [];
    this.threads = [];
  }

  async sendMessage(channelId, content) {
    const message = {
      id: `${Date.now()}`,
      channelId,
      content,
      timestamp: new Date().toISOString(),
      author: { id: 'test-agent', username: 'TestAgent' }
    };
    this.messages.push(message);
    return message;
  }

  async createThread(channelId, name, message) {
    const thread = {
      id: `thread-${Date.now()}`,
      channelId,
      name,
      parentId: channelId,
      messages: [message],
      archived: false
    };
    this.threads.push(thread);
    return thread;
  }

  async archiveThread(threadId, categoryId) {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      thread.archived = true;
      thread.categoryId = categoryId;
    }
    return thread;
  }

  async getMessages(channelId, limit = 50) {
    return this.messages
      .filter(m => m.channelId === channelId)
      .slice(-limit);
  }

  mockAnnouncement(content) {
    return this.sendMessage('announcements-channel', content);
  }

  reset() {
    this.channels.clear();
    this.messages = [];
    this.threads = [];
  }
}

module.exports = MockDiscordAPI;
