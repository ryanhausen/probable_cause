import { describe, it, expect } from 'vitest';
import { calculatePlausibility } from '../gameStore';
import { defaultStory } from '../../stories/defaultStory';

describe('gameStore calculations', () => {
    it('calculates base plausibility with no clues', () => {
        const plausibility = calculatePlausibility(defaultStory, 'theory-robbery', []);
        expect(plausibility).toBe(10); // base is 10
    });

    it('adds plausibility modifiers for matching theory', () => {
        const plausibility = calculatePlausibility(defaultStory, 'theory-robbery', ['clue-glass']); // +10
        expect(plausibility).toBe(20);
    });

    it('adds multiple modifiers accurately', () => {
        const plausibility = calculatePlausibility(defaultStory, 'theory-insurance', ['clue-debt', 'clue-inside-job']);
        // base: 5
        // clue-debt: +40
        // clue-inside-job: +30
        // Total: 75
        expect(plausibility).toBe(75);
    });

    it('caps max plausibility at 100', () => {
        // If we gave it clues that go over 100
        const testStory = {
            ...defaultStory,
            theories: {
                'test': { id: 'test', name: 'Test', description: '', suspectName: '', basePlausibility: 90 }
            },
            clues: {
                'clue-x': {
                    id: 'clue-x', name: '', description: '',
                    plausibilityModifiers: [{ theoryId: 'test', amount: 50 }]
                }
            }
        };

        const plausibility = calculatePlausibility(testStory, 'test', ['clue-x']);
        expect(plausibility).toBe(100); // 90 + 50 = 140, capped at 100
    });
});
