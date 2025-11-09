export interface SavingEntry {
  id: string;
  amount: number; // Siempre en EUR
  description: string; // "App/Concepto"
  note?: string; // "Nota (opcional)"
  date: string; // ISO string format
  currency: 'EUR' | 'USD';
  originalAmount: number;
  exchangeRate?: number; // Tasa de USD a EUR
}

export interface SavingsGoal {
  target: number;
  description: string;
  deadline?: string; // ISO string format
}
