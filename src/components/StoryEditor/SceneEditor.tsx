import React, { useState } from 'react';
import type { Scene, Interactable, Story, Character } from '../../engine/types';
import { ConversationEditor } from './ConversationEditor';

interface SceneEditorProps {
    story: Story;
    scene: Scene;
    onSave: (updatedScene: Scene) => void;
    onClose: () => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({ story, scene, onSave, onClose }) => {
    const [name, setName] = useState(scene.name);
    const [description, setDescription] = useState(scene.description);
    const [imageUrl, setImageUrl] = useState(scene.imageUrl || '');
    const [interactables, setInteractables] = useState<Interactable[]>(scene.interactables || []);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

    const handleSave = () => {
        onSave({
            ...scene,
            name,
            description,
            imageUrl: imageUrl || undefined,
            interactables
        });
    };

    const addInteractable = () => {
        const newInteractable: Interactable = {
            id: `int-${Date.now()}`,
            name: 'New Interactable',
            description: '',
            x: 50,
            y: 50
        };
        setInteractables([...interactables, newInteractable]);
    };

    const updateInteractable = (index: number, field: keyof Interactable, value: any) => {
        const updated = [...interactables];
        updated[index] = { ...updated[index], [field]: value };
        setInteractables(updated);
    };

    const handleSaveConversation = () => {
        // Since characters are references, state updates in the story object happen mostly inline for simplicity in this demo.
        setEditingCharacter(null);
    };

    return (
        <div style={{
            position: 'absolute',
            top: '5%',
            left: '20%',
            width: '60%',
            maxHeight: '90%',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Scene: {scene.id}</h3>
                <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: editingCharacter ? 'none' : 'block' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Image URL</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} placeholder="/assets/image.svg" />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '100px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Characters Present</h4>
                    {scene.charactersPresent.map(charId => {
                        const char = story.characters[charId];
                        if (!char) return <div key={charId}>Unknown Character: {charId}</div>;
                        return (
                            <div key={charId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{char.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{char.description}</div>
                                </div>
                                <button onClick={() => setEditingCharacter(char)} style={{ padding: '4px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Edit Conversation</button>
                            </div>
                        );
                    })}
                    {scene.charactersPresent.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No characters present.</p>}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        Interactables
                        <button onClick={addInteractable} style={{ padding: '4px 8px', fontSize: '0.875rem', cursor: 'pointer', background: '#e5e7eb', border: 'none', borderRadius: '4px' }}>+ Add</button>
                    </h4>
                    {interactables.map((int, idx) => (
                        <div key={int.id} style={{ border: '1px solid #e5e7eb', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                            <input type="text" value={int.name} onChange={(e) => updateInteractable(idx, 'name', e.target.value)} style={{ width: '100%', padding: '4px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} placeholder="Name" />
                            <textarea value={int.description} onChange={(e) => updateInteractable(idx, 'description', e.target.value)} style={{ width: '100%', padding: '4px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} placeholder="Description" />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="number" placeholder="X %" value={int.x} onChange={(e) => updateInteractable(idx, 'x', Number(e.target.value))} style={{ width: '80px', padding: '4px' }} />
                                <input type="number" placeholder="Y %" value={int.y} onChange={(e) => updateInteractable(idx, 'y', Number(e.target.value))} style={{ width: '80px', padding: '4px' }} />
                                <input type="text" placeholder="Grants Clue ID" value={int.grantsClueId || ''} onChange={(e) => updateInteractable(idx, 'grantsClueId', e.target.value)} style={{ flex: 1, padding: '4px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!editingCharacter && (
                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f9fafb' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
                </div>
            )}

            {editingCharacter && (
                <div style={{ flex: 1, position: 'relative' }}>
                    <ConversationEditor character={editingCharacter} onSave={handleSaveConversation} onClose={() => setEditingCharacter(null)} />
                </div>
            )}
        </div>
    );
};
