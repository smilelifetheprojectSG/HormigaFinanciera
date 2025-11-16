import React, { useRef, useState } from 'react';
import { SavingEntry } from '../types';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';


interface DataExporterProps {
  savings: SavingEntry[];
  onImportRequest: (data: SavingEntry[]) => void;
}

const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
};


export const DataExporter: React.FC<DataExporterProps> = ({ savings, onImportRequest }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const exportToCSV = () => {
    if (savings.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      'ID',
      'Fecha',
      'Concepto',
      'Nota',
      'Moneda Original',
      'Cantidad Original',
      'Tasa de Cambio (a EUR)',
      'Cantidad en EUR'
    ];

    const csvRows = [headers.join(',')];

    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    const sortedSavings = [...savings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const entry of sortedSavings) {
      const row = [
        escapeCsvValue(entry.id),
        escapeCsvValue(entry.date),
        escapeCsvValue(entry.description),
        escapeCsvValue(entry.note),
        escapeCsvValue(entry.currency),
        escapeCsvValue(entry.originalAmount),
        escapeCsvValue(entry.exchangeRate),
        escapeCsvValue(entry.amount)
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    link.setAttribute('download', `datos_hormiga_financiera_${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const parseCSV = (csvText: string): SavingEntry[] => {
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    const headerLine = lines.shift()?.trim();
    const expectedHeader = 'ID,Fecha,Concepto,Nota,Moneda Original,Cantidad Original,Tasa de Cambio (a EUR),Cantidad en EUR';
    
    // Allow for BOM character at the start of the file
    const header = headerLine?.charCodeAt(0) === 0xFEFF ? headerLine.substring(1) : headerLine;

    if (header !== expectedHeader) {
        throw new Error('El archivo no tiene el formato correcto. Las cabeceras no coinciden.');
    }

    const entries: SavingEntry[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = parseCsvRow(line);

        if (row.length !== 8) {
            throw new Error(`Error en la línea ${i + 2}: se esperaban 8 columnas, pero se encontraron ${row.length}.`);
        }

        const [id, date, description, note, currency, originalAmountStr, exchangeRateStr, amountStr] = row;

        const originalAmount = parseFloat(originalAmountStr);
        const amount = parseFloat(amountStr);
        const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr) : undefined;

        if (isNaN(originalAmount) || isNaN(amount)) {
            throw new Error(`Error en la línea ${i + 2}: Las cantidades deben ser números.`);
        }
        if (currency !== 'EUR' && currency !== 'USD') {
            throw new Error(`Error en la línea ${i + 2}: La moneda debe ser 'EUR' o 'USD'.`);
        }
        
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Error en la línea ${i + 2}: El formato de fecha es incorrecto (debe ser AAAA-MM-DD).`);
        }

        entries.push({
            id,
            date,
            description,
            note: note || undefined,
            currency: currency as 'EUR' | 'USD',
            originalAmount,
            exchangeRate,
            amount
        });
    }
    return entries;
};

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      setImportError('');
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          try {
              const importedSavings = parseCSV(text);
              onImportRequest(importedSavings);
          } catch (error: any) {
              setImportError(error.message);
          } finally {
              if (event.target) {
                  event.target.value = '';
              }
          }
      };
      reader.onerror = () => {
          setImportError("Error al leer el archivo.");
          if (event.target) {
              event.target.value = '';
          }
      };
      reader.readAsText(file, 'UTF-8');
  };


  return (
    <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-dark">Opciones Adicionales</h2>
            <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 rounded-full text-text-secondary hover:text-primary-dark hover:bg-subtle-button-hover-bg transition-colors"
            aria-label={isExpanded ? "Ocultar opciones" : "Mostrar opciones"}
            aria-expanded={isExpanded}
            >
            <InformationCircleIcon className="w-6 h-6" />
            </button>
        </div>

        {isExpanded && (
            <div className="space-y-6 animate-fade-in-up mt-4">
                <div className="bg-surface p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center">
                    <div className="flex-grow mb-4 md:mb-0 md:mr-6">
                        <h3 className="text-md font-medium text-text-primary">Exportar Datos a CSV</h3>
                        <p className="text-sm text-text-secondary mt-1">
                        Guarda una copia de seguridad de todos tus movimientos en un archivo CSV, compatible con Excel y Google Sheets.
                        </p>
                    </div>
                    <button
                    onClick={exportToCSV}
                    className="px-6 py-3 bg-subtle-button-bg text-subtle-button-text font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-subtle-button-hover-bg transition-all flex items-center justify-center flex-shrink-0"
                    >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Descargar Archivo CSV
                    </button>
                </div>

                <div className="bg-surface p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center">
                    <div className="flex-grow mb-4 md:mb-0 md:mr-6">
                        <h3 className="text-md font-medium text-text-primary">Importar Datos Hormiga</h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Carga tus movimientos desde un archivo CSV. Esto reemplazará todos los datos actuales en este dispositivo.
                        </p>
                        {importError && <p className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg">{importError}</p>}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".csv,text/csv"
                        className="hidden"
                    />
                    <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-subtle-button-bg text-subtle-button-text font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-subtle-button-hover-bg transition-all flex items-center justify-center flex-shrink-0"
                    >
                    <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                    Seleccionar Archivo
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
