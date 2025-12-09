
import React from 'react';
import { SavingEntry } from '../types';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { FireIcon } from './icons/FireIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StarIcon } from './icons/StarIcon'; 

interface DashboardProps {
  savings: SavingEntry[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
}

// Tarjeta Grande Principal (Hero)
const HeroStatCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({ title, value, subtitle }) => (
    <div className="col-span-2 bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
        <div className="relative z-10">
            <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-1 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1.5" />
                {title}
            </p>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-primary-50 text-xs mt-2 font-medium">{subtitle}</p>}
        </div>
    </div>
);

// Tarjeta Secundaria (Total Ahorrado)
const SecondaryStatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="col-span-2 md:col-span-1 bg-surface border border-border p-5 rounded-2xl shadow-md flex flex-col justify-center relative overflow-hidden">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-primary-dark mt-1">{value}</p>
    </div>
);

// Tarjeta Pequeña con Icono - AJUSTADA PARA MÓVIL
const MiniStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-surface p-3 sm:p-4 rounded-xl shadow-md flex items-center space-x-3 sm:space-x-4 border border-border/50 hover:border-primary/20 transition-colors h-full">
        <div className={`p-2.5 sm:p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100 flex-shrink-0`}>
            {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 sm:w-6 sm:h-6 ${colorClass.replace('bg-', 'text-')}` })}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-wide truncate leading-tight">{title}</p>
            <p className="text-base sm:text-lg font-bold text-text-primary truncate leading-tight mt-0.5">{value}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ savings }) => {
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

  // 2. Total Disponible
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


  // 3. Ahorro de Hoy
  const todaySavings = savings
    .filter(s => s.date === todayStr)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // 4. Ahorro de Esta Semana
  const dayOfWeek = today.getDay(); // 0=Sun
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

  const bestDayAmount = Math.max(0, ...Object.keys(dailyTotals).map(key => dailyTotals[key]));

  // 7. Ahorro Diario Promedio
  const uniqueDays = new Set(savings.map(s => s.date)).size;
  const averageDaily = uniqueDays > 0 ? totalSaved / uniqueDays : 0;
  
  // 8. Racha
  const calculateStreak = (entries: SavingEntry[]): number => {
    if (entries.length === 0) return 0;

    const savedDates = new Set(entries.map(e => e.date));
    const sortedDates = Array.from(savedDates).sort().reverse();

    const localToday = new Date();
    const todayString = getLocalDateString(localToday);

    const localYesterday = new Date();
    localYesterday.setDate(localToday.getDate() - 1);
    const yesterdayString = getLocalDateString(localYesterday);

    const lastEntryDateStr = sortedDates[0];
    // Si la última entrada no es de hoy ni de ayer, la racha se rompió
    if (lastEntryDateStr !== todayString && lastEntryDateStr !== yesterdayString) {
        return 0;
    }
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i-1]);
        const previousDate = new Date(sortedDates[i]);
        
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  };
  const currentStreak = calculateStreak(savings);

  // Lógica de color de la llama
  const streakColorClass = currentStreak > 0 ? 'bg-orange-500' : 'bg-slate-400';

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Fila Principal */}
            <HeroStatCard title="Total Disponible" value={formatCurrency(totalAvailable)} subtitle="Liquidez inmediata" />
            <SecondaryStatCard title="Total Acumulado" value={formatCurrency(totalSaved)} />
            
            {/* Grid de Detalles Unificado */}
            <div className="col-span-2 md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-2">
                <MiniStatCard 
                    title="Hoy" 
                    value={formatCurrency(todaySavings)} 
                    icon={<SparklesIcon />} 
                    colorClass="bg-teal-500" 
                />
                <MiniStatCard 
                    title="Promedio Diario" 
                    value={formatCurrency(averageDaily)} 
                    icon={<TrendingUpIcon />} 
                    colorClass="bg-emerald-500" 
                />
                <MiniStatCard 
                    title="Esta Semana" 
                    value={formatCurrency(thisWeekSavings)} 
                    icon={<CalendarDaysIcon />} 
                    colorClass="bg-blue-500" 
                />
                 <MiniStatCard 
                    title="Este Mes" 
                    value={formatCurrency(thisMonthSavings)} 
                    icon={<CalendarDaysIcon />} 
                    colorClass="bg-blue-500" 
                />
                 <MiniStatCard 
                    title="Racha Actual" 
                    value={`${currentStreak} días`} 
                    icon={<FireIcon />} 
                    colorClass={streakColorClass} 
                />
                 <MiniStatCard 
                    title="Mejor Día" 
                    value={formatCurrency(bestDayAmount)} 
                    icon={<StarIcon />} 
                    colorClass="bg-orange-500" 
                />
            </div>
        </div>
    </div>
  );
};
