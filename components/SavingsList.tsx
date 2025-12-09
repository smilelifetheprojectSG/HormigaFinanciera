
import React, { useState, useMemo } from 'react';
import { SavingEntry } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { BarsArrowUpIcon } from './icons/BarsArrowUpIcon';
import { BarsArrowDownIcon } from './icons/BarsArrowDownIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { MoneyBagEuroIcon } from './icons/MoneyBagEuroIcon';

interface SavingsListProps {
    savings: SavingEntry[];
    selectedDate: string;
    onDayClick: (date: string) => void;
}

const Calendar: React.FC<SavingsListProps> = ({ savings, selectedDate, onDayClick }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, 1));
    });

    const savingsByDate = useMemo(() => {
        const map = new Map<string, boolean>();
        savings.forEach(s => map.set(s.date, true));
        return map;
    }, [savings]);

    const year = currentMonth.getUTCFullYear();
    const month = currentMonth.getUTCMonth();

    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const startDay = startOfMonth.getUTCDay(); // 0=Sun, 1=Mon
    const diff = startDay === 0 ? 6 : startDay - 1; // Days to subtract to get to Monday
    const startDate = new Date(startOfMonth);
    startDate.setUTCDate(startDate.getUTCDate() - diff);
    
    const days = [];
    let dayIterator = new Date(startDate);
    while (days.length < 42) { 
        days.push(new Date(dayIterator));
        dayIterator.setUTCDate(dayIterator.getUTCDate() + 1);
    }

    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayStr = getTodayString();

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setUTCMonth(newDate.getUTCMonth() + offset, 1);
            return newDate;
        });
    };

    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-xl border border-border/50">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-subtle-button-hover-bg transition-colors text-text-secondary hover:text-primary">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-bold text-text-primary capitalize tracking-tight">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-subtle-button-hover-bg transition-colors text-text-secondary hover:text-primary">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-x-2 text-center text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isCurrentMonth = d.getUTCMonth() === month;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const hasSavings = savingsByDate.has(dateStr);

                    let dayClassNames = 'w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative text-sm font-medium';

                    if (isCurrentMonth) {
                         dayClassNames += ' cursor-pointer ';
                         if (isSelected) {
                            dayClassNames += ' bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10';
                        } else if (hasSavings) {
                            dayClassNames += ' bg-primary/10 text-primary-dark hover:bg-primary/20';
                        } else {
                            dayClassNames += ' text-text-primary hover:bg-surface border border-transparent hover:border-border hover:shadow-sm';
                        }
                    } else {
                        dayClassNames += ' text-text-disabled cursor-default opacity-40';
                    }

                    return (
                       <button
                         key={i}
                         onClick={() => {
                            if (isCurrentMonth) {
                                onDayClick(dateStr);
                            }
                         }}
                         disabled={!isCurrentMonth}
                         className={dayClassNames}
                       >
                            <span>{d.getUTCDate()}</span>
                            {isToday && !isSelected && (
                                <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-secondary"></span>
                            )}
                       </button>
                    );
                })}
            </div>
        </div>
    );
};

