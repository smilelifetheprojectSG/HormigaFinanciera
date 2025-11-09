import React, { useState, useCallback } from 'react';
import { generateSavingsTip } from '../services/geminiService';
import { SavingEntry } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface AITipProps {
  savings: SavingEntry[];
}

export const AITip: React.FC<AITipProps> = ({ savings }) => {
  const [tip, setTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchTip = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setTip('');
    try {
      const generatedTip = await generateSavingsTip(savings);
      setTip(generatedTip);
    } catch (err) {
      setError('No se pudo obtener el consejo. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [savings]);

  return (
    <div className="bg-surface p-4 rounded-xl shadow-lg mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary-dark flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-secondary" />
                    Consejo Financiero con IA
                </h3>
                {tip && !isLoading && (
                     <p className="text-text-secondary mt-2 pr-4 animate-fade-in-up">{tip}</p>
                )}
                 {isLoading && (
                    <div className="flex items-center text-text-secondary mt-2">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-75 mr-1.5"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-200 mr-1.5"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-300 mr-2"></div>
                        Generando consejo...
                    </div>
                 )}
                 {error && (
                    <p className="text-red-500 mt-2">{error}</p>
                 )}
            </div>
            <button 
                onClick={fetchTip} 
                disabled={isLoading}
                className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 px-5 py-2.5 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all flex items-center justify-center"
            >
                <SparklesIcon className="w-4 h-4 mr-2"/>
                {isLoading ? 'Pensando...' : 'Nuevo Consejo'}
            </button>
        </div>
    </div>
  );
};