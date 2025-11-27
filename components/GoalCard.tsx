
import React, { useMemo } from 'react';
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
  
  const availableBalanceConcepts = [
    'Saldo en efectivo',
    'Saldo en Revolut Mama',
    'Saldo en Revolut Javi',
    'Saldo en PayPal Mama',
    'Saldo en PayPal Javi'
  ];

  const totalAvailable = savings
    .filter(entry => availableBalanceConcepts.includes(entry.description))
    .reduce((sum, entry) => sum + entry.amount, 0);

  const goalProgress = goal && goal.target > 0 ? (totalAvailable / goal.target) * 100 : 0;
  
  const { daysRemainingText, todaySavings, dailyProgress } = useMemo(() => {
    if (!goal) {
        return { daysRemainingText: null, todaySavings: 0, dailyProgress: 0 };
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Cálculo actualizado: Suma todos los ahorros del día, sin filtrar por concepto.
    const currentTodaySavings = savings
      .filter(s => s.date === todayStr)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const remainingAmount = goal.target - totalAvailable;

    let daysStr: string | null = null;
    if (remainingAmount > 0 && goal.dailyAmount > 0) {
      const days = Math.ceil(remainingAmount / goal.dailyAmount);
      daysStr = `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
    }

    const currentDailyProgress = goal.dailyAmount > 0 ? (currentTodaySavings / goal.dailyAmount) * 100 : (currentTodaySavings > 0 ? 100 : 0);

    return { 
        daysRemainingText: daysStr, 
        todaySavings: currentTodaySavings, 
        dailyProgress: currentDailyProgress, 
    };
  }, [goal, savings, totalAvailable]);


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
                      <span className="text-3xl font-bold text-primary-dark">{formatCurrency(totalAvailable)}</span>
                      <span className="text-base text-text-secondary">de {formatCurrency(goal.target)}</span>
                  </div>
                  <div className="w-full bg-progress-bar-bg rounded-full h-3.5 mt-2">
                      <div className="bg-gradient-to-r from-primary-light to-primary h-3.5 rounded-full" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-text-secondary mt-1">
                      <span>{goalProgress.toFixed(1)}% completado</span>
                      {daysRemainingText && <span className="font-medium">{daysRemainingText}</span>}
                  </div>
                  
                  {goal.dailyAmount > 0 && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                          <h4 className="text-sm font-medium text-text-secondary mb-1">Progreso Mínimo Diario</h4>
                          <div className="flex justify-between items-baseline">
                              <span className="text-xl font-bold text-secondary-dark">{formatCurrency(todaySavings)}</span>
                              <span className="text-sm text-text-secondary">de {formatCurrency(goal.dailyAmount)}</span>
                          </div>
                          <div className="w-full bg-progress-bar-bg rounded-full h-2.5 mt-2">
                              <div className="bg-gradient-to-r from-secondary to-secondary-dark h-2.5 rounded-full" style={{ width: `${Math.min(dailyProgress, 100)}%` }}></div>
                          </div>
                      </div>
                  )}

                   <button onClick={onSetGoal} className="mt-4 pt-3 border-t border-border text-sm text-primary-light hover:text-primary font-semibold w-full text-left transition-colors">
                        Editar Meta
                    </button>
              </>
          ) : (
              <div className="mt-4 text-center">
                  <p className="text-text-secondary text-sm">
                    No has establecido una meta ➜{" "}
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
