
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const Welcome: React.FC = () => {
  const [userName, setUserName] = useLocalStorage<string | null>('userName', null);
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    const timeString = new Intl.DateTimeFormat('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/Madrid'
    }).format(time);

    // Usar Regex para reemplazar a. m. / p. m. manejando cualquier tipo de espacio (incluyendo espacios de no separación)
    return timeString
        .replace(/a\.\s*m\./gi, 'a.m.')
        .replace(/p\.\s*m\./gi, 'p.m.');
  }, [time]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      setUserName(trimmedName);
      setError('');
    } else {
      setError('Por favor, introduce tu nombre.');
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }, []); 

  if (!userName) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
        <div className="bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-scale-in">
          <h2 className="text-xl font-bold text-primary-dark mb-2">¡Bienvenido/a!</h2>
          <p className="text-text-secondary mb-6">Hola, ¿Cómo te llamas?</p>
          <form onSubmit={handleSaveName}>
            <div className="mb-4">
              <label htmlFor="username-input" className="sr-only">Tu nombre</label>
              <input
                id="username-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                placeholder="Escribe tu nombre aquí"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark shadow-sm hover:shadow-md transition-all">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fade-in-up flex flex-row justify-between items-end">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
        {greeting}, <span className="text-primary-dark">{userName}</span>!
      </h2>
      <div className="text-right">
          <p className="text-lg md:text-xl font-semibold text-text-secondary tabular-nums">
              {formattedTime}
          </p>
      </div>
    </div>
  );
};
