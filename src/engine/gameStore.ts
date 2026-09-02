import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Story } from './types';

const initialState = {
    currentStory: null,
    currentSceneId: null,
    collectedClues: [],
    inMenu: true,
    logs: [],
    lastLoggedSceneId: null,
};

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            ...initialState,

            loadStory: (story: Story) => set({
                currentStory: story,
                currentSceneId: story.startingSceneId,
                collectedClues: [],
                inMenu: false,
                logs: [],
                lastLoggedSceneId: null
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

            setInMenu: (inMenu: boolean) => set({ inMenu }),

            addLog: (text: string, type: 'info' | 'action' | 'clue' = 'info') => set((state) => {
                const now = new Date();
                const timeStr = now.toTimeString().split(' ')[0];
                const newLog = {
                    id: `log-${Date.now()}-${Math.random()}`,
                    timestamp: timeStr,
                    text,
                    type
                };
                return { logs: [...state.logs, newLog] };
            }),

            setLastLoggedSceneId: (id: string | null) => set({ lastLoggedSceneId: id }),
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

    const maxPlausibility = theory.maxPlausibility !== undefined ? theory.maxPlausibility : 100;
    return Math.max(0, Math.min(maxPlausibility, plausibility));
};

// Helper to check if a theory has been discovered following the narrative
export const isTheoryDiscovered = (story: Story, theoryId: string, collectedClues: string[]): boolean => {
    const theory = story.theories[theoryId];
    if (!theory) return false;

    // Check multiple unlock clues if defined
    if (theory.unlockedByClueIds && theory.unlockedByClueIds.length > 0) {
        return theory.unlockedByClueIds.some(clueId => collectedClues.includes(clueId));
    }

    // Check single unlock clue if defined
    const unlockClueId = theory.unlockedByClueId || theory.requiredClueId;
    if (unlockClueId) {
        return collectedClues.includes(unlockClueId);
    }

    // If no unlock clue specified, theory is known by default (backward compatible)
    return true;
};

// Helper to get all currently discovered theories
export const getDiscoveredTheories = (story: Story, collectedClues: string[]) => {
    return Object.values(story.theories).filter(theory =>
        isTheoryDiscovered(story, theory.id, collectedClues)
    );
};

