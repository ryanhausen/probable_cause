import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from '@xyflow/react';
import type {
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Story, Scene, Character } from '../../engine/types';
import { SceneEditor } from './SceneEditor';
import { ConversationEditor } from './ConversationEditor';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const StoryEditor: React.FC = () => {
    const [story, setStory] = useState<Story | null>(null);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
    const [editingGlobalCharacterId, setEditingGlobalCharacterId] = useState<string | null>(null);
    const [editingGlobalConversationId, setEditingGlobalConversationId] = useState<string | null>(null);

    const nodesRef = useRef(nodes);
    const storyRef = useRef(story);
    const copiedScenesRef = useRef<Scene[]>([]);

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    useEffect(() => {
        storyRef.current = story;
    }, [story]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input or textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                const selected = nodesRef.current.filter(n => n.selected);
                if (selected.length > 0) {
                    const scenesToCopy = selected.map(n => n.data.scene as Scene).filter(Boolean);
                    copiedScenesRef.current = scenesToCopy;
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                const copiedScenes = copiedScenesRef.current;
                const currentStory = storyRef.current;

                if (copiedScenes.length > 0 && currentStory) {
                    let updatedStory = { ...currentStory };
                    const newNodes: Node[] = [];
                    const ts = Date.now();

                    copiedScenes.forEach((scene, index) => {
                        const newSceneId = `scene-${ts}-${index}-${Math.floor(Math.random() * 1000)}`;
                        const newScene: Scene = {
                            ...JSON.parse(JSON.stringify(scene)),
                            id: newSceneId,
                            name: `${scene.name} (Copy)`,
                            connectedScenes: [] // Don't copy connections for now
                        };

                        updatedStory = {
                            ...updatedStory,
                            scenes: {
                                ...updatedStory.scenes,
                                [newSceneId]: newScene
                            }
                        };

                        const originalNode = nodesRef.current.find(n => (n.data?.scene as Scene)?.id === scene.id);
                        const position = originalNode
                            ? { x: originalNode.position.x + 50, y: originalNode.position.y + 50 }
                            : { x: 100 + index * 50, y: 100 + index * 50 };

                        newNodes.push({
                            id: newSceneId,
                            position,
                            data: { label: newScene.name, scene: newScene },
                            type: 'default',
                            selected: true,
                        });
                    });

                    setStory(updatedStory);
                    setNodes(nds => [
                        ...nds.map(n => ({ ...n, selected: false })),
                        ...newNodes
                    ]);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onNodeDoubleClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            setEditingSceneId(node.id);
        },
        [],
    );

    const handleNewStory = () => {
        const newStoryId = `story-${Date.now()}`;
        const newStory: Story = {
            id: newStoryId,
            title: 'New Story',
            description: '',
            startingSceneId: 'scene-1',
            scenes: {
                'scene-1': {
                    id: 'scene-1',
                    name: 'First Scene',
                    description: 'The beginning.',
                    connectedScenes: [],
                    charactersPresent: [],
                    interactables: []
                }
            },
            characters: {},
            clues: {},
            theories: {}
        };
        setStory(newStory);
        populateGraphFromStory(newStory);
    };

    const handleSaveStory = () => {
        if (!story) return;
        const jsonContent = JSON.stringify(story, null, 4);
        const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonContent);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${story.id}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoadStory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedStory = JSON.parse(content) as Story;

                setStory(parsedStory);
                populateGraphFromStory(parsedStory);
            } catch (err) {
                console.error("Failed to parse story json", err);
                alert("Invalid Story JSON file.\nError: " + (err as Error).message);
            }
        };
        reader.readAsText(file);
    };

    const handleSaveScene = (updatedScene: Scene) => {
        if (!story) return;

        // Update story state
        const updatedStory = {
            ...story,
            scenes: {
                ...story.scenes,
                [updatedScene.id]: updatedScene
            }
        };
        setStory(updatedStory);

        // Update node data
        setNodes(nds => nds.map(node => {
            if (node.id === updatedScene.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: updatedScene.name,
                        scene: updatedScene
                    }
                };
            }
            return node;
        }));

        setEditingSceneId(null);
    };

    const updateGlobalCharacter = (charId: string, field: keyof Character, value: any) => {
        if (!story) return;
        const charToUpdate = story.characters[charId];
        if (!charToUpdate) return;
        
        setStory({
            ...story,
            characters: {
                ...story.characters,
                [charId]: { ...charToUpdate, [field]: value }
            }
        });
    };

    const removeGlobalCharacter = (charId: string) => {
        if (!story) return;
        if (!window.confirm("Are you sure you want to completely remove this character from the story? This will remove them from all scenes.")) return;

        const newStory = { ...story };
        
        // Remove from characters dict
        const newCharacters = { ...newStory.characters };
        delete newCharacters[charId];
        newStory.characters = newCharacters;

        // Remove from all scenes
        const newScenes = { ...newStory.scenes };
        Object.keys(newScenes).forEach(sceneId => {
            const scene = newScenes[sceneId];
            if (scene.charactersPresent && scene.charactersPresent.includes(charId)) {
                newScenes[sceneId] = {
                    ...scene,
                    charactersPresent: scene.charactersPresent.filter(id => id !== charId)
                };
            }
        });
        newStory.scenes = newScenes;

        setStory(newStory);
    };

    const populateGraphFromStory = (s: Story) => {
        const newNodes: Node[] = Object.values(s.scenes).map((scene: Scene, index: number) => ({
            id: scene.id,
            position: { x: 100 + (index * 200), y: 100 },
            data: { label: scene.name, scene },
            type: 'default'
        }));

        const newEdges: Edge[] = [];
        Object.values(s.scenes).forEach((scene: Scene) => {
            scene.connectedScenes.forEach(targetId => {
                newEdges.push({
                    id: `e-${scene.id}-${targetId}`,
                    source: scene.id,
                    target: targetId
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    const loadDefaultStory = async () => {
        try {
            const response = await fetch('/stories/defaultStory.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const defaultStory: Story = await response.json();
            setStory(defaultStory);
            populateGraphFromStory(defaultStory);
        } catch (error) {
            console.error("Failed to load default story:", error);
            alert("Failed to load the default story. Please check the console for details.");
        }
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f3f4f6', color: '#111827' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 16px', boxSizing: 'border-box', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onClick={handleNewStory}>
                        New Story
                    </button>
                    <label style={{ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 16px', boxSizing: 'border-box', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        Load Story
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoadStory} />
                    </label>
                    <button style={{ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 16px', boxSizing: 'border-box', background: story ? '#3b82f6' : '#e5e7eb', color: story ? 'white' : '#9ca3af', border: 'none', borderRadius: '4px', cursor: story ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px', boxShadow: story ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none' }} onClick={handleSaveStory} disabled={!story}>
                        Save Story
                    </button>
                    <button style={{ display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 16px', boxSizing: 'border-box', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onClick={loadDefaultStory}>
                        Load Default Story
                    </button>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDoubleClick={onNodeDoubleClick}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>

                {editingSceneId && story && story.scenes[editingSceneId] && (
                    <SceneEditor
                        story={story}
                        scene={story.scenes[editingSceneId]}
                        onSave={handleSaveScene}
                        onClose={() => setEditingSceneId(null)}
                        onUpdateStory={setStory}
                    />
                )}
            </div>

            <div style={{ width: '300px', background: 'white', borderLeft: '1px solid #e5e7eb', padding: '20px', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Story Info</h2>
                {story ? (
                    <div>
                        <h3 style={{ fontWeight: 'bold', marginTop: '16px' }}>Characters</h3>
                        {Object.values(story.characters || {}).map(char => (
                            <div key={char.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 'bold' }}>{char.name}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setEditingGlobalCharacterId(char.id)} style={{ padding: '4px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Edit</button>
                                        <button onClick={() => removeGlobalCharacter(char.id)} style={{ padding: '4px 8px', color: '#ef4444', background: 'white', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Object.values(story.characters || {}).length === 0 && (
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No characters in story.</p>
                        )}

                        <h3 style={{ fontWeight: 'bold', marginTop: '16px' }}>Theories</h3>
                        {Object.values(story.theories).map(theory => {
                            // Calculate max possible plausibility for this theory
                            let maxPlausibility = theory.basePlausibility;

                            // Iterate through all clues in the story to find modifiers for this theory
                            if (story.clues) {
                                Object.values(story.clues).forEach(clue => {
                                    if (clue.plausibilityModifiers) {
                                        clue.plausibilityModifiers.forEach(modifier => {
                                            if (modifier.theoryId === theory.id && modifier.amount > 0) {
                                                maxPlausibility += modifier.amount;
                                            }
                                        });
                                    }
                                });
                            }

                            return (
                                <div key={theory.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{theory.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Suspect: {theory.suspectName}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Base Plausibility: {theory.basePlausibility}%</div>
                                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Max Plausibility: {Math.min(100, maxPlausibility)}%</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: '#6b7280' }}>No story loaded. Load a story to view info.</p>
                )}
            </div>

            {editingGlobalCharacterId && story && story.characters[editingGlobalCharacterId] && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Character</h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Name</label>
                            <input 
                                type="text" 
                                value={story.characters[editingGlobalCharacterId].name} 
                                onChange={(e) => updateGlobalCharacter(editingGlobalCharacterId, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Description</label>
                            <textarea 
                                value={story.characters[editingGlobalCharacterId].description} 
                                onChange={(e) => updateGlobalCharacter(editingGlobalCharacterId, 'description', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '100px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Scenes Present In</label>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563' }}>
                                {Object.values(story.scenes)
                                    .filter(scene => scene.charactersPresent?.includes(editingGlobalCharacterId))
                                    .map(scene => (
                                        <li key={scene.id}>{scene.name}</li>
                                    ))
                                }
                                {Object.values(story.scenes).filter(scene => scene.charactersPresent?.includes(editingGlobalCharacterId)).length === 0 && (
                                    <li style={{ listStyle: 'none', marginLeft: '-20px' }}>Not present in any scenes.</li>
                                )}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setEditingGlobalConversationId(editingGlobalCharacterId)} style={{ padding: '8px 16px', background: 'white', color: '#111827', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Edit Conversation</button>
                            <button onClick={() => setEditingGlobalCharacterId(null)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {editingGlobalConversationId && story && story.characters[editingGlobalConversationId] && (
                <ConversationEditor
                    story={story}
                    character={story.characters[editingGlobalConversationId]}
                    onSave={() => setEditingGlobalConversationId(null)}
                    onClose={() => setEditingGlobalConversationId(null)}
                    onUpdateStory={setStory}
                />
            )}
        </div>
    );
};
