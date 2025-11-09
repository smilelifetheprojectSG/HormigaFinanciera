import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-background/90 backdrop-blur-sm sticky top-0 z-10 w-full py-5 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark">
              Hormiga Financiera
            </h1>
            <p className="text-text-secondary text-sm md:text-base">Tu asistente personal de finanzas</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-secondary hover:bg-subtle-button-hover-bg transition-colors"
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};