import React, { useState, useRef } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { ConfirmModal } from './ConfirmModal';


interface ConceptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: string[];
  addConcept: (name: string) => void;
  updateConcept: (oldName: string, newName: string) => void;
  deleteConcept: (name: string) => void;
  reorderConcepts: (startIndex: number, endIndex: number) => void;
}

export const ConceptManager: React.FC<ConceptManagerProps> = ({ isOpen, onClose, concepts, addConcept, updateConcept, deleteConcept, reorderConcepts }) => {
  const [newConcept, setNewConcept] = useState('');
  const [editingConcept, setEditingConcept] = useState<{ oldName: string, newName: string } | null>(null);
  const [error, setError] = useState('');
  const [conceptToDelete, setConceptToDelete] = useState<string | null>(null);

  // Drag and Drop state
  const draggedItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);


  if (!isOpen) return null;
  
  const handleAdd = () => {
    try {
      addConcept(newConcept);
      setNewConcept('');
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUpdate = () => {
    if (!editingConcept) return;
    try {
      updateConcept(editingConcept.oldName, editingConcept.newName);
      setEditingConcept(null);
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };
  
  const handleRequestDelete = (name: string) => {
    setConceptToDelete(name);
  };

  const handleConfirmDelete = () => {
    if (conceptToDelete) {
        try {
            deleteConcept(conceptToDelete);
            setError('');
        } catch(e: any) {
            setError(e.message);
        } finally {
            setConceptToDelete(null);
        }
    }
  }

  const startEditing = (name: string) => {
    setEditingConcept({ oldName: name, newName: name });
    setError('');
  };
  
  const cancelEditing = () => {
    setEditingConcept(null);
    setError('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    draggedItemIndex.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
    setDraggedOver(index);
  };
  
  const handleDrop = () => {
    if (draggedItemIndex.current !== null && 
        dragOverItemIndex.current !== null &&
        draggedItemIndex.current !== dragOverItemIndex.current
    ) {
      reorderConcepts(draggedItemIndex.current, dragOverItemIndex.current);
    }
  };

  const handleDragEnd = () => {
    draggedItemIndex.current = null;
    dragOverItemIndex.current = null;
    setDraggedOver(null);
    setDraggedIndex(null);
  };


  // Exclude 'Otro ingreso' from being managed directly in the list
  const managedConcepts = concepts.filter(c => c !== 'Otro ingreso');

  return (
    <>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-scale-in flex flex-col p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-primary-dark mb-4">Gestionar Conceptos</h2>

        {/* Add new concept form */}
        <div className="mb-4">
          <label htmlFor="new-concept" className="block text-sm font-medium text-text-secondary mb-1">Añadir nuevo concepto</label>
          <div className="flex space-x-2">
            <input
              id="new-concept"
              type="text"
              value={newConcept}
              onChange={(e) => { setNewConcept(e.target.value); setError(''); }}
              className="flex-grow px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="Ej. Ingreso extra"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex-shrink-0">
                <PlusIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* List of concepts */}
        <div className="flex-grow overflow-y-auto -mr-3 pr-3">
            <ul onDragOver={e => e.preventDefault()}>
                {managedConcepts.map((concept, index) => (
                <li 
                    key={concept} 
                    className={`p-2 mb-2 bg-background rounded-lg flex items-center justify-between transition-all ${draggedIndex === index ? 'opacity-30' : ''} ${draggedOver === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                >
                    {editingConcept?.oldName === concept ? (
                        <>
                            <input
                                type="text"
                                value={editingConcept.newName}
                                onChange={(e) => setEditingConcept({ ...editingConcept, newName: e.target.value })}
                                className="flex-grow px-2 py-1 border border-primary-light bg-white rounded-md focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            />
                            <div className="flex items-center ml-2">
                                <button onClick={handleUpdate} className="p-2 text-green-500 hover:text-green-700 transition-colors"><CheckIcon className="w-5 h-5"/></button>
                                <button onClick={cancelEditing} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><XMarkIcon className="w-5 h-5"/></button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <Bars3Icon className="w-5 h-5 mr-3 text-gray-400 cursor-grab" />
                                <span className="text-text-primary">{concept}</span>
                            </div>
                            <div className="flex items-center">
                                <button onClick={() => startEditing(concept)} className="p-2 text-gray-400 hover:text-primary transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleRequestDelete(concept)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </>
                    )}
                </li>
                ))}
            </ul>
        </div>
        
        <div className="flex justify-end pt-4 mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark shadow-sm hover:shadow-md transition-all">
              Hecho
            </button>
        </div>
      </div>
    </div>
    <ConfirmModal
        isOpen={!!conceptToDelete}
        onClose={() => setConceptToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar "${conceptToDelete}"? Los ingresos existentes con este concepto se asignarán a "Otro ingreso".`}
      />
    </>
  );
};