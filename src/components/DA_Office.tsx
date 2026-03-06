import React, { useState } from 'react';
import { useGameStore, calculatePlausibility } from '../engine/gameStore';
import { evaluateCase } from '../engine/mathEngine';

export const DA_Office: React.FC = () => {
    const { currentStory, collectedClues, reset } = useGameStore();
    const [selectedTheoryId, setSelectedTheoryId] = useState<string>('');
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    if (!currentStory) return null;

    const handleSubmitCase = () => {
        if (!selectedTheoryId) return;
        const plausibility = calculatePlausibility(currentStory, selectedTheoryId, collectedClues);
        const evaluation = evaluateCase(plausibility);
        setResult(evaluation);
    };

    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>District Attorney's Office</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px', marginBottom: '2rem' }}>
                Are you ready to submit your findings? If your case isn't plausible enough,
                the DA will throw it out. Even if it is, there's always a chance the jury
                doesn't buy it. Make sure you have enough evidence.
            </p>

            {result ? (
                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    maxWidth: '600px',
                    textAlign: 'center',
                    border: `2px solid ${result.success ? 'var(--accent-success)' : 'var(--accent-danger)'}`
                }}>
                    <h3 style={{ color: result.success ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '1.8rem', marginBottom: '1rem' }}>
                        {result.success ? 'Case Won!' : 'Case Lost.'}
                    </h3>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{result.message}</p>
                    <button
                        onClick={reset}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                        Return to Main Menu
                    </button>
                </div>
            ) : (
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '600px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Select a Theory to Prosecute</h3>
                    <select
                        value={selectedTheoryId}
                        onChange={(e) => setSelectedTheoryId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--bg-dark)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--border-radius)',
                            marginBottom: '2rem',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Select a theory...</option>
                        {Object.values(currentStory.theories).map(theory => (
                            <option key={theory.id} value={theory.id}>{theory.name} - Suspect: {theory.suspectName}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleSubmitCase}
                        disabled={!selectedTheoryId}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: selectedTheoryId ? 'var(--accent-primary)' : 'var(--bg-dark)',
                            color: selectedTheoryId ? '#000' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            borderRadius: 'var(--border-radius)',
                            border: 'none',
                        }}
                    >
                        Submit Case
                    </button>
                </div>
            )}
        </div>
    );
};
