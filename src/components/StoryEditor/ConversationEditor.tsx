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
import type { Character } from '../../engine/types';

interface ConversationEditorProps {
    character: Character;
    onSave: (updatedCharacter: Character) => void;
    onClose: () => void;
}

export const ConversationEditor: React.FC<ConversationEditorProps> = ({ character, onSave, onClose }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        // Build nodes and edges from character.dialogueNodes
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        let index = 0;

        for (const [nodeId, dialogue] of Object.entries(character.dialogueNodes)) {
            newNodes.push({
                id: nodeId,
                position: { x: 100 + (index * 250), y: 150 },
                data: { label: dialogue.text, dialogueNode: dialogue },
                type: 'default'
            });

            dialogue.options.forEach((opt, optIndex) => {
                if (opt.nextNodeId) {
                    newEdges.push({
                        id: `e-${nodeId}-${opt.nextNodeId}-${optIndex}`,
                        source: nodeId,
                        target: opt.nextNodeId,
                        label: opt.text
                    });
                }
            });
            index++;
        }

        setNodes(newNodes);
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
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Editing Conversation: {character.name}</h3>
                <div>
                    <button onClick={onClose} style={{ padding: '8px 16px', marginRight: '8px', cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px' }}>Cancel</button>
                    <button onClick={() => onSave(character)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close (Auto-saved for now)</button>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};
