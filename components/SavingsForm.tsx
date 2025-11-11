import React, { useState, useEffect, useMemo } from 'react';
import { SavingEntry } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MinusIcon } from './icons/MinusIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';


interface SavingsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: (Omit<SavingEntry, 'id'> | SavingEntry) | (Omit<SavingEntry, 'id'> | SavingEntry)[]) => void;
  onDelete: (id: string) => void;
  date: string;
  allSavings: SavingEntry[];
  concepts: string[];
  onManageConcepts: () => void;
}

const destinationConcepts = [
    'Saldo en efectivo',
    'Saldo en Revolut Mama',
    'Saldo en Revolut Javi',
    'Saldo en PayPal Mama',
    'Saldo en PayPal Javi'
];

export const SavingsForm: React.FC<SavingsFormProps> = ({ isOpen, onClose, onSave, onDelete, date, allSavings, concepts, onManageConcepts }) => {
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [destinationConcept, setDestinationConcept] = useState('');
  const [customConcept, setCustomConcept] = useState('');
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [exchangeRate, setExchangeRate] = useState('0.92');
  const [error, setError] = useState('');
  const [entryToEdit, setEntryToEdit] = useState<SavingEntry | null>(null);
  const [isListCollapsed, setListCollapsed] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'withdrawal'>('income');

  const savingsForDate = useMemo(() => 
    allSavings.filter(s => s.date === date), // Order is preserved from allSavings
  [allSavings, date]);

  const totalForDay = useMemo(() =>
    savingsForDate.reduce((sum, entry) => sum + entry.amount, 0),
  [savingsForDate]);

  const sourceConcepts = useMemo(() => 
    concepts.filter(c => !destinationConcepts.includes(c) && c !== 'Otro ingreso')
  , [concepts]);

  const resetForm = () => {
    setAmount('');
    setConcept('');
    setCustomConcept('');
    setDestinationConcept('');
    setNote('');
    setError('');
    setEntryToEdit(null);
    setCurrency('EUR');
    setExchangeRate('0.92');
    setTransactionType('income');
  };
  
  useEffect(() => {
    if (!isOpen) {
      // Retrasar el reseteo para que no se vea el cambio durante la animación de salida
      setTimeout(resetForm, 200);
    } else {
        // Al abrir, la lista de movimientos estará oculta por defecto.
        setListCollapsed(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (entryToEdit) {
        setTransactionType(entryToEdit.amount >= 0 ? 'income' : 'expense');
        setAmount(Math.abs(entryToEdit.originalAmount).toString());
        setCurrency(entryToEdit.currency);
        if (entryToEdit.exchangeRate) {
            setExchangeRate(entryToEdit.exchangeRate.toString());
        }
        if (concepts.includes(entryToEdit.description)) {
            setConcept(entryToEdit.description);
            setCustomConcept('');
        } else {
            setConcept('Otro ingreso');
            setCustomConcept(entryToEdit.description);
        }
        setNote(entryToEdit.note || '');
        setError('');
    }
  }, [entryToEdit, concepts]);

  const handleQuickAddAmount = (valueToAdd: number) => {
    const currentAmount = parseFloat(amount.replace(',', '.')) || 0;
    const newAmount = currentAmount + valueToAdd;
    setAmount(newAmount.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      setError('La cantidad es obligatoria.');
      return;
    }
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }
    
    setError('');
    
    let finalAmountInEur = numericAmount;
    let finalExchangeRate: number | undefined = undefined;

    if (currency === 'USD') {
        const numericExchangeRate = parseFloat(exchangeRate.replace(',', '.'));
        if (isNaN(numericExchangeRate) || numericExchangeRate <= 0) {
            setError('La tasa de cambio debe ser un número positivo.');
            return;
        }
        finalAmountInEur = numericAmount * numericExchangeRate;
        finalExchangeRate = numericExchangeRate;
    }

    if (transactionType === 'withdrawal') {
        if (!concept) {
            setError('Debes seleccionar un origen para el retiro.');
            return;
        }
        if (!destinationConcept) {
            setError('Debes seleccionar un destino para el retiro.');
            return;
        }
        if (concept === destinationConcept) {
            setError('El origen y el destino no pueden ser iguales.');
            return;
        }

        const noteText = note.trim();
        const expenseEntry: Omit<SavingEntry, 'id'> = {
            amount: -finalAmountInEur,
            originalAmount: -numericAmount,
            currency,
            exchangeRate: finalExchangeRate,
            description: concept,
            note: `Retiro hacia ${destinationConcept}${noteText ? ` (${noteText})` : ''}`,
            date,
        };
        const incomeEntry: Omit<SavingEntry, 'id'> = {
            amount: finalAmountInEur,
            originalAmount: numericAmount,
            currency,
            exchangeRate: finalExchangeRate,
            description: destinationConcept,
            note: `Retiro desde ${concept}${noteText ? ` (${noteText})` : ''}`,
            date,
        };
        
        onSave([expenseEntry, incomeEntry]);
    } else { // Income or Expense
        const finalConcept = concept === 'Otro ingreso' ? customConcept : concept;
        if (!finalConcept) {
          setError('El concepto es obligatorio.');
          return;
        }
        
        const signedFinalAmount = transactionType === 'income' ? finalAmountInEur : -finalAmountInEur;
        const signedOriginalAmount = transactionType === 'income' ? numericAmount : -numericAmount;

        const newEntry: Omit<SavingEntry, 'id'> = {
          amount: signedFinalAmount,
          originalAmount: signedOriginalAmount,
          currency: currency,
          exchangeRate: finalExchangeRate,
          description: finalConcept.trim(),
          note: note.trim() || undefined,
          date,
        };

        if (entryToEdit) {
          onSave({ ...newEntry, id: entryToEdit.id });
        } else {
          onSave(newEntry);
        }
    }
    
    resetForm();
  };
  
  const handleEdit = (entry: SavingEntry) => {
      setEntryToEdit(entry);
      // Opcional: desplazar al formulario
      document.getElementById('saving-form-section')?.scrollIntoView({ behavior: 'smooth' });
  }
  
  const handleCancelEdit = () => {
      resetForm();
  }

  const formattedDate = useMemo(() => {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  }, [date]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value).replace(/\s/g, '\u2009');

  if (!isOpen) return null;

  const submitButtonText = entryToEdit ? 'Guardar Cambios' : 
    transactionType === 'income' ? 'Añadir Ingreso' :
    transactionType === 'expense' ? 'Restar Gasto' :
    'Realizar Retiro';
    
  const submitButtonClass = transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' :
    transactionType === 'withdrawal' ? 'bg-amber-500 hover:bg-amber-600' :
    'bg-primary hover:bg-primary-dark';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-scale-in flex flex-col">
        <div className="sticky top-0 bg-surface/80 backdrop-blur-sm z-10 p-6 pb-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center">
                 <PlusCircleIcon className="w-8 h-8 text-primary mr-3" />
                 <div>
                    <h2 className="text-xl font-bold text-primary-dark">Gestionar Movimientos</h2>
                    <p className="text-sm text-text-secondary capitalize">{formattedDate}</p>
                 </div>
            </div>
        </div>

        <div className="p-6 pt-2 flex-grow">
            {/* Sección de Ingresos del Día */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-text-primary">Movimientos del día</h3>
                    <div className="flex items-center">
                        <span className={`font-bold mr-3 ${totalForDay >= 0 ? 'text-primary' : 'text-red-600'}`}>{formatCurrency(totalForDay)}</span>
                        <button onClick={() => setListCollapsed(s => !s)} disabled={savingsForDate.length === 0} className="text-text-secondary hover:text-text-primary disabled:text-text-disabled disabled:cursor-not-allowed">
                            {isListCollapsed ? <PlusIcon className="w-5 h-5"/> : <MinusIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                {savingsForDate.length > 0 ? (
                    !isListCollapsed && (
                        <ul className="space-y-2 animate-fade-in-up">
                            {savingsForDate.map(entry => {
                                const isIncome = entry.amount >= 0;
                                return (
                                    <li key={entry.id} className={`p-3 rounded-lg flex items-start transition-colors ${!isIncome ? 'bg-red-subtle-bg' : (entry.id === entryToEdit?.id ? 'bg-primary/10' : 'bg-background')}`}>
                                        {isIncome ? 
                                        <CheckCircleIcon className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                        : <MinusCircleIcon className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                        }
                                        <div className="flex-grow">
                                            <p className="font-semibold text-text-primary">{entry.description}</p>
                                            <p className={`text-sm font-medium ${isIncome ? 'text-primary' : 'text-red-600'}`}>
                                            {entry.currency === 'USD' 
                                                ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.originalAmount)} (${formatCurrency(entry.amount)})`
                                                : formatCurrency(entry.amount)}
                                            </p>
                                            {entry.note && <p className="text-sm text-text-secondary mt-1">{entry.note}</p>}
                                        </div>
                                        <div className="flex items-center ml-2 flex-shrink-0">
                                            <button onClick={() => handleEdit(entry)} className="p-2 text-text-secondary hover:text-primary transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => onDelete(entry.id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                ) : (
                    <p className="text-center text-sm text-text-secondary py-4 bg-background rounded-lg">No hay movimientos para este día.</p>
                )}
            </div>

            {/* Formulario para Añadir/Editar */}
            <div id="saving-form-section">
                <h3 className="font-semibold text-text-primary mb-3 border-t border-border pt-4">{entryToEdit ? 'Editar Movimiento' : 'Añadir Nuevo Movimiento'}</h3>
                
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Movimiento</label>
                        <div className="flex items-center space-x-2 bg-background border border-border rounded-md p-1 w-auto">
                            <button type="button" onClick={() => setTransactionType('income')} className={`px-3 py-1 text-sm rounded-md transition-colors ${transactionType === 'income' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-subtle-button-hover-bg'}`}>
                                Ingreso
                            </button>
                            <button type="button" onClick={() => setTransactionType('expense')} className={`px-3 py-1 text-sm rounded-md transition-colors ${transactionType === 'expense' ? 'bg-red-600 text-white shadow-sm' : 'text-text-secondary hover:bg-subtle-button-hover-bg'}`}>
                                Gasto
                            </button>
                            <button type="button" onClick={() => setTransactionType('withdrawal')} disabled={!!entryToEdit} className={`px-3 py-1 text-sm rounded-md transition-colors ${transactionType === 'withdrawal' ? 'bg-amber-500 text-white shadow-sm' : 'text-text-secondary hover:bg-subtle-button-hover-bg'} disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}>
                                Retiro
                            </button>
                        </div>
                    </div>
                    
                    {transactionType === 'income' && !entryToEdit && currency === 'EUR' && (
                        <div className="animate-fade-in-up">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Suma Rápida</label>
                            <div className="flex flex-wrap gap-2">
                                {[5.00, 10.00, 25.00].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleQuickAddAmount(val)}
                                        className="px-4 py-1.5 bg-subtle-button-bg text-subtle-button-text text-sm font-medium rounded-full hover:bg-subtle-button-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-colors"
                                    >
                                        + {formatCurrency(val)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                
                    {transactionType === 'withdrawal' ? (
                        <>
                            <div>
                                <label htmlFor="concept" className="block text-sm font-medium text-text-secondary mb-1">Desde (Origen)</label>
                                <select
                                    id="concept"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                                >
                                    <option value="" disabled>Selecciona un origen...</option>
                                    {sourceConcepts.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-text-secondary mb-1">Hacia (Destino)</label>
                                <select
                                    id="destination"
                                    value={destinationConcept}
                                    onChange={(e) => setDestinationConcept(e.target.value)}
                                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                                >
                                    <option value="" disabled>Selecciona un destino...</option>
                                    {destinationConcepts.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                           <div>
                                <div className="flex justify-between items-center mb-1">
                                <label htmlFor="concept" className="block text-sm font-medium text-text-secondary">App/Concepto</label>
                                <button type="button" onClick={onManageConcepts} className="text-xs text-primary-light hover:text-primary font-medium flex items-center space-x-1 transition-colors">
                                    <Cog6ToothIcon className="w-4 h-4" />
                                    <span>Gestionar</span>
                                </button>
                                </div>
                                <select
                                    id="concept"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                                >
                                    <option value="" disabled>Selecciona un concepto...</option>
                                    {concepts.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {concept === 'Otro ingreso' && (
                                <div className="animate-fade-in-up">
                                    <label htmlFor="custom-concept" className="block text-sm font-medium text-text-secondary mb-1">Nombre del Concepto</label>
                                    <input
                                    id="custom-concept"
                                    type="text"
                                    value={customConcept}
                                    onChange={(e) => setCustomConcept(e.target.value)}
                                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                                    placeholder="Ej. Venta en Vinted"
                                    />
                                </div>
                            )}
                        </>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Moneda</label>
                        <div className="flex items-center space-x-2 bg-background border border-border rounded-md p-1 w-min">
                            <button type="button" onClick={() => setCurrency('EUR')} className={`px-3 py-1 text-sm rounded-md transition-colors ${currency === 'EUR' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-subtle-button-hover-bg'}`}>
                                EUR (€)
                            </button>
                            <button type="button" onClick={() => setCurrency('USD')} className={`px-3 py-1 text-sm rounded-md transition-colors ${currency === 'USD' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-subtle-button-hover-bg'}`}>
                                USD ($)
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">Cantidad ({currency === 'EUR' ? '€' : '$'})</label>
                        <input
                          id="amount"
                          type="text"
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                          placeholder="0,00"
                        />
                    </div>
                    {currency === 'USD' && (
                        <div className="animate-fade-in-up">
                            <label htmlFor="exchange-rate" className="block text-sm font-medium text-text-secondary mb-1">Tasa de cambio (1 USD → EUR)</label>
                            <input
                              id="exchange-rate"
                              type="text"
                              inputMode="decimal"
                              value={exchangeRate}
                              onChange={(e) => setExchangeRate(e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                              placeholder="Ej. 0.92"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-text-secondary mb-1">Nota (opcional)</label>
                        <input
                          id="note"
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                          placeholder="Ej. Comisión de retiro..."
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                     <div className="flex justify-end pt-2 space-x-3">
                        <button type="button" onClick={entryToEdit ? handleCancelEdit : onClose} className="px-4 py-2 bg-subtle-button-bg text-subtle-button-text font-medium rounded-lg hover:bg-subtle-button-hover-bg transition-colors">
                          {entryToEdit ? 'Cancelar Edición' : 'Cancelar'}
                        </button>
                        <button type="submit" className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all ${submitButtonClass}`}>
                          {submitButtonText}
                        </button>
                     </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};