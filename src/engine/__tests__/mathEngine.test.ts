import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateCase } from '../mathEngine';

describe('mathEngine', () => {
    beforeEach(() => {
        // Math.random will return a configurable value in tests
        vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fails immediately if plausibility is 50 or below', () => {
        const result1 = evaluateCase(50);
        expect(result1.success).toBe(false);
        expect(result1.message).toContain('rejected the case outright');

        const result2 = evaluateCase(25);
        expect(result2.success).toBe(false);
    });

    it('wins if random roll is lower than plausibility (e.g. 75 > 50)', () => {
        // If Math.random() is 0.49, randomValue = 49. It should win if plausibility > 49.
        vi.mocked(Math.random).mockReturnValue(0.49);

        const result = evaluateCase(75);
        expect(result.success).toBe(true);
        expect(result.message).toContain('DA took the case to court and won');
    });

    it('loses if random roll is higher than plausibility (e.g. 75 < 90)', () => {
        // If Math.random() is 0.90, randomValue = 90. It should lose if plausibility is 75.
        vi.mocked(Math.random).mockReturnValue(0.90);

        const result = evaluateCase(75);
        expect(result.success).toBe(false);
        expect(result.message).toContain('defense found a loophole');
    });

    it('guarantees win if plausibility is 100', () => {
        // Even if random hits the max bound (0.999...)
        vi.mocked(Math.random).mockReturnValue(0.9999);

        const result = evaluateCase(100);
        expect(result.success).toBe(true);
    });
});
