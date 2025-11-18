
import React, { useMemo } from 'react';
import { SavingEntry } from '../types';
import { FireIcon } from './icons/FireIcon';

interface TopAppsProps {
  savings: SavingEntry[];
}

const excludedConcepts = new Set([
  'Saldo en efectivo',
  'Saldo en Revolut Mama',
  'Saldo en Revolut Javi',
  'Saldo en PayPal Mama',
  'Saldo en PayPal Javi',
  'Otro ingreso'
]);

export const TopApps: React.FC<TopAppsProps> = ({ savings }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
  };

  const topApps = useMemo(() => {
    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysSinceMonday);
    const startOfWeekStr = getLocalDateString(startOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const endOfWeekStr = getLocalDateString(endOfWeek);

    const thisWeekSavings = savings.filter(s => s.date >= startOfWeekStr && s.date <= endOfWeekStr);

    const appEarnings = new Map<string, number>();

    for (const entry of thisWeekSavings) {
      if (!excludedConcepts.has(entry.description)) {
        const currentEarnings = appEarnings.get(entry.description) || 0;
        appEarnings.set(entry.description, currentEarnings + entry.amount);
      }
    }

    return Array.from(appEarnings.entries())
      .filter(([, earnings]) => earnings > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [savings]);

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-xl font-bold text-primary-dark mb-4">Apps Más Rentables (Esta Semana)</h3>
      <div className="bg-surface p-6 rounded-xl shadow-lg">
        {topApps.length > 0 ? (
          <ul className="space-y-4">
            {topApps.map(([appName, earnings], index) => (
              <li key={appName} className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center min-w-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0 ${index < 3 ? 'bg-amber-100 text-amber-600' : 'bg-subtle-button-bg text-subtle-button-text'}`}>
                    <span className="font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate" title={appName}>{appName}</p>
                    <p className="text-sm text-text-secondary">Ganancias en la última semana</p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(earnings)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <FireIcon className="w-12 h-12 mx-auto text-text-disabled" />
            <p className="mt-4 text-sm text-text-secondary">No hay apps con ganancias en los últimos 7 días.</p>
            <p className="text-sm text-text-secondary mt-1">¡Sigue registrando para ver tus apps más rentables!</p>
          </div>
        )}
      </div>
    </div>
  );
};
