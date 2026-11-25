import { describe, it, expect } from 'vitest';
import {
  computeWealthProjection,
  STUDENT_GOAL_PRESETS,
} from '../wealthProjector';
import { lessons } from '../../data/lessons';
import { glossaryFlashcards } from '../../data/glossary';

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

describe('wealthProjector engine', () => {
  it('simulates monthly compounding and orders benchmarks accurately at risk 7', () => {
    const res = computeWealthProjection({
      initialCapital: 1000,
      monthlyContribution: 500,
      years: 10,
      riskLevel: 7,
      annualStepUpPct: 0,
      inflationAdjusted: false,
      targetGoalRM: null,
    });

    expect(res.points).toHaveLength(11);
    expect(res.points[0].year).toBe(0);
    expect(res.points[0].wealth).toBe(1000);
    expect(res.nominalRatePct).toBe(9.6);
    expect(res.effectiveRatePct).toBe(9.6);
    expect(res.finalInvested).toBe(1000 + 500 * 12 * 10);
    expect(res.finalWealth).toBeGreaterThan(res.finalEpfWealth);
    expect(res.finalEpfWealth).toBeGreaterThan(res.finalFdWealth);
    expect(res.finalFdWealth).toBeGreaterThan(res.finalInvested);
    expect(res.beatFdBy).toBe(res.finalWealth - res.finalFdWealth);
    expect(res.beatEpfBy).toBe(res.finalWealth - res.finalEpfWealth);
    expect(res.estimatedMonthlyDividend).toBe(Math.round((res.finalWealth * 0.05) / 12));
    expect(res.delayCost3Yr).toBeGreaterThan(0);
    expect(res.swapComparison.monthlyRM).toBe(450);
    expect(res.swapComparison.projectedRM).toBeGreaterThan(450 * 12 * 10);
  });

  it('adjusts FD benchmark to ~0% real return under 3% inflation', () => {
    const res = computeWealthProjection({
      initialCapital: 2000,
      monthlyContribution: 400,
      years: 10,
      riskLevel: 5,
      annualStepUpPct: 0,
      inflationAdjusted: true,
      targetGoalRM: null,
    });

    expect(res.effectiveRatePct).toBe(5.0);
    expect(res.finalFdWealth).toBe(res.finalInvested);
  });

  it('increases invested total and final wealth when annual step-up is enabled', () => {
    const base = computeWealthProjection({
      initialCapital: 1000,
      monthlyContribution: 500,
      years: 10,
      riskLevel: 6,
      annualStepUpPct: 0,
      inflationAdjusted: false,
      targetGoalRM: null,
    });
    const stepped = computeWealthProjection({
      initialCapital: 1000,
      monthlyContribution: 500,
      years: 10,
      riskLevel: 6,
      annualStepUpPct: 10,
      inflationAdjusted: false,
      targetGoalRM: null,
    });

    expect(stepped.finalInvested).toBeGreaterThan(base.finalInvested);
    expect(stepped.finalWealth).toBeGreaterThan(base.finalWealth);
  });

  it('detects goalHitYear when reachable and returns null when unreachable', () => {
    const reachable = computeWealthProjection({
      initialCapital: 2000,
      monthlyContribution: 550,
      years: 10,
      riskLevel: 7,
      annualStepUpPct: 5,
      inflationAdjusted: false,
      targetGoalRM: 30000,
    });
    const unreachable = computeWealthProjection({
      initialCapital: 0,
      monthlyContribution: 100,
      years: 5,
      riskLevel: 1,
      annualStepUpPct: 0,
      inflationAdjusted: false,
      targetGoalRM: 500000,
    });

    expect(reachable.goalHitYear).not.toBeNull();
    expect(reachable.goalHitYear!).toBeGreaterThan(0);
    expect(reachable.goalHitYear!).toBeLessThanOrEqual(10);
    expect(unreachable.goalHitYear).toBeNull();
    expect(STUDENT_GOAL_PRESETS).toHaveLength(5);
  });
});

describe('expanded curriculum & glossary integrity', () => {
  it('has 12 bilingual lessons (8 articles + 4 video walkthroughs) with 3 explained quiz questions each and zero emojis', () => {
    expect(lessons).toHaveLength(12);
    const articles = lessons.filter((l) => l.type === 'article');
    const videos = lessons.filter((l) => l.type === 'video');
    expect(articles).toHaveLength(8);
    expect(videos).toHaveLength(4);

    for (const lesson of lessons) {
      expect(lesson.keyRuleEng.trim().length).toBeGreaterThan(10);
      expect(lesson.keyRuleBm.trim().length).toBeGreaterThan(10);
      expect(lesson.bursaExampleEng.trim().length).toBeGreaterThan(10);
      expect(lesson.bursaExampleBm.trim().length).toBeGreaterThan(10);
      expect(lesson.quiz).toHaveLength(3);

      for (const q of lesson.quiz) {
        expect(q.optionsEng).toHaveLength(3);
        expect(q.optionsBm).toHaveLength(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(3);
        expect(q.explanationEng.trim().length).toBeGreaterThan(10);
        expect(q.explanationBm.trim().length).toBeGreaterThan(10);
      }

      if (lesson.type === 'video') {
        expect(lesson.chapters).toBeDefined();
        expect(lesson.chapters!.length).toBe(3);
      }

      const combinedText = [
        lesson.titleEng,
        lesson.titleBm,
        lesson.descEng,
        lesson.descBm,
        lesson.keyRuleEng,
        lesson.keyRuleBm,
        lesson.bursaExampleEng,
        lesson.bursaExampleBm,
        ...lesson.bodyEng,
        ...lesson.bodyBm,
      ].join(' ');
      expect(EMOJI_REGEX.test(combinedText)).toBe(false);
    }
  });

  it('has 15 bilingual Bursa glossary flashcards with zero emojis', () => {
    expect(glossaryFlashcards).toHaveLength(15);
    for (const card of glossaryFlashcards) {
      expect(card.termEng.trim().length).toBeGreaterThan(1);
      expect(card.termBm.trim().length).toBeGreaterThan(1);
      expect(card.shortEng.trim().length).toBeGreaterThan(10);
      expect(card.shortBm.trim().length).toBeGreaterThan(10);
      expect(card.detailEng.trim().length).toBeGreaterThan(20);
      expect(card.detailBm.trim().length).toBeGreaterThan(20);
      expect(card.exampleEng.trim().length).toBeGreaterThan(10);
      expect(card.exampleBm.trim().length).toBeGreaterThan(10);

      const combined = [
        card.termEng,
        card.termBm,
        card.shortEng,
        card.shortBm,
        card.detailEng,
        card.detailBm,
        card.exampleEng,
        card.exampleBm,
      ].join(' ');
      expect(EMOJI_REGEX.test(combined)).toBe(false);
    }
  });
});
