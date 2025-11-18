
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { WalletIcon } from './icons/WalletIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { PlusIcon } from './icons/PlusIcon';

type View = 'home' | 'movements' | 'analysis' | 'settings';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary-light'}`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="text-[11px] font-medium mt-0.5">{label}</span>
  </button>
);

interface BottomNavbarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onAddClick: () => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeView, onNavigate, onAddClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-40" role="navigation" aria-label="Navegación principal">
      {/* Background with blur and shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-lg border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
          <NavItem icon={<HomeIcon className="w-6 h-6" />} label="Inicio" isActive={activeView === 'home'} onClick={() => onNavigate('home')} />
          <NavItem icon={<WalletIcon className="w-6 h-6" />} label="Movimientos" isActive={activeView === 'movements'} onClick={() => onNavigate('movements')} />
          
          {/* Placeholder for FAB to create space */}
          <div className="w-16 h-16" aria-hidden="true"></div>

          <NavItem icon={<ChartBarIcon className="w-6 h-6" />} label="Análisis" isActive={activeView === 'analysis'} onClick={() => onNavigate('analysis')} />
          <NavItem icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />} label="Ajustes" isActive={activeView === 'settings'} onClick={() => onNavigate('settings')} />
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onAddClick}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-full text-white flex items-center justify-center shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-light"
        aria-label="Añadir nuevo movimiento"
      >
        <PlusIcon className="w-8 h-8" />
      </button>
    </nav>
  );
};
