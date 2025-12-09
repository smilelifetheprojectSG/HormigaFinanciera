
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { WalletIcon } from './icons/WalletIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

type View = 'home' | 'movements' | 'analysis' | 'settings';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isAction?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, isAction }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors duration-200 ${
      isActive 
        ? 'text-primary' 
        : isAction
          ? 'text-primary hover:text-primary-dark'
          : 'text-text-secondary hover:text-text-primary'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className={`text-[10px] font-medium mt-1 leading-none ${isActive ? 'font-semibold' : ''}`}>{label}</span>
  </button>
);

interface BottomNavbarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onAddClick: () => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeView, onNavigate, onAddClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-between items-center h-16 max-w-lg mx-auto px-1">
        <NavItem 
          icon={<HomeIcon className="w-6 h-6" />} 
          label="Inicio" 
          isActive={activeView === 'home'} 
          onClick={() => onNavigate('home')} 
        />
        <NavItem 
          icon={<WalletIcon className="w-6 h-6" />} 
          label="Movimientos" 
          isActive={activeView === 'movements'} 
          onClick={() => onNavigate('movements')} 
        />
        
        <NavItem 
          icon={<PlusCircleIcon className="w-9 h-9" />} 
          label="Añadir" 
          isActive={false} 
          onClick={onAddClick}
          isAction={true}
        />

        <NavItem 
          icon={<ChartBarIcon className="w-6 h-6" />} 
          label="Análisis" 
          isActive={activeView === 'analysis'} 
          onClick={() => onNavigate('analysis')} 
        />
        <NavItem 
          icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />} 
          label="Ajustes" 
          isActive={activeView === 'settings'} 
          onClick={() => onNavigate('settings')} 
        />
      </div>
    </nav>
  );
};
