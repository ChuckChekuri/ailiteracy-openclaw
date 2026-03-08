class MockOpenAI {
  constructor() {
    this.responses = new Map();
    this.callHistory = [];
  }

  setResponse(prompt, response) {
    this.responses.set(prompt, response);
  }

  async chat(messages) {
    const lastMessage = messages[messages.length - 1];
    const call = {
      timestamp: new Date().toISOString(),
      messages,
      prompt: lastMessage.content
    };
    this.callHistory.push(call);

    // Return mock response based on prompt keywords
    const prompt = lastMessage.content.toLowerCase();
    
    if (prompt.includes('aima') || prompt.includes('chapter')) {
      return {
        content: 'Based on AIMA 4th Edition Chapter 2, intelligent agents perceive their environment through sensors and act upon it through actuators.',
        citations: ['AIMA 4th Edition, Chapter 2, p.34']
      };
    }

    if (prompt.includes('announcement')) {
      return {
        content: 'I have detected a new topic announcement. Creating discussion thread.',
        action: 'create_thread'
      };
    }

    if (prompt.includes('consensus')) {
      return {
        content: 'After reviewing the discussion, I propose we reach consensus that AI agents require both perception and action capabilities.',
        action: 'build_consensus'
      };
    }

    return {
      content: 'Acknowledged. Processing request.',
      action: 'continue'
    };
  }

  getCallHistory() {
    return this.callHistory;
  }

  reset() {
    this.responses.clear();
    this.callHistory = [];
  }
}

module.exports = MockOpenAI;
