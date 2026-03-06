import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Story } from './types';

const initialState = {
    currentStory: null,
    currentSceneId: null,
    collectedClues: [],
};

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            ...initialState,

            loadStory: (story: Story) => set({
                currentStory: story,
                currentSceneId: story.startingSceneId,
                collectedClues: []
            }),

            moveToScene: (sceneId: string) => set((state) => {
                if (!state.currentStory || !state.currentStory.scenes[sceneId]) {
                    return state;
                }
                return { currentSceneId: sceneId };
            }),

            collectClue: (clueId: string) => set((state) => {
                if (!state.currentStory || !state.currentStory.clues[clueId]) {
                    return state;
                }
                if (state.collectedClues.includes(clueId)) {
                    return state; // already collected
                }
                return { collectedClues: [...state.collectedClues, clueId] };
            }),

            advanceDialogue: (characterId: string, nextNodeId: string) => set((state) => {
                if (!state.currentStory) return state;

                const character = state.currentStory.characters[characterId];
                if (!character) return state;

                // Create deep copy of characters to update the dialogue node
                const updatedCharacters = { ...state.currentStory.characters };
                updatedCharacters[characterId] = {
                    ...character,
                    currentDialogueNodeId: nextNodeId
                };

                return {
                    currentStory: {
                        ...state.currentStory,
                        characters: updatedCharacters
                    }
                };
            }),

            reset: () => set(initialState),
        }),
        {
            name: 'probable-cause-save', // unique name
        }
    )
);

// Helper to calculate plausibility of a theory
export const calculatePlausibility = (story: Story, theoryId: string, collectedClues: string[]): number => {
    const theory = story.theories[theoryId];
    if (!theory) return 0;

    let plausibility = theory.basePlausibility;

    collectedClues.forEach(clueId => {
        const clue = story.clues[clueId];
        if (clue) {
            const modifier = clue.plausibilityModifiers.find(mod => mod.theoryId === theoryId);
            if (modifier) {
                plausibility += modifier.amount;
            }
        }
    });

    return Math.max(0, Math.min(100, plausibility)); // clamp between 0 and 100
};