const Balances: React.FC<{ savings: SavingEntry[] }> = ({ savings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
    };

    const initialBalances = useMemo(() => {
        const balanceMap = new Map<string, number>();
        const excludedConcepts = new Set([
            'Saldo en efectivo',
            'Saldo en Revolut Mama',
            'Saldo en Revolut Javi',
            'Saldo en PayPal Mama',
            'Saldo en PayPal Javi',
            'Otro ingreso'
        ]);

        for (const entry of savings) {
            if (!excludedConcepts.has(entry.description)) {
                const currentBalance = balanceMap.get(entry.description) || 0;
                balanceMap.set(entry.description, currentBalance + entry.amount);
            }
        }
        
        return Array.from(balanceMap.entries())
            .filter(([, balance]) => balance > 0);
    }, [savings]);

    const displayedBalances = useMemo(() => {
        let processedBalances = [...initialBalances];

        if (searchTerm) {
            processedBalances = processedBalances.filter(([concept]) => 
                concept.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        processedBalances.sort((a, b) => {
            if (sortOrder === 'desc') {
                return b[1] - a[1];
            } else {
                return a[1] - b[1];
            }
        });

        return processedBalances;
    }, [initialBalances, searchTerm, sortOrder]);

    if (initialBalances.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-secondary rounded-full mr-3"></span>
                Saldos en Apps
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar app..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-none bg-surface shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
                <div className="flex-shrink-0 flex bg-surface p-1 rounded-xl shadow-sm">
                    <button 
                        onClick={() => setSortOrder('desc')} 
                        title="Ordenar: Mayor saldo primero"
                        className={`p-2 rounded-lg transition-all ${sortOrder === 'desc' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        <BarsArrowDownIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => setSortOrder('asc')} 
                        title="Ordenar: Menor saldo primero"
                        className={`p-2 rounded-lg transition-all ${sortOrder === 'asc' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        <BarsArrowUpIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {displayedBalances.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {displayedBalances.map(([concept, balance]) => (
                        <div key={concept} className="bg-surface p-5 rounded-2xl shadow-md flex flex-col justify-center h-28 relative overflow-hidden group hover:shadow-lg transition-shadow border border-transparent hover:border-border text-center">
                            <div className="z-10">
                                <p className="text-sm font-medium text-text-secondary truncate uppercase tracking-wider mb-1">{concept}</p>
                                <p className="text-xl font-bold text-text-primary tracking-tight">{formatCurrency(balance)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-text-secondary py-6">No se encontraron apps.</p>
            )}
        </div>
    );
};

const AvailableBalances: React.FC<{ savings: SavingEntry[] }> = ({ savings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');

    const initialAvailableBalances = useMemo(() => {
        const balanceMap = new Map<string, number>();
        const availableBalanceConcepts = [
            'Saldo en efectivo',
            'Saldo en Revolut Mama',
            'Saldo en Revolut Javi',
            'Saldo en PayPal Mama',
            'Saldo en PayPal Javi'
        ];

        availableBalanceConcepts.forEach(c => balanceMap.set(c, 0));
        savings.forEach(entry => {
            if (availableBalanceConcepts.includes(entry.description)) {
                balanceMap.set(entry.description, (balanceMap.get(entry.description) || 0) + entry.amount);
            }
        });
        
        return Array.from(balanceMap.entries());
    }, [savings]);

    const displayedBalances = useMemo(() => {
        return searchTerm 
            ? initialAvailableBalances.filter(([c]) => c.toLowerCase().includes(searchTerm.toLowerCase()))
            : initialAvailableBalances;
    }, [initialAvailableBalances, searchTerm]);

    if (savings.length === 0) return null;

    const getCardStyle = (name: string) => {
        if (name.includes('Revolut')) return 'from-blue-600 to-blue-400 text-white';
        if (name.includes('PayPal')) return 'from-indigo-700 to-indigo-500 text-white';
        if (name.includes('efectivo')) return 'from-emerald-600 to-emerald-400 text-white';
        return 'from-gray-700 to-gray-500 text-white';
    }

    return (
        <div className="mt-8 mb-4">
             <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                Saldos Disponibles
            </h3>
            
            <div className="mb-4">
                 <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar saldo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-none bg-surface shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBalances.map(([concept, balance]) => (
                    <div key={concept} className={`rounded-2xl p-5 shadow-lg bg-gradient-to-br ${getCardStyle(concept)} relative overflow-hidden flex flex-col justify-between h-32 transform transition-transform hover:scale-[1.02]`}>
                         {/* Abstract shapes */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-lg"></div>
                        
                        <div className="flex justify-between items-start z-10">
                            <span className="text-sm font-medium opacity-90">{concept}</span>
                             {concept === 'Saldo en efectivo' ? (
                                <MoneyBagEuroIcon className="w-8 h-8 opacity-80" />
                             ) : (
                                <CreditCardIcon className="w-8 h-8 opacity-80" />
                             )}
                        </div>
                        <div className="z-10">
                            <span className="text-xs opacity-75 uppercase tracking-widest block mb-1">Saldo Actual</span>
                            <span className="text-2xl font-bold tracking-tight">{formatCurrency(balance)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SavingsList: React.FC<SavingsListProps> = (props) => {
  return (
      <div className="space-y-6 pb-6">
        <h2 className="text-2xl font-bold text-primary-dark tracking-tight">Movimientos & Calendario</h2>
        <Calendar {...props} />
        <AvailableBalances savings={props.savings} />
        <Balances savings={props.savings} />
      </div>
  );
};
