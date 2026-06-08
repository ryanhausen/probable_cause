export interface LogItem {
    id: string;
    timestamp: string;
    text: string;
    type: 'info' | 'action' | 'clue';
}

export interface Clue {
    id: string;
    name: string;
    description: string;
    plausibilityModifiers: Array<{
        theoryId: string;
        amount: number; // percentage points, e.g. 15 for +15%, -10 for -10%
    }>;
}

export interface DialogueOption {
    text: string;
    nextNodeId?: string; // If undefined, ends conversation
    requiredClueId?: string; // Option only visible if player has this clue
    grantsClueId?: string; // Option gives player a clue upon selection
}

export interface DialogueNode {
    id: string;
    text: string;
    options: DialogueOption[];
}

export interface Character {
    id: string;
    name: string;
    description: string;
    portraitUrl?: string; // can be an emoji or image path
    dialogueNodes: Record<string, DialogueNode>;
    currentDialogueNodeId: string; // the entry point for talking to them
}

export interface Interactable {
    id: string;
    name: string;
    description: string;
    x: number; // e.g., percentage position for UI
    y: number;
    grantsClueId?: string; // finding this gives a clue
}

export interface Scene {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    connectedScenes: string[]; // IDs of scenes the player can move to from here
    charactersPresent: string[]; // IDs of characters currently in this scene
    interactables: Interactable[];
}

export interface Theory {
    id: string;
    name: string;
    description: string;
    suspectName: string;
    basePlausibility: number; // usually 0
}

export interface Story {
    id: string;
    title: string;
    description: string;
    scenes: Record<string, Scene>;
    characters: Record<string, Character>;
    clues: Record<string, Clue>;
    theories: Record<string, Theory>;
    startingSceneId: string;
}

export interface GameState {
    currentStory: Story | null;
    currentSceneId: string | null;
    collectedClues: string[]; // IDs of collected clues
    inMenu: boolean;
    logs: LogItem[];
    lastLoggedSceneId: string | null;

    // Actions
    loadStory: (story: Story) => void;
    moveToScene: (sceneId: string) => void;
    collectClue: (clueId: string) => void;
    advanceDialogue: (characterId: string, nextNodeId: string) => void;
    reset: () => void;
    setInMenu: (inMenu: boolean) => void;
    addLog: (text: string, type: 'info' | 'action' | 'clue') => void;
    setLastLoggedSceneId: (id: string | null) => void;
}
