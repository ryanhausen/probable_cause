import React from 'react';
import { useGameStore, calculatePlausibility } from '../engine/gameStore';

export const CaseNotebook: React.FC = () => {
    const { currentStory, collectedClues } = useGameStore();

    if (!currentStory) return null;

    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-panel)' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Case Notebook
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Collected Evidence</h3>
                    {collectedClues.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No evidence collected yet.</p>
                    ) : (
                        <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {collectedClues.map(clueId => {
                                const clue = currentStory.clues[clueId];
                                return (
                                    <li key={clueId} style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--border-radius)', borderLeft: '4px solid var(--accent-primary)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{clue.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{clue.description}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Theories & Suspects</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.values(currentStory.theories).map(theory => {
                            const plausibility = calculatePlausibility(currentStory, theory.id, collectedClues);
                            return (
                                <div key={theory.id} style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>{theory.name}</h4>
                                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{theory.description}</p>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Plausibility</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{plausibility}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${plausibility}%`, height: '100%', backgroundColor: plausibility > 50 ? 'var(--accent-success)' : 'var(--accent-danger)', transition: 'width 0.3s' }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
