
import React, { useState, useMemo } from 'react';
import { SavingEntry } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ClockIcon } from './icons/ClockIcon';

interface TransactionHistoryProps {
  savings: SavingEntry[];
  onToggleStatus: (entry: SavingEntry) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ savings, onToggleStatus }) => {
  // Estado para controlar el mes visualizado. Inicialmente el mes actual.
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
  }

  const navigateMonth = (direction: -1 | 1) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const { filteredSavings, monthSummary } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const filtered = savings.filter(entry => {
      const entryDate = new Date(entry.date);
      // Ajustamos el entry.date (YYYY-MM-DD) para comparar correctamente año y mes
      const [entryYear, entryMonth] = entry.date.split('-').map(Number);
      return entryYear === year && (entryMonth - 1) === month;
    });

    // Ordenar: Primero por fecha descendente, luego por hora descendente
    filtered.sort((a, b) => {
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        // Si tienen timestamp, usarlo
        if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
    });

    const summary = filtered.reduce((acc, curr) => {
        if (curr.amount >= 0) {
            acc.income += curr.amount;
        } else {
            acc.expense += Math.abs(curr.amount);
        }
        return acc;
    }, { income: 0, expense: 0 });

    return { filteredSavings: filtered, monthSummary: summary };
  }, [savings, currentDate]);

  const monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const balance = monthSummary.income - monthSummary.expense;

  return (
    <div className="animate-fade-in-up pb-4">
      <h3 className="text-xl font-bold text-primary-dark mb-4">Historial Contable</h3>
      
      <div className="bg-surface rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Header con Navegación y Resumen */}
        <div className="bg-primary/5 p-4 border-b border-border">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-2 bg-surface rounded-full shadow-sm text-text-secondary hover:text-primary transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-bold text-primary capitalize">{monthLabel}</h4>
                <button onClick={() => navigateMonth(1)} className="p-2 bg-surface rounded-full shadow-sm text-text-secondary hover:text-primary transition-colors">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                <div className="bg-surface p-2 rounded-lg shadow-sm">
                    <span className="block text-text-secondary mb-1">Ingresos</span>
                    <span className="font-bold text-green-600">{formatCurrency(monthSummary.income)}</span>
                </div>
                <div className="bg-surface p-2 rounded-lg shadow-sm">
                    <span className="block text-text-secondary mb-1">Gastos</span>
                    <span className="font-bold text-red-600">-{formatCurrency(monthSummary.expense)}</span>
                </div>
                <div className="bg-surface p-2 rounded-lg shadow-sm">
                    <span className="block text-text-secondary mb-1">Balance</span>
                    <span className={`font-bold ${balance >= 0 ? 'text-primary' : 'text-red-500'}`}>{formatCurrency(balance)}</span>
                </div>
            </div>
        </div>

        {/* Lista de Movimientos */}
        <div className="max-h-[500px] overflow-y-auto">
            {filteredSavings.length > 0 ? (
                <div className="divide-y divide-border">
                    {filteredSavings.map((entry) => {
                        const isIncome = entry.amount >= 0;
                        return (
                            <div key={entry.id} className="p-4 hover:bg-background transition-colors flex items-center justify-between group">
                                <div className="flex items-start space-x-3 overflow-hidden">
                                    <div className={`p-2 rounded-full flex-shrink-0 mt-1 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isIncome ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-semibold text-text-primary truncate">{entry.description}</p>
                                            {entry.status === 'pending' && (
                                                <button 
                                                    onClick={() => onToggleStatus(entry)}
                                                    className="focus:outline-none focus:scale-110 active:scale-95 transition-transform"
                                                    title="Pendiente - Click para marcar como Recibido"
                                                >
                                                    <ClockIcon className="w-5 h-5 text-amber-500 hover:text-amber-600 cursor-pointer" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-text-secondary mt-0.5 space-x-2">
                                            <span>{formatDate(entry.date)}</span>
                                            <span className="w-1 h-1 rounded-full bg-text-disabled"></span>
                                            <span className="font-mono">{formatTime(entry.timestamp)}</span>
                                        </div>
                                        {entry.note && (
                                            <p className="text-xs text-text-secondary italic mt-1 truncate max-w-[200px]">{entry.note}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className={`text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                        {isIncome ? '+' : ''}{formatCurrency(entry.amount)}
                                    </p>
                                    {entry.currency === 'USD' && (
                                        <p className="text-[10px] text-text-secondary">
                                            ${entry.originalAmount.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-12 text-center text-text-secondary">
                    <p>No hay movimientos registrados en este mes.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
