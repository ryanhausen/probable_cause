import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, isTheoryDiscovered } from '../engine/gameStore';
import { DialogueSystem } from './DialogueSystem';
import { Search, MessageSquare, Compass, Terminal, History, Info, Sparkles } from 'lucide-react';

export const SceneViewer: React.FC = () => {
    const { currentSceneId, currentStory, collectClue, collectedClues, moveToScene, logs, addLog, lastLoggedSceneId, setLastLoggedSceneId } = useGameStore();
    const [activeDialogueId, setActiveDialogueId] = useState<string | null>(null);
    
    const feedEndRef = useRef<HTMLDivElement>(null);
    const loggedRef = useRef<string | null>(null);

    if (!currentStory || !currentSceneId) return null;

    const scene = currentStory.scenes[currentSceneId];

    // Trigger log entry on scene transition
    useEffect(() => {
        if (scene && currentSceneId !== lastLoggedSceneId && currentSceneId !== loggedRef.current) {
            loggedRef.current = currentSceneId;
            addLog(`--------------------------------------------------`, 'info');
            addLog(`[SYSTEM] ESTABLISHING CONNECTION TO SECURE SECTOR...`, 'info');
            addLog(`[SECTOR LINKED] ARRIVED AT: ${scene.name.toUpperCase()}`, 'info');
            addLog(scene.description, 'info');
            setLastLoggedSceneId(currentSceneId);
        }
    }, [currentSceneId, scene, lastLoggedSceneId, addLog, setLastLoggedSceneId]);

    // Autoscroll the logs panel to the bottom whenever logs update
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleInspectItem = (_itemId: string, name: string, description: string, grantsClueId?: string) => {
        // 1. Log the player action
        addLog(`EXAMINE: ${name}`, 'action');
        
        // 2. Log the item details/description
        addLog(`RESULT: ${description}`, 'info');

        // 3. Process clue collection if it's the first time
        if (grantsClueId) {
            const alreadyCollected = collectedClues.includes(grantsClueId);
            
            // Call the Zustand store action
            collectClue(grantsClueId);

            if (!alreadyCollected) {
                const clue = currentStory.clues[grantsClueId];
                if (clue) {
                    const nextClues = [...collectedClues, grantsClueId];
                    let modifierDetail = '';
                    if (clue.plausibilityModifiers && clue.plausibilityModifiers.length > 0) {
                        const visibleModifiers = clue.plausibilityModifiers.filter(mod =>
                            isTheoryDiscovered(currentStory, mod.theoryId, nextClues)
                        );
                        if (visibleModifiers.length > 0) {
                            modifierDetail = ' (' + visibleModifiers.map(mod => {
                                const theory = currentStory.theories[mod.theoryId];
                                const theoryName = theory ? theory.name : mod.theoryId;
                                const sign = mod.amount > 0 ? '+' : '';
                                return `${theoryName}: ${sign}${mod.amount}%`;
                            }).join(', ') + ')';
                        }
                    }
                    
                    addLog(`[!] EVIDENCE SECURED: "${clue.name}"${modifierDetail}`, 'clue');

                    // Announce any newly discovered theories
                    Object.values(currentStory.theories).forEach(theory => {
                        const wasDiscovered = isTheoryDiscovered(currentStory, theory.id, collectedClues);
                        const isNowDiscovered = isTheoryDiscovered(currentStory, theory.id, nextClues);
                        if (!wasDiscovered && isNowDiscovered) {
                            addLog(`[!] NEW THEORY FORMULATED: "${theory.name}" (Suspect: ${theory.suspectName})`, 'clue');
                        }
                    });
                }
            } else {
                addLog(`[i] Clue already filed in notebook database.`, 'info');
            }
        }
    };

    const handleTravel = (targetId: string, targetName: string) => {
        addLog(`TRAVEL DEPARTURE INITIATED: Destination [${targetName.toUpperCase()}]`, 'action');
        moveToScene(targetId);
    };

    return (
        <div className="retro-terminal-container">
            {/* Ambient CRT effects */}
            <div className="crt-overlay" />

            {/* Split Screen Dashboard */}
            <div style={{ display: 'flex', width: '100%', height: '100%', padding: '1.5rem', gap: '1.5rem', zIndex: 10 }}>
                
                {/* Left Panel: Autoscrolling Teletype Log Feed */}
                <div className="terminal-panel" style={{ flex: '4.5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid rgba(55, 65, 81, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(15, 17, 21, 0.4)'
                    }}>
                        <h3 className="font-terminal" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <History size={16} />
                            FORENSIC RECORD JOURNAL
                        </h3>
                        <span className="font-terminal-muted" style={{ fontSize: '0.8rem' }}>
                            [ RECV FEED: ACTIVE ]
                        </span>
                    </div>

                    <div className="feed-container" style={{ flex: 1 }}>
                        {logs.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                                <Terminal size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                WAITING FOR ANALYTICAL DATA INPUTS...
                            </div>
                        ) : (
                            logs.map((log) => {
                                let itemClass = 'feed-item';
                                if (log.type === 'action') itemClass += ' feed-item-action';
                                if (log.type === 'clue') itemClass += ' feed-item-clue';

                                return (
                                    <div key={log.id} className={itemClass} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.75rem',
                                                color: log.type === 'clue' ? 'var(--accent-success)' : (log.type === 'action' ? 'var(--accent-primary)' : 'var(--text-muted)')
                                            }}>
                                                [{log.timestamp}] {log.type.toUpperCase()}
                                            </span>
                                            {log.type === 'clue' && (
                                                <span className="font-terminal-green" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Sparkles size={10} /> NEW CLUE
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.5,
                                            color: log.type === 'clue' ? 'var(--accent-success)' : (log.type === 'action' ? 'var(--text-primary)' : 'var(--text-secondary)'),
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {log.type === 'action' ? `> ${log.text}` : log.text}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                        <div ref={feedEndRef} />
                    </div>
                </div>

                {/* Right Panel: Investigation Desk controls */}
                <div className="terminal-panel" style={{ flex: '5.5', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
                    
                    {/* Active Room Title */}
                    <div style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.4)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="font-terminal" style={{ fontSize: '0.85rem' }}>
                                ACTIVE SYSTEM MONITOR // SECTOR: {scene.id.toUpperCase()}
                            </span>
                            <span className="font-terminal-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Info size={12} /> SECURE LINK
                            </span>
                        </div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', textShadow: 'var(--shadow-glow)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                            {scene.name}
                        </h2>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(26, 29, 36, 0.4)',
                            border: '1px solid rgba(55, 65, 81, 0.3)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '0.95rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6
                        }}>
                            {scene.description}
                            <span className="terminal-cursor" />
                        </div>
                    </div>

                    {/* Scrollable Interaction Options Deck */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
                        
                        {/* Search Hotspots Pane */}
                        <div>
                            <h4 className="font-terminal" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={14} />
                                SEARCHABLE EVIDENCE HOTSPOTS
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {scene.interactables.map(item => {
                                    const alreadyFound = collectedClues.includes(item.grantsClueId || '');
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleInspectItem(item.id, item.name, item.description, item.grantsClueId)}
                                            className={`terminal-btn ${alreadyFound ? 'terminal-btn-success' : ''}`}
                                        >
                                            <span style={{ color: alreadyFound ? 'var(--accent-success)' : 'var(--accent-primary)', fontWeight: 600 }}>
                                                {alreadyFound ? '[SECURED]' : '[ANALYZE]'}
                                            </span>
                                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                            {alreadyFound && (
                                                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-success)', fontFamily: 'var(--font-mono)' }}>
                                                    FILE RECORDED
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                                {scene.interactables.length === 0 && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', paddingLeft: '0.5rem' }}>
                                        No direct physical clues detected in this sector.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dialogue questioning present characters */}
                        <div>
                            <h4 className="font-terminal" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={14} />
                                PRESENT PERSONS FOR QUESTIONING
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {scene.charactersPresent.map(charId => {
                                    const character = currentStory.characters[charId];
                                    if (!character) return null;
                                    return (
                                        <button
                                            key={charId}
                                            onClick={() => setActiveDialogueId(charId)}
                                            className="terminal-btn"
                                        >
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                                [CONVERSE]
                                            </span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {character.name}
                                            </span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                {character.description}
                                            </span>
                                        </button>
                                    );
                                })}
                                {scene.charactersPresent.length === 0 && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', paddingLeft: '0.5rem' }}>
                                        No personnel identified in this immediate area.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Navigation Travel options */}
                        <div>
                            <h4 className="font-terminal" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Compass size={14} />
                                SECTOR TRAVEL DIRECTIVES
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {scene.connectedScenes.map(targetId => {
                                    const targetScene = currentStory.scenes[targetId];
                                    if (!targetScene) return null;
                                    return (
                                        <button
                                            key={targetId}
                                            onClick={() => handleTravel(targetId, targetScene.name)}
                                            className="terminal-btn"
                                        >
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                                [NAVIGATE]
                                            </span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                Go to {targetScene.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Dialog Tree Modal floating overlay */}
            {activeDialogueId && (
                <DialogueSystem characterId={activeDialogueId} onClose={() => setActiveDialogueId(null)} />
            )}
        </div>
    );
};
