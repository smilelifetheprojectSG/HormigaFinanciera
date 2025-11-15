import React, { useState, useEffect, useMemo } from 'react';
import { SavingsGoal } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface GoalSetterProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'target'> & { target: number }) => void;
  onDelete: () => void;
  currentGoal?: SavingsGoal | null;
  totalSaved: number;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ isOpen, onClose, onSave, onDelete, currentGoal, totalSaved }) => {
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [dailyAmount, setDailyAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (currentGoal) {
          setTarget(currentGoal.target.toString());
          setDescription(currentGoal.description);
          setDailyAmount(currentGoal.dailyAmount.toString());
        } else {
          setTarget('');
          setDescription('');
          setDailyAmount('');
        }
        setError('');
    }
  }, [currentGoal, isOpen]);
  
  const estimatedDeadline = useMemo(() => {
    const numericTarget = parseFloat(target);
    const numericDailyAmount = parseFloat(dailyAmount);
    if (isNaN(numericTarget) || numericTarget <= 0 || isNaN(numericDailyAmount) || numericDailyAmount <= 0) {
      return null;
    }
    const remainingAmount = numericTarget - Math.max(0, totalSaved);
    if (remainingAmount <= 0) return "¡Ya has alcanzado la meta!";

    const daysNeeded = Math.ceil(remainingAmount / numericDailyAmount);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysNeeded);
    
    return deadline.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
  }, [target, dailyAmount, totalSaved]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = parseFloat(target);
    const numericDailyAmount = parseFloat(dailyAmount);

    if (!description.trim()) {
        setError('La descripción es obligatoria.');
        return;
    }
    if (isNaN(numericTarget) || numericTarget <= 0) {
      setError('El monto objetivo debe ser un número positivo.');
      return;
    }
    if (isNaN(numericDailyAmount) || numericDailyAmount <= 0) {
      setError('La cantidad mínima diaria debe ser un número positivo.');
      return;
    }
    
    setError('');
    onSave({ 
        target: numericTarget, 
        description: description.trim(),
        dailyAmount: numericDailyAmount
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
            <label htmlFor="dailyAmount" className="block text-sm font-medium text-text-secondary mb-1">Cantidad Mínima Diaria (€)</label>
            <input
              id="dailyAmount"
              type="number"
              step="0.01"
              value={dailyAmount}
              onChange={(e) => setDailyAmount(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
              placeholder="Ej. 10.00"
            />
          </div>

          {estimatedDeadline && (
            <div className="my-4 p-3 bg-subtle-button-bg rounded-lg text-center animate-fade-in-up">
              <p className="text-sm text-subtle-button-text">
                Fecha de finalización estimada:
                <span className="block font-bold text-lg text-primary-dark mt-1">
                  {estimatedDeadline}
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