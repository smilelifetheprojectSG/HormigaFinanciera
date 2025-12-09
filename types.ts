
export interface SavingEntry {
  id: string;
  amount: number; // Siempre en EUR
  description: string; // "App/Concepto"
  note?: string; // "Nota (opcional)"
  date: string; // ISO string format (YYYY-MM-DD) para agrupación lógica
  timestamp?: string; // ISO string format completo con hora para visualización exacta
  currency: 'EUR' | 'USD';
  originalAmount: number;
  exchangeRate?: number; // Tasa de USD a EUR
  status?: 'completed' | 'pending'; // Nuevo estado para controlar transferencias
}

export interface SavingsGoal {
  target: number;
  description: string;
  dailyAmount: number; // Cantidad mínima de ahorro diario
}