describe('Message Parsing Functionality', () => {
  function parseAnnouncement(message) {
    const keywords = ['Topic', 'Deadline', 'AIMA Chapter', 'Discussion'];
    const found = keywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      isAnnouncement: found.length > 0,
      keywords: found,
      requiresAction: found.includes('Topic') || found.includes('Discussion')
    };
  }

  test('detects announcement with Topic keyword', () => {
    const message = 'New Topic: Intelligent Agents - AIMA Chapter 2';
    const result = parseAnnouncement(message);
    
    expect(result.isAnnouncement).toBe(true);
    expect(result.keywords).toContain('Topic');
    expect(result.requiresAction).toBe(true);
  });

  test('detects AIMA chapter reference', () => {
    const message = 'Please read AIMA Chapter 27 for next discussion';
    const result = parseAnnouncement(message);
    
    expect(result.isAnnouncement).toBe(true);
    expect(result.keywords).toContain('AIMA Chapter');
  });

  test('detects deadline in announcement', () => {
    const message = 'Deadline: Friday 5pm - Submit your analysis';
    const result = parseAnnouncement(message);
    
    expect(result.isAnnouncement).toBe(true);
    expect(result.keywords).toContain('Deadline');
  });

  test('ignores regular chat messages', () => {
    const message = 'Hey everyone, how are you doing?';
    const result = parseAnnouncement(message);
    
    expect(result.isAnnouncement).toBe(false);
    expect(result.requiresAction).toBe(false);
  });

  test('extracts chapter number from message', () => {
    const message = 'Topic: Search Algorithms - AIMA Chapter 3';
    const chapterMatch = message.match(/Chapter\s+(\d+)/i);
    
    expect(chapterMatch).not.toBeNull();
    expect(chapterMatch[1]).toBe('3');
  });
});
