
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

  const today = new Date();
  // Corregir el string de fecha para que use la fecha local en vez de UTC
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // 1. Total Ahorrado (General)
  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  // 2. Total Disponible (suma de los saldos más recientes de las cuentas)
  const availableBalanceConcepts = [
    'Saldo en efectivo',
    'Saldo en Revolut Mama',
    'Saldo en Revolut Javi',
    'Saldo en PayPal Mama',
    'Saldo en PayPal Javi'
  ];
  
  // Para cada concepto de balance, encontramos el registro más reciente.
  // El "Total Disponible" es la suma de estos últimos saldos registrados.
  const latestBalances = new Map<string, SavingEntry>();
  savings.forEach(entry => {
    if (availableBalanceConcepts.includes(entry.description)) {
      const existingEntry = latestBalances.get(entry.description);
      // Si no hay entrada o la nueva es más reciente (o del mismo día), la actualizamos.
      // Si hay múltiples entradas en el mismo día, la última en el array `savings` prevalecerá.
      if (!existingEntry || new Date(entry.date) >= new Date(existingEntry.date)) {
        latestBalances.set(entry.description, entry);
      }
    }
  });
  
  const totalAvailable = Array.from(latestBalances.values())
    .reduce((sum, entry) => sum + entry.amount, 0);


  // 3. Ahorro de Hoy
  const todaySavings = savings
    .filter(s => s.date === todayStr)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // 4. Ahorro de los Últimos 7 Días
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
            <MiniStatCard title="Últimos 7 Días" value={formatCurrency(thisWeekSavings)} />
            <MiniStatCard title="Este Mes" value={formatCurrency(thisMonthSavings)} />
            <MiniStatCard title="Mejor Día" value={formatCurrency(bestDayAmount)} />
            <MiniStatCard title="Promedio Diario" value={formatCurrency(averageDaily)} />
            <MiniStatCard title="Racha" value={`${currentStreak} ${currentStreak === 1 ? 'día' : 'días'}`} />
        </div>
    </div>
  );
};
