import React, { useCallback, useState, useEffect } from 'react';
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
import type { Character, DialogueNode, DialogueOption, Story, Clue, Theory } from '../../engine/types';

interface OptionEditorProps {
    opt: DialogueOption;
    optIndex: number;
    story: Story;
    character: Character;
    selectedNodeId: string;
    onUpdateStory: (story: Story) => void;
    deleteOption: (optIndex: number) => void;
    updateOption: (optIndex: number, field: keyof DialogueOption, value: any) => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({ opt, optIndex, story, character, selectedNodeId, onUpdateStory, deleteOption, updateOption }) => {
    const [theoryId, setTheoryId] = useState('');
    const [amount, setAmount] = useState(10);

    const clue = opt.grantsClueId ? story.clues[opt.grantsClueId] : null;
    const modifiers = clue ? clue.plausibilityModifiers : [];

    const addModifier = () => {
        if (!theoryId) return;
        
        let targetClueId = opt.grantsClueId;
        let newStory = { ...story };

        if (!targetClueId) {
            targetClueId = `clue-auto-${Date.now()}`;
            newStory.clues = {
                ...newStory.clues,
                [targetClueId]: {
                    id: targetClueId,
                    name: 'Dialogue Clue',
                    description: 'A clue discovered through conversation.',
                    plausibilityModifiers: []
                }
            };
            
            const node = character.dialogueNodes[selectedNodeId];
            const newOptions = [...node.options];
            newOptions[optIndex] = { ...newOptions[optIndex], grantsClueId: targetClueId };
            newStory.characters = {
                ...newStory.characters,
                [character.id]: {
                    ...character,
                    dialogueNodes: {
                        ...character.dialogueNodes,
                        [selectedNodeId]: { ...node, options: newOptions }
                    }
                }
            };
        }

        const targetClue = newStory.clues[targetClueId!];
        newStory.clues[targetClueId!] = {
            ...targetClue,
            plausibilityModifiers: [...targetClue.plausibilityModifiers, { theoryId, amount }]
        };

        onUpdateStory(newStory);
        setTheoryId('');
    };

    const removeModifier = (modIndex: number) => {
        if (!opt.grantsClueId) return;
        const targetClue = story.clues[opt.grantsClueId];
        if (!targetClue) return;

        const newModifiers = [...targetClue.plausibilityModifiers];
        newModifiers.splice(modIndex, 1);

        onUpdateStory({
            ...story,
            clues: {
                ...story.clues,
                [opt.grantsClueId]: {
                    ...targetClue,
                    plausibilityModifiers: newModifiers
                }
            }
        });
    };

    return (
        <div style={{ border: '1px solid #d1d5db', padding: '10px', marginBottom: '10px', borderRadius: '4px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Option Text</label>
                <button onClick={() => deleteOption(optIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>Remove Option</button>
            </div>
            <input 
                value={opt.text} 
                onChange={(e) => updateOption(optIndex, 'text', e.target.value)} 
                style={{ width: '100%', padding: '4px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            />
            
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Next Node (empty to end convo)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select 
                    value={opt.nextNodeId || ''} 
                    onChange={(e) => updateOption(optIndex, 'nextNodeId', e.target.value || undefined)}
                    style={{ flex: 1, padding: '4px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                    <option value="">-- Ends Conversation --</option>
                    {Object.entries(character.dialogueNodes).map(([id, node]) => (
                        <option key={id} value={id}>
                            {node.text ? (node.text.length > 40 ? node.text.substring(0, 40) + '...' : node.text) : id}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={() => {
                        const newNodeId = `node-${Date.now()}`;
                        const newNode: DialogueNode = {
                            id: newNodeId,
                            text: 'New Dialogue',
                            options: []
                        };
                        
                        const node = character.dialogueNodes[selectedNodeId];
                        const newOptions = [...node.options];
                        newOptions[optIndex] = { ...newOptions[optIndex], nextNodeId: newNodeId };

                        onUpdateStory({
                            ...story,
                            characters: {
                                ...story.characters,
                                [character.id]: {
                                    ...character,
                                    dialogueNodes: {
                                        ...character.dialogueNodes,
                                        [selectedNodeId]: { ...node, options: newOptions },
                                        [newNodeId]: newNode
                                    }
                                }
                            }
                        });
                    }}
                    style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                >
                    + New Node
                </button>
            </div>

            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>Plausibility Modifiers</h5>
                {modifiers.map((mod, modIdx) => {
                    const theory = story.theories[mod.theoryId];
                    return (
                        <div key={modIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                            <span>{theory ? theory.name : 'Unknown'}: {mod.amount > 0 ? '+' : ''}{mod.amount}%</span>
                            <button onClick={() => removeModifier(modIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
                        </div>
                    )
                })}
                
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <select value={theoryId} onChange={e => setTheoryId(e.target.value)} style={{ flex: 1, padding: '2px', fontSize: '0.75rem' }}>
                        <option value="">Select Theory</option>
                        {Object.values(story.theories).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ width: '50px', padding: '2px', fontSize: '0.75rem' }} />
                    <button onClick={addModifier} disabled={!theoryId} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: theoryId ? 'pointer' : 'not-allowed' }}>Add</button>
                </div>
            </div>
        </div>
    );
};

interface ConversationEditorProps {
    story: Story;
    character: Character;
    onSave: (updatedCharacter: Character) => void;
    onClose: () => void;
    onUpdateStory: (updatedStory: Story) => void;
}

export const ConversationEditor: React.FC<ConversationEditorProps> = ({ story, character, onSave, onClose, onUpdateStory }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Theory addition state
    const [isCreatingTheory, setIsCreatingTheory] = useState(false);
    const [newTheoryName, setNewTheoryName] = useState('');
    const [newTheorySuspect, setNewTheorySuspect] = useState('');
    const [newTheoryDesc, setNewTheoryDesc] = useState('');

    useEffect(() => {
        // Build nodes and edges from character.dialogueNodes
        setNodes((prevNodes) => {
            const newNodes: Node[] = [];
            let index = 0;

            for (const [nodeId, dialogue] of Object.entries(character.dialogueNodes)) {
                const existingNode = prevNodes.find(n => n.id === nodeId);
                newNodes.push({
                    id: nodeId,
                    position: dialogue.position ? dialogue.position : (existingNode ? existingNode.position : { x: 100 + (index * 250), y: 150 }),
                    data: { label: dialogue.text.substring(0, 30) + '...', dialogueNode: dialogue },
                    type: 'default'
                });
                index++;
            }
            return newNodes;
        });

        const newEdges: Edge[] = [];
        for (const [nodeId, dialogue] of Object.entries(character.dialogueNodes)) {
            dialogue.options.forEach((opt, optIndex) => {
                if (opt.nextNodeId) {
                    newEdges.push({
                        id: `e-${nodeId}-${opt.nextNodeId}-${optIndex}`,
                        source: nodeId,
                        target: opt.nextNodeId,
                        label: opt.text.substring(0, 15) + '...'
                    });
                }
            });
        }
        setEdges(newEdges);
    }, [character]);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => {
            const { source, target } = params;
            if (!source || !target) return;
            
            const sourceNode = character.dialogueNodes[source];
            if (!sourceNode) return;
            
            const emptyOptionIndex = sourceNode.options.findIndex(o => !o.nextNodeId);
            let newOptions = [...sourceNode.options];
            if (emptyOptionIndex >= 0) {
                newOptions[emptyOptionIndex] = { ...newOptions[emptyOptionIndex], nextNodeId: target };
            } else {
                newOptions.push({ text: 'Continue', nextNodeId: target });
            }
            
            const updatedCharacter = {
                ...character,
                dialogueNodes: {
                    ...character.dialogueNodes,
                    [source]: {
                        ...sourceNode,
                        options: newOptions
                    }
                }
            };
            
            onUpdateStory({
                ...story,
                characters: {
                    ...story.characters,
                    [character.id]: updatedCharacter
                }
            });
        },
        [character, story, onUpdateStory],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        const dialogueNode = character.dialogueNodes[node.id];
        if (dialogueNode) {
            onUpdateStory({
                ...story,
                characters: {
                    ...story.characters,
                    [character.id]: {
                        ...character,
                        dialogueNodes: {
                            ...character.dialogueNodes,
                            [node.id]: {
                                ...dialogueNode,
                                position: node.position
                            }
                        }
                    }
                }
            });
        }
    }, [character, story, onUpdateStory]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleUpdateCharacter = (updatedCharacter: Character) => {
        // This instantly updates the global story, causing a re-render.
        onUpdateStory({
            ...story,
            characters: {
                ...story.characters,
                [character.id]: updatedCharacter
            }
        });
    };

    const addNode = () => {
        const newNodeId = `node-${Date.now()}`;
        const newNode: DialogueNode = {
            id: newNodeId,
            text: 'New Dialogue',
            options: []
        };
        handleUpdateCharacter({
            ...character,
            dialogueNodes: {
                ...character.dialogueNodes,
                [newNodeId]: newNode
            }
        });
        setSelectedNodeId(newNodeId);
    };

    const deleteNode = (nodeId: string) => {
        const newNodes = { ...character.dialogueNodes };
        delete newNodes[nodeId];
        handleUpdateCharacter({
            ...character,
            dialogueNodes: newNodes
        });
        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
        }
    };

    const updateSelectedNodeText = (text: string) => {
        if (!selectedNodeId) return;
        handleUpdateCharacter({
            ...character,
            dialogueNodes: {
                ...character.dialogueNodes,
                [selectedNodeId]: {
                    ...character.dialogueNodes[selectedNodeId],
                    text
                }
            }
        });
    };

    const addOption = () => {
        if (!selectedNodeId) return;
        const node = character.dialogueNodes[selectedNodeId];
        handleUpdateCharacter({
            ...character,
            dialogueNodes: {
                ...character.dialogueNodes,
                [selectedNodeId]: {
                    ...node,
                    options: [...node.options, { text: 'New Option' }]
                }
            }
        });
    };

    const deleteOption = (optIndex: number) => {
        if (!selectedNodeId) return;
        const node = character.dialogueNodes[selectedNodeId];
        const newOptions = [...node.options];
        newOptions.splice(optIndex, 1);
        handleUpdateCharacter({
            ...character,
            dialogueNodes: {
                ...character.dialogueNodes,
                [selectedNodeId]: {
                    ...node,
                    options: newOptions
                }
            }
        });
    };

    const updateOption = (optIndex: number, field: keyof DialogueOption, value: any) => {
        if (!selectedNodeId) return;
        const node = character.dialogueNodes[selectedNodeId];
        const newOptions = [...node.options];
        newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
        handleUpdateCharacter({
            ...character,
            dialogueNodes: {
                ...character.dialogueNodes,
                [selectedNodeId]: {
                    ...node,
                    options: newOptions
                }
            }
        });
    };

    const handleCreateTheory = () => {
        if (!newTheoryName || !newTheorySuspect) return;
        const theoryId = `theory-${Date.now()}`;
        const newTheory: Theory = {
            id: theoryId,
            name: newTheoryName,
            description: newTheoryDesc,
            suspectName: newTheorySuspect,
            basePlausibility: 0
        };
        onUpdateStory({
            ...story,
            theories: {
                ...story.theories,
                [theoryId]: newTheory
            }
        });
        setIsCreatingTheory(false);
        setNewTheoryName('');
        setNewTheorySuspect('');
        setNewTheoryDesc('');
    };



    const selectedDialogueNode = selectedNodeId ? character.dialogueNodes[selectedNodeId] : null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Editing Conversation: {character.name}</h3>
                    <button onClick={addNode} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Node</button>
                    <button onClick={() => setIsCreatingTheory(true)} style={{ padding: '6px 12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Create Theory</button>
                </div>
                <div>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Close Editor</button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onNodeDragStop={onNodeDragStop}
                        onPaneClick={onPaneClick}
                        fitView
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>

                <div style={{ width: '400px', borderLeft: '1px solid #e5e7eb', background: '#f9fafb', padding: '20px', overflowY: 'auto' }}>
                    {selectedDialogueNode ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>Node: {selectedNodeId}</h4>
                                <button onClick={() => deleteNode(selectedNodeId!)} style={{ color: '#ef4444', background: 'white', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete Node</button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Dialogue Text</label>
                                <textarea 
                                    value={selectedDialogueNode.text} 
                                    onChange={(e) => updateSelectedNodeText(e.target.value)}
                                    style={{ width: '100%', minHeight: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, fontWeight: 'bold' }}>Options</h4>
                                <button onClick={addOption} style={{ padding: '4px 8px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>+ Add Option</button>
                            </div>

                            {selectedDialogueNode.options.map((opt, i) => (
                                <OptionEditor 
                                    key={i} 
                                    opt={opt} 
                                    optIndex={i} 
                                    story={story} 
                                    character={character} 
                                    selectedNodeId={selectedNodeId!} 
                                    onUpdateStory={onUpdateStory} 
                                    deleteOption={deleteOption} 
                                    updateOption={updateOption} 
                                />
                            ))}
                            {selectedDialogueNode.options.length === 0 && (
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No options. Conversation ends here.</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#6b7280', textAlign: 'center', marginTop: '40px' }}>
                            <p>Select a node on the canvas to edit it.</p>
                        </div>
                    )}
                </div>
            </div>

            {isCreatingTheory && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create New Theory</h3>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Theory Name</label>
                            <input value={newTheoryName} onChange={e => setNewTheoryName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Suspect Name</label>
                            <input value={newTheorySuspect} onChange={e => setNewTheorySuspect(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Description</label>
                            <textarea value={newTheoryDesc} onChange={e => setNewTheoryDesc(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setIsCreatingTheory(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleCreateTheory} disabled={!newTheoryName || !newTheorySuspect} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: (!newTheoryName || !newTheorySuspect) ? 'not-allowed' : 'pointer' }}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
