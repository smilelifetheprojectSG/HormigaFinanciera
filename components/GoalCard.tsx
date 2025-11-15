import React, { useMemo } from 'react';
import { SavingEntry, SavingsGoal } from '../types';
import { FlagIcon } from './icons/FlagIcon';

interface GoalCardProps {
  savings: SavingEntry[];
  goal: SavingsGoal | null;
  onSetGoal: () => void;
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

export const GoalCard: React.FC<GoalCardProps> = ({ savings, goal, onSetGoal }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
  }
  
  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  const goalProgress = goal && goal.target > 0 ? (totalSaved / goal.target) * 100 : 0;
  
  const { dailyTarget, todaySavings, dailyProgress, deadlineText } = useMemo(() => {
    if (!goal) {
        return { dailyTarget: null, todaySavings: 0, dailyProgress: 0, deadlineText: null };
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const currentTodaySavings = savings
      .filter(s => s.date === todayStr)
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (!goal.deadline) {
        return { dailyTarget: null, todaySavings: currentTodaySavings, dailyProgress: 0, deadlineText: null };
    }

    const remainingDaysForText = getDaysRemaining(goal.deadline) - 1; // For "X days remaining" text
    
    let deadlineStr: string;
    if (remainingDaysForText < 0) deadlineStr = 'Plazo vencido';
    else if (remainingDaysForText === 0) deadlineStr = '¡Hoy es el último día!';
    else deadlineStr = `${remainingDaysForText} día${remainingDaysForText !== 1 ? 's' : ''} restante${remainingDaysForText !== 1 ? 's' : ''}`;
    
    const remainingAmount = goal.target - totalSaved;
    let currentDailyTarget: number | null = null;
    let currentDailyProgress = 0;

    if (remainingAmount > 0) {
      const remainingDaysForCalc = getDaysRemaining(goal.deadline);
      
      if (remainingDaysForCalc > 0) {
        currentDailyTarget = remainingAmount / remainingDaysForCalc;
        currentDailyProgress = currentDailyTarget > 0 ? (currentTodaySavings / currentDailyTarget) * 100 : 0;
      }
    }

    return { 
        dailyTarget: currentDailyTarget, 
        todaySavings: currentTodaySavings, 
        dailyProgress: currentDailyProgress, 
        deadlineText: deadlineStr 
    };
  }, [goal, savings, totalSaved]);


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
                  
                  {dailyTarget !== null && dailyTarget > 0 && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                          <h4 className="text-sm font-medium text-text-secondary mb-1">Progreso Diario Recomendado</h4>
                          <div className="flex justify-between items-baseline">
                              <span className="text-xl font-bold text-secondary-dark">{formatCurrency(todaySavings)}</span>
                              <span className="text-sm text-text-secondary">de {formatCurrency(dailyTarget)}</span>
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