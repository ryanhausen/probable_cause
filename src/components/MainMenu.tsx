import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { defaultStory } from '../stories/defaultStory'; // We will create this next
import { Play, Settings, RefreshCw } from 'lucide-react';

export const MainMenu: React.FC = () => {
    const { loadStory, currentStory } = useGameStore();

    const handleStartGame = () => {
        loadStory(defaultStory);
    };

    return (
        <div className="main-menu-container animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundImage: 'linear-gradient(to bottom, var(--bg-dark), #000)',
        }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '4rem', color: 'var(--accent-primary)', textShadow: 'var(--shadow-glow)' }}>
                    PROBABLE CAUSE
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Truth is just a matter of plausibility.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                {currentStory && (
                    <button
                        className="menu-button"
                        style={buttonStyle}
                    // Resume feature to be implemented by just hiding this menu in App.tsx
                    >
                        <Play size={20} /> Resume Case
                    </button>
                )}
                <button
                    className="menu-button"
                    style={{ ...buttonStyle, borderColor: 'var(--accent-primary)' }}
                    onClick={handleStartGame}
                >
                    <RefreshCw size={20} /> {currentStory ? 'Restart Case' : 'New Case'}
                </button>
                <button
                    className="menu-button"
                    style={buttonStyle}
                    disabled
                >
                    <Settings size={20} /> Settings
                </button>
            </div>
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    backgroundColor: 'var(--bg-panel)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius)',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};
