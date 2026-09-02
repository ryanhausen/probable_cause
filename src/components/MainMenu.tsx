import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import { Play, Settings, FolderOpen, Lock, ArrowLeft } from 'lucide-react';
import type { Story } from '../engine/types';

export const MainMenu: React.FC = () => {
    const { loadStory, currentStory, setInMenu } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);
    const [menuView, setMenuView] = useState<'main' | 'levels'>('main');

    const handleStartStory = async (jsonPath: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const story: Story = await response.json();
            loadStory(story);
        } catch (error) {
            console.error("Failed to load story:", error);
            alert("Failed to load the story. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadCustomStory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedStory = JSON.parse(content) as Story;
                loadStory(parsedStory);
            } catch (err) {
                console.error("Failed to parse story json", err);
                alert("Invalid Story JSON file.\nError: " + (err as Error).message);
            }
        };
        reader.readAsText(file);
    };

    if (menuView === 'levels') {
        return (
            <div className="main-menu-container animate-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                backgroundImage: 'linear-gradient(to bottom, var(--bg-dark), #000)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="crt-overlay" />
                
                {/* Back Button */}
                <button
                    onClick={() => setMenuView('main')}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius)',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-panel)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <ArrowLeft size={16} /> BACK TO MENU
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem', zIndex: 10 }}>
                    <h2 className="font-terminal" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        ACTIVE INVESTIGATIONS
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        [ SELECT AN ARCHIVED OR CURRENT CASE FILE TO DEPLOY ]
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem',
                    width: '100%',
                    maxWidth: '800px',
                    justifyContent: 'center',
                    zIndex: 10
                }}>
                    {/* Active Story Card */}
                    <div 
                        className="terminal-panel"
                        onClick={() => !isLoading && handleStartStory('/stories/defaultStory.json')}
                        style={{
                            padding: '2rem',
                            cursor: isLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '280px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'rgba(26, 29, 36, 0.60)',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className="font-terminal" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FolderOpen size={12} /> CASE-01
                                </span>
                                <span className="font-terminal-green" style={{ fontSize: '0.75rem', border: '1px solid var(--accent-success)', padding: '2px 6px', borderRadius: '4px' }}>
                                    AVAILABLE
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem' }}>
                                A Curated Conspiracy
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                A priceless museum artifact has gone missing. The curator Higgins stands nervous. Can you uncover the truth or will the culprit escape justice?
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(55, 65, 81, 0.3)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                DIFFICULTY: <span style={{ color: 'var(--accent-success)' }}>EASY</span>
                            </span>
                            <span className="font-terminal" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {isLoading ? 'INITIALIZING...' : 'INITIALIZE'} <Play size={10} style={{ fill: 'currentColor' }} />
                            </span>
                        </div>
                    </div>

                    {/* Locked Teaser Story Card */}
                    <div 
                        className="terminal-panel"
                        style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '280px',
                            border: '1px solid rgba(55, 65, 81, 0.2)',
                            backgroundColor: 'rgba(15, 17, 21, 0.40)',
                            opacity: 0.5,
                            cursor: 'not-allowed',
                            position: 'relative'
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className="font-terminal-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Lock size={12} /> CASE-02
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                                    CLASSIFIED
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem' }}>
                                The Double Agent
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                High-profile espionage at the city's intelligence hub. A rogue operative has breached containment. Track down the leaks before they cross the border.
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(55, 65, 81, 0.1)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                DIFFICULTY: <span style={{ color: 'var(--accent-danger)' }}>HARD</span>
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                LOCKED <Lock size={10} />
                            </span>
                        </div>
                    </div>

                    {/* Load Custom Story Card */}
                    <div 
                        className="terminal-panel"
                        style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '280px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: '1px dashed var(--border-color)',
                            backgroundColor: 'rgba(26, 29, 36, 0.40)',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className="font-terminal" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FolderOpen size={12} /> CUSTOM-CASE
                                </span>
                                <span className="font-terminal-green" style={{ fontSize: '0.75rem', border: '1px solid var(--accent-success)', padding: '2px 6px', borderRadius: '4px' }}>
                                    READY
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem' }}>
                                Load Custom Case
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Have an unlisted case file? Upload your custom .json story here to begin your independent investigation.
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(55, 65, 81, 0.3)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                FORMAT: <span style={{ color: 'var(--accent-primary)' }}>.JSON</span>
                            </span>
                            <label style={{ 
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--accent-primary)',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                textDecoration: 'underline'
                            }}>
                                BROWSE FILES <FolderOpen size={10} />
                                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoadCustomStory} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
            <div className="crt-overlay" />
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
                        onClick={() => setInMenu(false)}
                    >
                        <Play size={20} /> Resume Case
                    </button>
                )}
                
                <button
                    className="menu-button"
                    style={{ ...buttonStyle, borderColor: 'var(--accent-primary)' }}
                    onClick={() => setMenuView('levels')}
                >
                    <FolderOpen size={20} /> New Story
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
    letterSpacing: '0.05em',
    cursor: 'pointer'
};
