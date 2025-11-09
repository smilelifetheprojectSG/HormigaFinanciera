
import React, { useState } from 'react';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ahorro_secreto_2024');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulating a network request
    setTimeout(() => {
      // Hardcoded credentials for admin access
      if (username === 'admin' && password === 'ahorro_secreto_2024') {
        onLoginSuccess();
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
                 <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">
                    Hormiga Financiera
                </h1>
                <p className="text-text-secondary mt-2">Acceso de Administrador</p>
            </div>
            <div className="bg-surface p-8 rounded-xl shadow-2xl animate-fade-in-up">
                <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                            placeholder="admin"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-secondary mb-1"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                
                <div className="mt-8">
                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-primary-dark transition-all disabled:bg-primary-light disabled:cursor-not-allowed"
                    >
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </div>
                </form>
            </div>
        </div>
    </div>
  );
};