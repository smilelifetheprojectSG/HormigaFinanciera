import React from 'react';
import { SavingEntry, SavingsGoal } from '../types';
import { FlagIcon } from './icons/FlagIcon';

interface GoalCardProps {
  savings: SavingEntry[];
  goal: SavingsGoal | null;
  onSetGoal: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ savings, goal, onSetGoal }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
  }
  
  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  const goalProgress = goal && goal.target > 0 ? (totalSaved / goal.target) * 100 : 0;
  let deadlineText: string | null = null;
  if (goal && goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    deadlineDate.setUTCHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineText = 'Plazo vencido';
    } else if (diffDays === 0) {
      deadlineText = '¡Último día!';
    } else {
      deadlineText = `${diffDays} día${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`;
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-primary-dark mb-4">Mi Meta de Ahorro</h2>
      <div className="bg-surface p-6 rounded-xl shadow-lg">
          <h3 className="text-md font-medium text-text-secondary flex items-center mb-1">
              <FlagIcon className="w-5 h-5 mr-2 text-primary"/>
              Meta de Ahorro
          </h3>
          {goal ? (
              <>
                  <p className="text-lg text-primary-dark font-semibold truncate mb-2" title={goal.description}>{goal.description}</p>
                  <div className="flex justify-between items-baseline">
                      <span className="text-3xl font-bold text-primary-dark">{formatCurrency(totalSaved)}</span>
                      <span className="text-base text-text-secondary">de {formatCurrency(goal.target)}</span>
                  </div>
                  <div className="w-full bg-progress-bar-bg rounded-full h-3.5 mt-2">
                      <div className="bg-gradient-to-r from-primary-light to-primary h-3.5 rounded-full" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-text-secondary mt-1">
                      <span>{goalProgress.toFixed(1)}% completado</span>
                      {deadlineText && <span className="font-medium">{deadlineText}</span>}
                  </div>
                   <button onClick={onSetGoal} className="mt-3 text-sm text-primary-light hover:text-primary font-semibold w-full text-left transition-colors">
                        Editar Meta
                    </button>
              </>
          ) : (
              <div className="mt-4 text-center">
                  <p className="text-text-secondary">
                    No has establecido una meta.{" "}
                    <button onClick={onSetGoal} className="font-semibold text-primary-light hover:text-primary transition-colors focus:outline-none focus:underline">
                      Establecer meta
                    </button>
                  </p>
              </div>
          )}
      </div>
    </div>
  );
};