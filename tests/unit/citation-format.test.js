describe('Citation Format Validation', () => {
  const validCitations = [
    'AIMA 4th Edition, Chapter 2, p.34',
    'Russell & Norvig (2020), Chapter 27',
    'Artificial Intelligence: A Modern Approach, Section 2.3'
  ];

  const invalidCitations = [
    'I think this is true',
    'According to the internet',
    'Everyone knows that'
  ];

  function hasCitation(text) {
    const citationPatterns = [
      /AIMA.*Chapter\s+\d+/i,
      /Russell\s*&\s*Norvig/i,
      /Artificial Intelligence.*Section/i,
      /\(20\d{2}\)/,
      /p\.\s*\d+/
    ];
    return citationPatterns.some(pattern => pattern.test(text));
  }

  test('recognizes valid citations', () => {
    validCitations.forEach(citation => {
      expect(hasCitation(citation)).toBe(true);
    });
  });

  test('rejects invalid citations', () => {
    invalidCitations.forEach(citation => {
      expect(hasCitation(citation)).toBe(false);
    });
  });

  test('agent response includes source reference', () => {
    const mockResponse = 'Based on AIMA 4th Edition Chapter 2, intelligent agents perceive their environment.';
    expect(hasCitation(mockResponse)).toBe(true);
  });

  test('citation includes chapter or page number', () => {
    const citation = 'AIMA 4th Edition, Chapter 2, p.34';
    expect(citation).toMatch(/Chapter\s+\d+/);
    expect(citation).toMatch(/p\.\s*\d+/);
  });
});
