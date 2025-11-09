import React from 'react';
import { SavingEntry } from '../types';
import { FireIcon } from './icons/FireIcon';

interface DashboardProps {
  savings: SavingEntry[];
}

// Tarjeta principal para métricas destacadas
const StatCard: React.FC<{ title: string; value: string; children?: React.ReactNode; className?: string }> = ({ title, value, children, className }) => (
    <div className={`bg-surface p-6 rounded-xl shadow-lg text-center sm:text-left ${className}`}>
        <h3 className="text-md font-medium text-text-secondary">{title}</h3>
        <p className="text-4xl font-bold text-primary-dark mt-2">{value}</p>
        {children}
    </div>
);

// Tarjeta compacta para métricas secundarias
const MiniStatCard: React.FC<{ title: string; value: string; icon?: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-surface p-4 rounded-xl shadow-lg text-center flex flex-col items-center justify-center">
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

  const today = new Date();
  // Corregir el string de fecha para que use la fecha local en vez de UTC
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // 1. Total Ahorrado (General)
  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  // 2. Ahorro de Hoy
  const todaySavings = savings
    .filter(s => s.date === todayStr)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // 3. Ahorro de los Últimos 7 Días
  const todayDateOnly = new Date();
  todayDateOnly.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(todayDateOnly);
  // Usar getDate() - 6 nos da hoy + 6 días anteriores = 7 días en total.
  sevenDaysAgo.setDate(todayDateOnly.getDate() - 6);

  const thisWeekSavings = savings
    .filter(s => {
      const [year, month, day] = s.date.split('-').map(Number);
      // new Date(y, m-1, d) crea una fecha a la medianoche en la zona horaria local.
      const entryDate = new Date(year, month - 1, day);
      return entryDate >= sevenDaysAgo && entryDate <= todayDateOnly;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  // 4. Ahorro de Este Mes
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const thisMonthSavings = savings
    .filter(s => {
      const [year, month] = s.date.split('-').map(Number);
      return year === currentYear && (month - 1) === currentMonth;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  // 5. Mejor Día
  const dailyTotals = savings.reduce((acc: Record<string, number>, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.amount;
      return acc;
  }, {} as Record<string, number>);

  // FIX: Use Object.keys().map() to correctly infer numeric types and avoid errors with Math.max.
  // The initial 0 ensures a correct result for cases with no savings.
  const bestDayAmount = Math.max(0, ...Object.keys(dailyTotals).map(key => dailyTotals[key]));

  // 6. Ahorro Diario Promedio
  const uniqueDays = new Set(savings.map(s => s.date)).size;
  const averageDaily = uniqueDays > 0 ? totalSaved / uniqueDays : 0;
  
  // 7. Racha (Streak)
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
        {/* Fila de métricas principales */}
        <div className="text-center sm:text-left">
            <StatCard title="Total Ahorrado" value={formatCurrency(totalSaved)} />
        </div>
        
        {/* Fila de métricas detalladas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStatCard title="Hoy" value={formatCurrency(todaySavings)} />
            <MiniStatCard title="Últimos 7 Días" value={formatCurrency(thisWeekSavings)} />
            <MiniStatCard title="Este Mes" value={formatCurrency(thisMonthSavings)} />
            <MiniStatCard title="Mejor Día" value={formatCurrency(bestDayAmount)} />
            <MiniStatCard title="Promedio Diario" value={formatCurrency(averageDaily)} />
            <MiniStatCard title="Racha" value={`${currentStreak} ${currentStreak === 1 ? 'día' : 'días'}`} />
        </div>
    </div>
  );
};