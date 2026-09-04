import React from 'react';
import { useGameStore, isTheoryDiscovered } from '../engine/gameStore';
import { X, MessageSquare } from 'lucide-react';

interface DialogueSystemProps {
    characterId: string;
    onClose: () => void;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({ characterId, onClose }) => {
    const { currentStory, collectedClues, advanceDialogue, collectClue, addLog } = useGameStore();

    if (!currentStory) return null;

    const character = currentStory.characters[characterId];
    if (!character) return null;

    const currentNode = character.dialogueNodes[character.currentDialogueNodeId];

    const handleOptionClick = (option: any) => {
        if (option.grantsClueId) {
            const alreadyCollected = collectedClues.includes(option.grantsClueId);
            collectClue(option.grantsClueId);

            if (!alreadyCollected) {
                const clue = currentStory.clues[option.grantsClueId];
                if (clue) {
                    const nextClues = [...collectedClues, option.grantsClueId];
                    addLog(`[!] TESTIMONY SECURED: "${clue.name}"`, 'clue');

                    // Announce any newly discovered theories
                    Object.values(currentStory.theories).forEach(theory => {
                        const wasDiscovered = isTheoryDiscovered(currentStory, theory.id, collectedClues);
                        const isNowDiscovered = isTheoryDiscovered(currentStory, theory.id, nextClues);
                        if (!wasDiscovered && isNowDiscovered) {
                            addLog(`[!] NEW THEORY FORMULATED: "${theory.name}" (Suspect: ${theory.suspectName})`, 'clue');
                        }
                    });
                }
            }
        }

        if (option.nextNodeId) {
            advanceDialogue(characterId, option.nextNodeId);
        } else {
            onClose(); // End conversation
        }
    };

    return (
        <div className="dialogue-overlay" style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--bg-overlay)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '2rem',
            zIndex: 100
        }}>
            <div className="dialogue-box animate-slide-up" style={{
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-panel)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} />
                        {character.name}
                    </h3>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem', flex: 1 }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', letterSpacing: '0.03em' }}>
                        "{currentNode.text}"
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentNode.options.map((option, idx) => {
                            // Check if option requires a clue
                            if (option.requiredClueId && !collectedClues.includes(option.requiredClueId)) {
                                return null;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1rem',
                                        backgroundColor: 'var(--bg-panel)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--border-radius)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                >
                                    {option.text}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
