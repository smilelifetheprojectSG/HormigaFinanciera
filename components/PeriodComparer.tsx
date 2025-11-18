
import React, { useMemo } from 'react';
import { SavingEntry } from '../types';

interface PeriodComparerProps {
  savings: SavingEntry[];
}

const ComparisonBlock: React.FC<{
    title: string;
    currentValue: number;
    previousTitle: string;
    previousValue: number;
    difference: number;
    percentageDifference: string;
}> = ({ title, currentValue, previousTitle, previousValue, difference, percentageDifference }) => {
    
    const formatCurrency = (value: number, withSign: boolean = false) => {
        const sign = withSign && value > 0 ? '+' : '';
        return sign + new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
    };

    const getDiffColor = (value: number) => {
        if (value > 0) return 'text-green-600 dark:text-green-400';
        if (value < 0) return 'text-red-600 dark:text-red-400';
        return 'text-text-primary';
    };

    return (
        <div className="bg-background p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">{title}</span>
                <span className="text-lg font-bold text-text-primary">{formatCurrency(currentValue)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">{previousTitle}</span>
                <span className="text-lg font-bold text-text-primary">{formatCurrency(previousValue)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                <span className="text-sm font-medium text-text-secondary">Diferencia</span>
                <div className="text-right">
                    <span className={`text-lg font-bold ${getDiffColor(difference)}`}>{formatCurrency(difference, true)}</span>
                    <span className={`text-xs ml-1 ${getDiffColor(difference)}`}>({percentageDifference})</span>
                </div>
            </div>
        </div>
    )
}

export const PeriodComparer: React.FC<PeriodComparerProps> = ({ savings }) => {

  const { 
    thisMonthSavings, previousMonthSavings, difference, percentageDifference, 
    thisWeekSavings, lastWeekSavings, weekDifference, weekPercentageDifference 
  } = useMemo(() => {
    const now = new Date();
    
    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculatePercentageDiff = (current: number, previous: number) => {
        if (previous !== 0) {
            const percentage = ((current - previous) / Math.abs(previous)) * 100;
            return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
        }
        if (current > 0) return '+∞%';
        if (current < 0) return '-∞%';
        return '0.0%';
    }

    // --- Weekly Calculations (Corrected for Mon-Sun week) ---
    const dayOfWeek = now.getDay(); // Sun=0, Mon=1
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfWeekStr = getLocalDateString(startOfWeek);
    const endOfWeekStr = getLocalDateString(endOfWeek);
    
    const thisWeekSavings = savings
        .filter(s => s.date >= startOfWeekStr && s.date <= endOfWeekStr)
        .reduce((sum, entry) => sum + entry.amount, 0);

    // Last Week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(startOfWeek.getDate() - 1);

    const startOfLastWeekStr = getLocalDateString(startOfLastWeek);
    const endOfLastWeekStr = getLocalDateString(endOfLastWeek);

    const lastWeekSavings = savings
        .filter(s => s.date >= startOfLastWeekStr && s.date <= endOfLastWeekStr)
        .reduce((sum, entry) => sum + entry.amount, 0);

    const weekDifference = thisWeekSavings - lastWeekSavings;
    const weekPercentageDifference = calculatePercentageDiff(thisWeekSavings, lastWeekSavings);

    // --- Monthly Calculations ---
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const previousMonthYear = lastMonthDate.getFullYear();
    const previousMonth = lastMonthDate.getMonth();

    const thisMonthSavings = savings
      .filter(s => {
        const [year, month] = s.date.split('-').map(Number);
        return year === currentYear && (month - 1) === currentMonth;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    const previousMonthSavings = savings
      .filter(s => {
        const [year, month] = s.date.split('-').map(Number);
        return year === previousMonthYear && (month - 1) === previousMonth;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    const difference = thisMonthSavings - previousMonthSavings;
    const percentageDifference = calculatePercentageDiff(thisMonthSavings, previousMonthSavings);

    return { thisMonthSavings, previousMonthSavings, difference, percentageDifference, thisWeekSavings, lastWeekSavings, weekDifference, weekPercentageDifference };
  }, [savings]);

  return (
    <div>
      <h3 className="text-xl font-bold text-primary-dark mb-4">Comparador de Períodos</h3>
      <div className="bg-surface p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComparisonBlock
                title="Esta semana"
                currentValue={thisWeekSavings}
                previousTitle="Semana anterior"
                previousValue={lastWeekSavings}
                difference={weekDifference}
                percentageDifference={weekPercentageDifference}
            />
            <ComparisonBlock
                title="Este mes"
                currentValue={thisMonthSavings}
                previousTitle="Mes anterior"
                previousValue={previousMonthSavings}
                difference={difference}
                percentageDifference={percentageDifference}
            />
          </div>
      </div>
    </div>
  );
};
