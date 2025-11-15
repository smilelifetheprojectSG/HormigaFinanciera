import React, { useState, useEffect, useMemo } from 'react';
import { SavingsGoal } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface GoalSetterProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  onDelete: () => void;
  currentGoal?: SavingsGoal | null;
  totalSaved: number;
}

// Helper function for robust date calculation
const getDaysRemaining = (deadline: string): number => {
    // Parse deadline string to UTC date at midnight
    const [year, month, day] = deadline.split('-').map(Number);
    const deadlineUTC = new Date(Date.UTC(year, month - 1, day));

    // Get today's date as UTC at midnight
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    if (deadlineUTC < todayUTC) return 0;

    // Calculate day number since epoch for both dates
    const msPerDay = 1000 * 60 * 60 * 24;
    const deadlineDayNum = Math.floor(deadlineUTC.getTime() / msPerDay);
    const todayDayNum = Math.floor(todayUTC.getTime() / msPerDay);

    // Add 1 for an inclusive count
    return deadlineDayNum - todayDayNum + 1;
};


export const GoalSetter: React.FC<GoalSetterProps> = ({ isOpen, onClose, onSave, onDelete, currentGoal, totalSaved }) => {
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (currentGoal) {
          setTarget(currentGoal.target.toString());
          setDescription(currentGoal.description);
          setDeadline(currentGoal.deadline ? new Date(currentGoal.deadline).toISOString().split('T')[0] : '');
        } else {
          setTarget('');
          setDescription('');
          setDeadline('');
        }
        setError('');
    }
  }, [currentGoal, isOpen]);
  
  const dailyTarget = useMemo(() => {
    const numericTarget = parseFloat(target);
    if (!deadline || isNaN(numericTarget) || numericTarget <= 0) {
      return null;
    }

    const remainingAmount = numericTarget - totalSaved;
    if (remainingAmount <= 0) return null;

    const remainingDays = getDaysRemaining(deadline);

    if (remainingDays <= 0) return null;

    return remainingAmount / remainingDays;
  }, [target, deadline, totalSaved]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = parseFloat(target);

    if (!description.trim()) {
        setError('La descripción es obligatoria.');
        return;
    }
    if (isNaN(numericTarget) || numericTarget <= 0) {
      setError('La meta debe ser un número positivo.');
      return;
    }
    
    setError('');
    onSave({ 
        target: numericTarget, 
        description: description.trim(),
        deadline: deadline || undefined 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-primary-dark mb-6">{currentGoal ? 'Editar Meta' : 'Establecer Meta de Ahorro'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Descripción de la Meta</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
              placeholder="Ej. Viaje a Japón"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="target" className="block text-sm font-medium text-text-secondary mb-1">Monto Objetivo (€)</label>
            <input
              id="target"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
              placeholder="Ej. 5000.00"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary mb-1">Fecha Límite (Opcional)</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
            />
          </div>

          {dailyTarget !== null && (
            <div className="my-4 p-3 bg-subtle-button-bg rounded-lg text-center animate-fade-in-up">
              <p className="text-sm text-subtle-button-text">
                Ingreso mínimo diario recomendado:
                <span className="block font-bold text-lg text-primary-dark mt-1">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(dailyTarget)}
                </span>
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-between items-center pt-2">
             <div>
                {currentGoal && (
                    <button type="button" onClick={onDelete} className="px-4 py-2 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                        Eliminar Meta
                    </button>
                )}
             </div>
             <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-subtle-button-bg text-subtle-button-text font-medium rounded-lg hover:bg-subtle-button-hover-bg transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark shadow-sm hover:shadow-md transition-all">
                  Guardar Meta
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};