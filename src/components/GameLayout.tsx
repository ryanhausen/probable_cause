import React, { useState } from 'react';
import { useGameStore } from '../engine/gameStore';
import { Map, BookOpen, Briefcase, ChevronRight } from 'lucide-react';
import { SceneViewer } from './SceneViewer';
import { CaseNotebook } from './CaseNotebook';
import { DA_Office } from './DA_Office';

export const GameLayout: React.FC = () => {
    const { currentSceneId, currentStory } = useGameStore();
    const [activeTab, setActiveTab] = useState<'scene' | 'notebook' | 'da'>('scene');

    if (!currentStory || !currentSceneId) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#000' }}>

            {/* Main View Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {activeTab === 'scene' && <SceneViewer />}
                {activeTab === 'notebook' && <CaseNotebook />}
                {activeTab === 'da' && <DA_Office />}
            </div>

            {/* Navigation Bar */}
            <nav style={{
                height: '70px',
                backgroundColor: 'var(--bg-dark)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <NavButton
                        icon={<Map />}
                        label="Location"
                        active={activeTab === 'scene'}
                        onClick={() => setActiveTab('scene')}
                    />
                    <NavButton
                        icon={<BookOpen />}
                        label="Notebook"
                        active={activeTab === 'notebook'}
                        onClick={() => setActiveTab('notebook')}
                    />
                </div>

                <button
                    onClick={() => setActiveTab('da')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: activeTab === 'da' ? 'var(--bg-panel)' : 'var(--accent-primary)',
                        color: activeTab === 'da' ? 'var(--accent-primary)' : '#000',
                        fontWeight: 700,
                        borderRadius: 'var(--border-radius-lg)',
                        border: activeTab === 'da' ? '1px solid var(--accent-primary)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Briefcase size={20} />
                    <span>See D.A.</span>
                    <ChevronRight size={16} />
                </button>
            </nav>
        </div>
    );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            fontWeight: 600,
            opacity: active ? 1 : 0.7,
            transition: 'opacity 0.2s',
            borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
            paddingBottom: '4px'
        }}
    >
        {icon}
        {label}
    </button>
);
