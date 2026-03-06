import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import { DialogueSystem } from './DialogueSystem';
import { Search, MessageCircle, ArrowRightCircle } from 'lucide-react';

export const SceneViewer: React.FC = () => {
    const { currentSceneId, currentStory, collectClue, moveToScene } = useGameStore();
    const [activeDialogueId, setActiveDialogueId] = useState<string | null>(null);

    if (!currentStory || !currentSceneId) return null;

    const scene = currentStory.scenes[currentSceneId];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'var(--bg-dark)' }}>
            {/* Background Image */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: scene.imageUrl ? `url(${scene.imageUrl})` : 'linear-gradient(135deg, #111827, #000)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.85
            }} />

            {/* Scene Content Container */}
            <div style={{ position: 'relative', zIndex: 10, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

                <header style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', textShadow: 'var(--shadow-glow)' }}>
                        {scene.name}
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
                        {scene.description}
                    </p>
                </header>

                <div style={{ flex: 1, position: 'relative', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', backgroundColor: 'var(--bg-panel)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                    {/* Centered area for "spatial" interactions */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        {/* Travel Navigation at the top inside this container */}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '1rem', zIndex: 5 }}>
                            {scene.connectedScenes.map(targetId => {
                                const targetScene = currentStory.scenes[targetId];
                                return (
                                    <button
                                        key={targetId}
                                        onClick={() => moveToScene(targetId)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1rem',
                                            backgroundColor: 'var(--bg-dark)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--border-radius)',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                    >
                                        Travel to {targetScene.name}
                                        <ArrowRightCircle size={18} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Interactables */}
                        {scene.interactables.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.grantsClueId) collectClue(item.grantsClueId);
                                    alert(`You examined: ${item.name}\n${item.description}`);
                                }}
                                className="hover-pop"
                                style={{
                                    position: 'absolute',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    color: 'var(--text-primary)',
                                    transition: 'color 0.2s, transform 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '50%', border: '2px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
                                    <Search size={24} color="var(--accent-primary)" />
                                </div>
                                <span style={{ marginTop: '0.5rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{item.name}</span>
                            </button>
                        ))}

                        {/* Characters */}
                        {scene.charactersPresent.map((charId, idx) => {
                            const character = currentStory.characters[charId];
                            return (
                                <button
                                    key={charId}
                                    onClick={() => setActiveDialogueId(charId)}
                                    className="hover-pop"
                                    style={{
                                        position: 'absolute',
                                        // Disperse characters horizontally
                                        left: `${20 + (idx * 25)}%`,
                                        top: '60%',
                                        transform: 'translate(-50%, -50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '50%', border: '2px solid var(--text-primary)', boxShadow: 'var(--shadow-md)' }}>
                                        <MessageCircle size={32} />
                                    </div>
                                    <span style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '1.2rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{character.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {activeDialogueId && (
                <DialogueSystem characterId={activeDialogueId} onClose={() => setActiveDialogueId(null)} />
            )}
        </div>
    );
};
