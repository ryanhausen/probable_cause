import { describe, it, expect } from 'vitest';
import { calculatePlausibility, isTheoryDiscovered, getDiscoveredTheories } from '../gameStore';
import defaultStory from '../../../public/stories/defaultStory.json';

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

describe('Maple Hollow Story Integrity & Calculations', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mapleHollow = require('../../../public/stories/mapleHollow.json');

    it('has valid structure and scene graph references', () => {
        expect(mapleHollow.scenes[mapleHollow.startingSceneId]).toBeDefined();

        for (const [sceneId, scene] of Object.entries<any>(mapleHollow.scenes)) {
            for (const conn of scene.connectedScenes) {
                expect(mapleHollow.scenes[conn], `Scene ${sceneId} links to invalid scene ${conn}`).toBeDefined();
            }
            for (const charId of scene.charactersPresent) {
                expect(mapleHollow.characters[charId], `Scene ${sceneId} contains invalid character ${charId}`).toBeDefined();
            }
            for (const item of scene.interactables) {
                if (item.grantsClueId) {
                    expect(mapleHollow.clues[item.grantsClueId], `Item ${item.id} references invalid clue ${item.grantsClueId}`).toBeDefined();
                }
            }
        }
    });

    it('has valid dialogue node and option clue references', () => {
        for (const [charId, char] of Object.entries<any>(mapleHollow.characters)) {
            expect(char.dialogueNodes[char.currentDialogueNodeId], `${charId} missing currentDialogueNodeId`).toBeDefined();
            for (const [nodeId, node] of Object.entries<any>(char.dialogueNodes)) {
                for (const opt of node.options) {
                    if (opt.nextNodeId) {
                        expect(char.dialogueNodes[opt.nextNodeId], `${charId}.${nodeId} invalid nextNodeId ${opt.nextNodeId}`).toBeDefined();
                    }
                    if (opt.requiredClueId) {
                        expect(mapleHollow.clues[opt.requiredClueId], `${charId}.${nodeId} invalid requiredClueId ${opt.requiredClueId}`).toBeDefined();
                    }
                    if (opt.grantsClueId) {
                        expect(mapleHollow.clues[opt.grantsClueId], `${charId}.${nodeId} invalid grantsClueId ${opt.grantsClueId}`).toBeDefined();
                    }
                }
            }
        }
    });

    it('calculates plausibility shifts accurately according to the narrative', () => {
        // Base plausibilities
        expect(calculatePlausibility(mapleHollow, 'theory-mayor-fled', [])).toBe(15);
        expect(calculatePlausibility(mapleHollow, 'theory-asst-mayor', [])).toBe(15);
        expect(calculatePlausibility(mapleHollow, 'theory-officer-williams', [])).toBe(5);

        // Superficial red herring narrative: Williams's story + mayor's debts + dedication plaque
        const redHerringClues = ['clue-williams-theory', 'clue-shredded-receipt', 'clue-lone-survivor'];
        expect(calculatePlausibility(mapleHollow, 'theory-mayor-fled', redHerringClues)).toBe(65);

        // Assistant Mayor suspect narrative: Grudge + dedication plaque + forced lock + night visit
        const gableSuspectClues = ['clue-gable-grudge', 'clue-lone-survivor', 'clue-time-capsule-forced', 'clue-night-visit'];
        expect(calculatePlausibility(mapleHollow, 'theory-asst-mayor', gableSuspectClues)).toBe(75);

        // Deep forensic investigation solving the real crime against Officer Williams
        const solveClues = [
            'clue-capsule-secret',
            'clue-patrol-boat',
            'clue-williams-glove',
            'clue-patrol-treads',
            'clue-insulin-left',
            'clue-night-visit',
            'clue-engine-oil',
            'clue-gable-alibi',
            'clue-drag-marks',
            'clue-clara-testimony'
        ];
        expect(calculatePlausibility(mapleHollow, 'theory-officer-williams', solveClues)).toBe(95);
        expect(calculatePlausibility(mapleHollow, 'theory-officer-williams', [...solveClues, 'clue-williams-confession'])).toBe(95); // Caps at 95%
        expect(calculatePlausibility(mapleHollow, 'theory-mayor-fled', solveClues)).toBe(0);
        expect(calculatePlausibility(mapleHollow, 'theory-asst-mayor', solveClues)).toBe(0);
    });

    it('only unlocks theories as the player discovers possibilities following the narrative', () => {
        // At start with zero clues: NO theories are discovered
        expect(isTheoryDiscovered(mapleHollow, 'theory-mayor-fled', [])).toBe(false);
        expect(isTheoryDiscovered(mapleHollow, 'theory-asst-mayor', [])).toBe(false);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', [])).toBe(false);
        expect(getDiscoveredTheories(mapleHollow, []).length).toBe(0);

        // Talking to Williams unlocks the Mayor Absconded theory
        expect(isTheoryDiscovered(mapleHollow, 'theory-mayor-fled', ['clue-williams-theory'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-asst-mayor', ['clue-williams-theory'])).toBe(false);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-williams-theory'])).toBe(false);

        // Learning about Gable's grudge unlocks the Assistant Mayor theory
        expect(isTheoryDiscovered(mapleHollow, 'theory-asst-mayor', ['clue-gable-suspect'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-asst-mayor', ['clue-gable-grudge'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-gable-grudge'])).toBe(false);

        // Uncovering evidence implicating Williams (e.g. Vance's journal about the gold map) unlocks Officer Williams theory
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-capsule-secret'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-unauthorized-patrol'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-clara-testimony'])).toBe(true);
        expect(isTheoryDiscovered(mapleHollow, 'theory-officer-williams', ['clue-williams-glove'])).toBe(true);
    });
});

