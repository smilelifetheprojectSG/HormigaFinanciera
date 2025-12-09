
import React from 'react';

export const MoneyBagEuroIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* Nudo superior */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.5 5h-5L12 2z" />
    {/* Cuerpo de la bolsa */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 7c-3.5 0-5 3-5 7.5S8 22 12 22s7.5-3 7.5-7.5-1.5-7.5-5-7.5h-5z" />
    {/* Cuerda */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 7h5" />
    {/* Símbolo Euro */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 12.5h-3m3 2h-3m1.5-3.5a2.5 2.5 0 1 0 0 5" />
  </svg>
);
