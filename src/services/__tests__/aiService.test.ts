import { describe, it, expect } from 'vitest';
import { buildLocalReport, buildLocalChatReply } from '../aiService';
import { stocks } from '../../data/stocks';

describe('aiService grounded analyst', () => {
  it('generates emoji-free fundamental report for any of the 20 Bursa stocks', () => {
    const gamuda = stocks.find((s) => s.ticker === 'GAMUDA')!;
    const report = buildLocalReport(gamuda, 'ENG');
    expect(report.title).toContain('GAMUDA');
    expect(report.growth).toContain('5398.KL');
    expect(report.shariahNote).toContain('Shariah-Compliant');
    expect(report.score).toBeGreaterThanOrEqual(58);
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(JSON.stringify(report))).toBe(false);
  });

  it('answers stock-specific and Shariah queries using real metrics and cash context', () => {
    const reply = buildLocalChatReply('Tell me about MAYBANK', {
      language: 'ENG',
      cashRM: '9,250.00',
      portfolioSummary: '2 positions',
      userProfile: 'Jom-Builder',
      stocks,
    });
    expect(reply).toContain('1155.KL');
    expect(reply).toContain('6.26%');
    expect(reply).toContain('9,250.00');
  });
});
