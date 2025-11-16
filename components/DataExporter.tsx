import React from 'react';
import { SavingEntry } from '../types';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';

interface DataExporterProps {
  savings: SavingEntry[];
}

export const DataExporter: React.FC<DataExporterProps> = ({ savings }) => {
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

    // Helper function to escape CSV values
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
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel compatibility

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

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-primary-dark mb-4">Opciones Adicionales</h2>
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
    </div>
  );
};