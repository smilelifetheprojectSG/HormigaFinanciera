import React, { useState, useMemo, useEffect } from 'react';
import { SavingEntry } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface SavingsListProps {
  savings: SavingEntry[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onDayClick: (date: string) => void;
}

const Calendar: React.FC<{
    savings: SavingEntry[];
    selectedDate: string;
    onDateChange: (date: string) => void;
    onDayClick: (date: string) => void;
}> = ({ savings, selectedDate, onDateChange, onDayClick }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, 1));
    });

    useEffect(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        const firstOfSelectedMonth = new Date(Date.UTC(year, month - 1, 1));
        if (firstOfSelectedMonth.getTime() !== currentMonth.getTime()) {
            setCurrentMonth(firstOfSelectedMonth);
        }
    }, [selectedDate, currentMonth]);

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
                <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-subtle-button-hover-bg transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
                </button>
                <h3 className="text-md font-semibold text-text-primary capitalize">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-subtle-button-hover-bg transition-colors">
                    <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-x-2 text-center text-xs text-text-secondary pb-2">
                {weekDays.map(d => <div key={d} className="font-semibold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isCurrentMonth = d.getUTCMonth() === month;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const hasSavings = savingsByDate.has(dateStr);

                    let dayClassNames = 'w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none relative';

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
                                onDateChange(dateStr);
                                onDayClick(dateStr);
                            }
                         }}
                         disabled={!isCurrentMonth}
                         className={dayClassNames}
                       >
                            <span>{d.getUTCDate()}</span>
                            {isToday && (
                                <span className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-light'}`}></span>
                            )}
                       </button>
                    );
                })}
            </div>
        </div>
    );
};


export const SavingsList: React.FC<SavingsListProps> = (props) => {
  return (
      <div>
        <h2 className="text-xl font-bold text-primary-dark mb-4">Mis Ahorros</h2>
        <div className="max-w-lg mx-auto">
            <Calendar {...props} />
        </div>
      </div>
  );
};