
import React from 'react';

export const PiggyBankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* Moneda con Euro */}
    <circle cx="12" cy="5" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.5C13.5 3.5 12.5 3.5 12 4C11.5 4.5 11.5 5.5 12 6C12.5 6.5 13.5 6.5 13.5 6.5M10.5 4.5H13M10.5 5.5H13" />

    {/* Cuerpo del Cerdito */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12C19.8 12 20.5 12.3 21 12.8C21.6 13.4 21.8 14.2 21.5 15C21.1 16.2 19.9 17 18.7 17H7C5.3 17 4 15.7 4 14C4 13.2 4.3 12.4 4.8 11.9L6 10.5C6.3 10.2 6.7 10 7.1 10H16" />
    
    {/* Ranura */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 8H14" />
    
    {/* Patas */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17V20H10V17" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 17V20H17V17" />

    {/* Oreja y Ojo */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10L4 8L6.5 8.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 13.5C7.5 13.5 8 13 8.5 13.5" />

    {/* Cola */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 14C22.5 14 23 13 23 12" />
  </svg>
);
