
import React, { useState, useEffect } from 'react';
import { FingerPrintIcon } from './icons/FingerPrintIcon';
import { bufferDecode, bufferEncode } from '../utils/webauthn';

interface WebAuthnLoginProps {
  onLoginSuccess: () => void;
  shouldAttemptLogin: boolean;
}

const RP_NAME = 'Hormiga Financiera';

export const WebAuthnLogin: React.FC<WebAuthnLoginProps> = ({ onLoginSuccess, shouldAttemptLogin }) => {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Iniciando...');
  const [isLoading, setIsLoading] = useState(false);
  const [isCredentialStored, setIsCredentialStored] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);

  useEffect(() => {
    const checkSupportAndCredentials = () => {
      if (!navigator.credentials || !window.PublicKeyCredential) {
        setIsUnsupported(true);
        setError('Tu navegador no es compatible con el acceso por huella.');
        setStatus('');
        return;
      }

      const credentialId = localStorage.getItem('webauthn_credential_id');
      if (credentialId) {
        setIsCredentialStored(true);
        setStatus('Listo para iniciar sesión.');
      } else {
        setStatus('Configura tu acceso por huella.');
      }
    };
    checkSupportAndCredentials();
  }, []);
  
  useEffect(() => {
     if(isCredentialStored && shouldAttemptLogin) {
       handleLogin();
     }
  }, [isCredentialStored, shouldAttemptLogin]);

  const handleRegister = async () => {
    setError('');
    setIsLoading(true);
    setStatus('Preparando registro...');

    try {
      // 1. Generate challenge and user info
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: RP_NAME },
          user: {
            id: userId,
            name: `user@${window.location.hostname}`,
            displayName: 'Usuario de Hormiga Financiera',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
          attestation: 'direct',
        },
      });

      if (!credential) {
        throw new Error('No se pudo crear la credencial.');
      }
      
      const newCredential = credential as PublicKeyCredential;
      const credentialId = bufferEncode(newCredential.rawId);
      const userIdB64 = bufferEncode(userId);
      
      localStorage.setItem('webauthn_credential_id', credentialId);
      localStorage.setItem('webauthn_user_id', userIdB64);

      setStatus('¡Registro completado! Iniciando sesión...');
      onLoginSuccess();

    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err.name === 'NotAllowedError') {
        setError('Registro cancelado por el usuario.');
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.');
      }
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    setStatus('Esperando huella...');

    try {
      const credentialIdB64 = localStorage.getItem('webauthn_credential_id');
      if (!credentialIdB64) {
        throw new Error('No hay credenciales guardadas.');
      }
      
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            type: 'public-key',
            id: bufferDecode(credentialIdB64),
            transports: ['internal'],
          }],
          timeout: 60000,
          userVerification: 'required',
        },
      });
      
      if (!credential) {
        throw new Error('No se pudo obtener la credencial.');
      }

      setStatus('¡Acceso concedido!');
      onLoginSuccess();

    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.name === 'NotAllowedError') {
        setError('Inicio de sesión cancelado.');
        setStatus('Intenta de nuevo cuando quieras.');
      } else {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
        setStatus('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = isCredentialStored ? handleLogin : handleRegister;
  const buttonText = isCredentialStored ? 'Iniciar sesión con huella' : 'Activar acceso con huella';

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Hormiga Financiera
          </h1>
          <p className="text-text-secondary mt-2">Acceso rápido y seguro</p>
        </div>
        <div className="bg-surface p-8 rounded-xl shadow-2xl animate-fade-in-up">
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={handleClick}
              disabled={isLoading || isUnsupported}
              className="w-40 h-40 rounded-full bg-primary text-white flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:bg-primary-dark hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              aria-label={buttonText}
            >
              <FingerPrintIcon className="w-20 h-20" />
            </button>
            <button
                onClick={handleClick}
                disabled={isLoading || isUnsupported}
                className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-primary-dark transition-all disabled:bg-primary-light disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : buttonText}
            </button>
            <div className="h-10 text-center">
              {status && <p className="text-text-secondary">{status}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};