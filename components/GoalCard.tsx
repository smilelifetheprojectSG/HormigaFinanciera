
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
    <div className="mt-8">
      <h2 className="text-xl font-bold text-primary-dark mb-4">Mi Meta de Ahorro</h2>
      <div className="bg-surface p-6 rounded-2xl shadow-xl border border-border/50 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

          <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center">
                    <FlagIcon className="w-4 h-4 mr-2"/>
                    Objetivo Principal
                </h3>
                {daysRemainingText && <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">{daysRemainingText}</span>}
              </div>

              {goal ? (
                  <>
                      <p className="text-2xl text-text-primary font-bold truncate mb-3" title={goal.description}>{goal.description}</p>
                      
                      <div className="flex justify-between items-end mb-2">
                          <div>
                              <span className="text-xs text-text-secondary uppercase block mb-1">Has ahorrado</span>
                              <span className="text-3xl font-bold text-primary-dark">{formatCurrency(totalAvailable)}</span>
                          </div>
                          <div className="text-right">
                               <span className="text-xs text-text-secondary uppercase block mb-1">Meta</span>
                              <span className="text-lg font-semibold text-text-secondary">{formatCurrency(goal.target)}</span>
                          </div>
                      </div>

                      <div className="w-full bg-border/50 rounded-full h-4 mb-2 p-0.5 shadow-inner">
                          <div className="bg-gradient-to-r from-primary-light to-primary h-3 rounded-full relative transition-all duration-1000 ease-out shadow-md" style={{ width: `${Math.min(goalProgress, 100)}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-b from-white/20 to-transparent rounded-full"></div>
                          </div>
                      </div>
                      <div className="text-right text-xs font-bold text-primary">{goalProgress.toFixed(1)}% completado</div>
                      
                      {goal.dailyAmount > 0 && (
                          <div className="mt-6 pt-5 border-t border-border/60 animate-fade-in-up">
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium text-text-secondary">Progreso Diario</h4>
                                  <span className="text-sm font-bold text-text-primary">{formatCurrency(todaySavings)} <span className="text-text-secondary font-normal text-xs">/ {formatCurrency(goal.dailyAmount)}</span></span>
                              </div>
                              <div className="w-full bg-border/50 rounded-full h-2.5 overflow-hidden">
                                  <div className={`h-2.5 rounded-full transition-all duration-700 ${dailyProgress >= 100 ? 'bg-green-500' : 'bg-secondary'}`} style={{ width: `${Math.min(dailyProgress, 100)}%` }}></div>
                              </div>
                          </div>
                      )}

                       <button onClick={onSetGoal} className="mt-5 text-sm text-text-secondary hover:text-primary font-semibold w-full text-center transition-colors py-2 rounded-lg hover:bg-subtle-button-bg">
                            Configurar Meta
                        </button>
                  </>
              ) : (
                  <div className="mt-4 text-center py-6">
                      <p className="text-text-secondary text-sm mb-4">No tienes una meta activa.</p>
                      <button onClick={onSetGoal} className="px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-all font-semibold text-sm">
                          Establecer Meta Ahora
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
