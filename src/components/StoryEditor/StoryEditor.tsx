import React, { useCallback, useState } from 'react';
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
import type { Story, Scene } from '../../engine/types';
import { defaultStory } from '../../stories/defaultStory';
import { SceneEditor } from './SceneEditor';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const StoryEditor: React.FC = () => {
    const [story, setStory] = useState<Story | null>(null);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

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
        const tsContent = `import type { Story } from '../engine/types';\n\nexport const story: Story = ${JSON.stringify(story, null, 4)};\n`;
        const dataStr = "data:text/typescript;charset=utf-8," + encodeURIComponent(tsContent);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${story.id}.ts`);
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

                // 1. Strip import statements
                let sanitizedContent = content.replace(/import\s+.*?;?\n/g, '');

                // 2. We need to handle references to missing imported variables like `museumLobbyImage`.
                // A reliable way for this simple tool is to convert the object literal back to JSON.
                // However, since it's TS, we can execute it if we define proxies for those missing variables,
                // OR we can just use a regex to replace known image references or wrap them in quotes.
                // For a robust generic solution, we create a function that defines common missing variables
                // as strings, so they evaluation doesn't throw a ReferenceError.

                // Extract all variable names from import statements to mock them
                const importMatches = [...content.matchAll(/import\s+(\w+)\s+from\s+[^;\n]+;?/g)];
                const mockVars = importMatches.map(m => `const ${m[1]} = "imported-image-placeholder";`).join('\n');

                const codeToEval = `
                    ${mockVars}
                    ${sanitizedContent.replace(/export\s+const\s+\w+\s*(?::\s*[A-Za-z0-9_]+)?\s*=\s*/, 'return ')}
                `;

                const getStory = new Function(codeToEval);
                const parsedStory = getStory() as Story;

                setStory(parsedStory);
                populateGraphFromStory(parsedStory);
            } catch (err) {
                console.error("Failed to parse story ts", err);
                alert("Invalid Story TS file. Ensure it exports a simple JS object.\nError: " + (err as Error).message);
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

    const loadDefaultStory = () => {
        setStory(defaultStory);
        populateGraphFromStory(defaultStory);
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f3f4f6', color: '#111827' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }} onClick={handleNewStory}>
                        New Story
                    </button>
                    <label style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', margin: 0 }}>
                        Load Story
                        <input type="file" accept=".ts" style={{ display: 'none' }} onChange={handleLoadStory} />
                    </label>
                    <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSaveStory} disabled={!story}>
                        Save Story
                    </button>
                    <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }} onClick={loadDefaultStory}>
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
                    />
                )}
            </div>

            <div style={{ width: '300px', background: 'white', borderLeft: '1px solid #e5e7eb', padding: '20px', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Story Info</h2>
                {story ? (
                    <div>
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
        </div>
    );
};
