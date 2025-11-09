import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const defaultConcepts = ['Saldo en efectivo', 'Saldo en Revolut Mama', 'Saldo en Revolut Javi', 'Saldo en PayPal Mama', 'Saldo en PayPal Javi', 'Otro ingreso'];

export const useConceptManager = () => {
  const [concepts, setConcepts] = useLocalStorage<string[]>('appConcepts', defaultConcepts);

  const addConcept = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("El nombre no puede estar vacío.");
    }
    if (concepts.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
        throw new Error("Este concepto ya existe.");
    }
    // 'Otro ingreso' should always be last
    const otherIndex = concepts.indexOf('Otro ingreso');
    if (otherIndex !== -1) {
        const newConcepts = [...concepts];
        newConcepts.splice(otherIndex, 0, trimmedName);
        setConcepts(newConcepts);
    } else {
        setConcepts(prev => [...prev, trimmedName]);
    }
  }, [concepts, setConcepts]);

  const updateConcept = useCallback((oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) {
      throw new Error("El nombre no puede estar vacío.");
    }
    if (oldName === 'Otro ingreso' || newName === 'Otro ingreso') {
      throw new Error("No se puede renombrar o usar el nombre 'Otro ingreso'.");
    }
    if (oldName.toLowerCase() !== trimmedNewName.toLowerCase() && concepts.some(c => c.toLowerCase() === trimmedNewName.toLowerCase())) {
      throw new Error("Este concepto ya existe.");
    }
    setConcepts(prev => prev.map(c => (c === oldName ? trimmedNewName : c)));
  }, [concepts, setConcepts]);

  const deleteConcept = useCallback((name: string) => {
    if (name === 'Otro ingreso') {
        throw new Error("No se puede eliminar el concepto 'Otro ingreso'.");
    }
    setConcepts(prev => prev.filter(c => c !== name));
  }, [setConcepts]);

  const reorderConcepts = useCallback((startIndex: number, endIndex: number) => {
    setConcepts(prev => {
        const newConcepts = [...prev];
        const [removed] = newConcepts.splice(startIndex, 1);
        newConcepts.splice(endIndex, 0, removed);
        return newConcepts;
    });
  }, [setConcepts]);

  return { concepts, addConcept, updateConcept, deleteConcept, reorderConcepts };
};
