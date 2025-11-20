
import React, { useState, useMemo, useEffect } from 'react';
import { SavingEntry } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { BarsArrowUpIcon } from './icons/BarsArrowUpIcon';
import { BarsArrowDownIcon } from './icons/BarsArrowDownIcon';

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
    // Ensure we have 6 weeks for a consistent grid height
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
        <div className="bg-surface p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-subtle-button-hover-bg transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
                </button>
                <h3 className="text-md font-semibold text-text-primary capitalize">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-subtle-button-hover-bg transition-colors">
                    <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-x-1 text-center text-xs text-text-secondary pb-2">
                {weekDays.map(d => <div key={d} className="font-semibold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isCurrentMonth = d.getUTCMonth() === month;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const hasSavings = savingsByDate.has(dateStr);

                    let dayClassNames = 'w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none relative text-sm';

                    if (isCurrentMonth) {
                         dayClassNames += ' cursor-pointer ';
                         if (isSelected) {
                            dayClassNames += ' bg-primary text-white font-semibold shadow-md';
                        } else if (hasSavings) {
                            dayClassNames += ' bg-accent/10 text-accent-dark font-semibold hover:bg-accent/20';
                        } else {
                            dayClassNames += ' text-text-primary hover:bg-subtle-button-hover-bg';
                        }
                    } else {
                        dayClassNames += ' text-text-disabled cursor-default';
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
                            {isToday && (
                                <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-light'}`}></span>
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

    if (initialBalances.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Saldos en Apps</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar app..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
                <div className="flex-shrink-0 flex items-center justify-center space-x-2 bg-subtle-button-bg rounded-lg p-1">
                    <button 
                        onClick={() => setSortOrder('desc')}
                        className={`px-3 py-1 rounded-md flex items-center transition-colors text-sm w-1/2 sm:w-auto justify-center ${sortOrder === 'desc' ? 'bg-primary text-white shadow-sm' : 'text-subtle-button-text hover:bg-subtle-button-hover-bg'}`}
                        aria-label="Ordenar por más saldo"
                    >
                        <BarsArrowDownIcon className="w-5 h-5 mr-1.5" />
                        Más
                    </button>
                    <button 
                        onClick={() => setSortOrder('asc')}
                        className={`px-3 py-1 rounded-md flex items-center transition-colors text-sm w-1/2 sm:w-auto justify-center ${sortOrder === 'asc' ? 'bg-primary text-white shadow-sm' : 'text-subtle-button-text hover:bg-subtle-button-hover-bg'}`}
                        aria-label="Ordenar por menos saldo"
                    >
                        <BarsArrowUpIcon className="w-5 h-5 mr-1.5" />
                        Menos
                    </button>
                </div>
            </div>

            {displayedBalances.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {displayedBalances.map(([concept, balance]) => (
                        <div key={concept} className="bg-surface p-3 rounded-lg shadow-md transition-transform active:scale-95">
                            <p className="text-xs text-text-secondary truncate font-medium uppercase tracking-wide" title={concept}>{concept}</p>
                            <p className="text-lg font-bold text-primary-dark mt-0.5">{formatCurrency(balance)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-text-secondary py-4 bg-background rounded-lg">No se encontraron apps.</p>
            )}
        </div>
    );
};

const AvailableBalances: React.FC<{ savings: SavingEntry[] }> = ({ savings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');
    };

    const initialAvailableBalances = useMemo(() => {
        const balanceMap = new Map<string, number>();
        const availableBalanceConcepts = [
            'Saldo en efectivo',
            'Saldo en Revolut Mama',
            'Saldo en Revolut Javi',
            'Saldo en PayPal Mama',
            'Saldo en PayPal Javi'
        ];

        // Initialize all concepts with 0 balance to ensure they are always displayed
        for (const concept of availableBalanceConcepts) {
            balanceMap.set(concept, 0);
        }

        // Accumulate balances from savings entries
        for (const entry of savings) {
            if (availableBalanceConcepts.includes(entry.description)) {
                const currentBalance = balanceMap.get(entry.description) || 0;
                balanceMap.set(entry.description, currentBalance + entry.amount);
            }
        }
        
        return Array.from(balanceMap.entries());
    }, [savings]);

    const displayedAvailableBalances = useMemo(() => {
        let processedBalances = [...initialAvailableBalances];

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
    }, [initialAvailableBalances, searchTerm, sortOrder]);


    // Don't render if there are no savings at all, to avoid clutter on first load.
    if (savings.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Saldos Disponibles</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar saldo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                </div>
            </div>

            {displayedAvailableBalances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedAvailableBalances.map(([concept, balance]) => (
                        <div key={concept} className="bg-surface p-4 rounded-lg shadow-md flex justify-between items-center">
                            <span className="text-sm text-text-primary font-medium">{concept}</span>
                            <span className="text-lg font-bold text-primary-dark">{formatCurrency(balance)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-text-secondary py-4 bg-background rounded-lg">No se encontraron saldos.</p>
            )}
        </div>
    );
};


export const SavingsList: React.FC<SavingsListProps> = (props) => {
  return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-primary-dark">Movimientos & Calendario</h2>
        <Calendar {...props} />
        <Balances savings={props.savings} />
        <AvailableBalances savings={props.savings} />
      </div>
  );
};
