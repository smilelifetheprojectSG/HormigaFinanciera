
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* Estrellas */}
    <path d="M12 1L13.5 4.5L17.2 4.8L14.4 7.2L15.3 10.8L12 8.8L8.7 10.8L9.6 7.2L6.8 4.8L10.5 4.5L12 1Z" />
    <path d="M5.5 6L6.2 7.8L8.1 8L6.7 9.2L7.2 11L5.5 10L3.8 11L4.3 9.2L2.9 8L4.8 7.8L5.5 6Z" />
    <path d="M18.5 6L19.2 7.8L21.1 8L19.7 9.2L20.2 11L18.5 10L16.8 11L17.3 9.2L15.9 8L17.8 7.8L18.5 6Z" />
    
    {/* Cuerpo del Trofeo */}
    <path d="M17 12V11H7V12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12Z" />
    {/* Asas */}
    <path d="M19 11H18V12C18 13.9 17.1 15.6 15.6 16.6C15.9 17.3 16 18.1 16 19V20H8V19C8 18.1 8.1 17.3 8.4 16.6C6.9 15.6 6 13.9 6 12V11H5C3.9 11 3 11.9 3 13C3 14.7 4.3 16 6 16.1V16.5C6 19.5 8.5 22 11.5 22H12.5C15.5 22 18 19.5 18 16.5V16.1C19.7 16 21 14.7 21 13C21 11.9 20.1 11 19 11ZM5 13C5 12.4 5.4 12 6 12V14C5.4 14 5 13.6 5 13ZM18 14V12C18.6 12 19 12.4 19 13C19 13.6 18.6 14 18 14Z" />
    {/* Base */}
    <path d="M8 21H16V23H8V21Z" />
  </svg>
);
