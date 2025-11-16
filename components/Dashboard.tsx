
import React from 'react';
import { SavingEntry } from '../types';

interface DashboardProps {
  savings: SavingEntry[];
}

// Tarjeta compacta para métricas secundarias
const MiniStatCard: React.FC<{ title: string; value: string; icon?: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-surface p-4 rounded-xl shadow-lg text-center flex flex-col items-center justify-center h-full">
        {icon}
        <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</h4>
        <p className="text-2xl font-semibold text-primary-dark mt-1">{value}</p>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ savings }) => {
  // --- Cálculos de Métricas ---

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
  }

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayStr = getLocalDateString(today);

  // 1. Total Ahorrado (General)
  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  // 2. Total Disponible (suma de saldos específicos)
  const availableBalanceConcepts = [
    'Saldo en efectivo',
    'Saldo en Revolut Mama',
    'Saldo en Revolut Javi',
    'Saldo en PayPal Mama',
    'Saldo en PayPal Javi'
  ];
  
  // This logic calculates the total available balance by summing up *all* entries
  // that match one of the specified balance concepts. This treats them as cumulative
  // accounts rather than just the latest snapshot.
  const totalAvailable = savings
    .filter(entry => availableBalanceConcepts.includes(entry.description))
    .reduce((sum, entry) => sum + entry.amount, 0);


  // 3. Ahorro de Hoy
  const todaySavings = savings
    .filter(s => s.date === todayStr)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // 4. Ahorro de Esta Semana (Lunes a Domingo)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysSinceMonday);
  const startOfWeekStr = getLocalDateString(startOfWeek);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const endOfWeekStr = getLocalDateString(endOfWeek);

  const thisWeekSavings = savings
    .filter(s => s.date >= startOfWeekStr && s.date <= endOfWeekStr)
    .reduce((sum, entry) => sum + entry.amount, 0);


  // 5. Ahorro de Este Mes
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const thisMonthSavings = savings
    .filter(s => {
      const [year, month] = s.date.split('-').map(Number);
      return year === currentYear && (month - 1) === currentMonth;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  // 6. Mejor Día
  const dailyTotals = savings.reduce((acc: Record<string, number>, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.amount;
      return acc;
  }, {} as Record<string, number>);

  // FIX: Use Object.keys().map() to correctly infer numeric types and avoid errors with Math.max.
  // The initial 0 ensures a correct result for cases with no savings.
  const bestDayAmount = Math.max(0, ...Object.keys(dailyTotals).map(key => dailyTotals[key]));

  // 7. Ahorro Diario Promedio
  const uniqueDays = new Set(savings.map(s => s.date)).size;
  const averageDaily = uniqueDays > 0 ? totalSaved / uniqueDays : 0;
  
  // 8. Racha (Streak)
  const calculateStreak = (entries: SavingEntry[]): number => {
    if (entries.length === 0) return 0;

    const savedDates = new Set(entries.map(e => e.date));
    const sortedDates = Array.from(savedDates).sort().reverse();

    const localToday = new Date();
    const todayString = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;

    const localYesterday = new Date();
    localYesterday.setDate(localToday.getDate() - 1);
    const yesterdayString = `${localYesterday.getFullYear()}-${String(localYesterday.getMonth() + 1).padStart(2, '0')}-${String(localYesterday.getDate()).padStart(2, '0')}`;

    const lastEntryDateStr = sortedDates[0];
    if (lastEntryDateStr !== todayString && lastEntryDateStr !== yesterdayString) {
        return 0; // La racha se rompe si el último registro no fue hoy o ayer
    }
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i-1]);
        const previousDate = new Date(sortedDates[i]);
        
        // La diferencia se calcula en UTC para evitar problemas de DST
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break; // La racha se rompe
        }
    }

    return streak;
  };
  const currentStreak = calculateStreak(savings);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStatCard title="Total Ahorrado" value={formatCurrency(totalSaved)} />
            <MiniStatCard title="Total Disponible" value={formatCurrency(totalAvailable)} />
            <MiniStatCard title="Hoy" value={formatCurrency(todaySavings)} />
            <MiniStatCard title="Esta Semana" value={formatCurrency(thisWeekSavings)} />
            <MiniStatCard title="Este Mes" value={formatCurrency(thisMonthSavings)} />
            <MiniStatCard title="Mejor Día" value={formatCurrency(bestDayAmount)} />
            <MiniStatCard title="Promedio Diario" value={formatCurrency(averageDaily)} />
            <MiniStatCard title="Racha" value={`${currentStreak} ${currentStreak === 1 ? 'día' : 'días'}`} />
        </div>
    </div>
  );
};
