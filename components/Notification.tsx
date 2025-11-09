import React, { useEffect, useState } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface NotificationProps {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircleIcon className="w-7 h-7 text-green-500" />,
  info: <InformationCircleIcon className="w-7 h-7 text-sky-500" />,
  warning: <ExclamationTriangleIcon className="w-7 h-7 text-amber-500" />,
  error: <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />,
};

const bgColors = {
  success: 'bg-green-50/80',
  info: 'bg-sky-50/80',
  warning: 'bg-amber-50/80',
  error: 'bg-red-50/80',
};

export const Notification: React.FC<NotificationProps> = ({ id, type, title, message, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setIsExiting(true);
        }, 7000); // Start exit animation after 7 seconds

        return () => {
            clearTimeout(timerId);
        };
    }, []);

    useEffect(() => {
        if (isExiting) {
            const timerId = setTimeout(() => onDismiss(id), 400); // Wait for animation to finish
            return () => clearTimeout(timerId);
        }
    }, [isExiting, onDismiss, id]);

    const handleDismiss = () => {
        setIsExiting(true);
    };
    
    const animationClass = isExiting 
        ? 'animate-fade-out' 
        : 'animate-slide-in-right';

    return (
        <div className={`w-full max-w-sm rounded-xl shadow-2xl backdrop-blur-md p-4 flex items-start space-x-4 ${bgColors[type]} ${animationClass} pointer-events-auto ring-1 ring-black ring-opacity-5`}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-text-primary">{title}</p>
                <p className="text-sm text-text-secondary mt-1">{message}</p>
            </div>
            <div className="flex-shrink-0">
                <button onClick={handleDismiss} className="p-1 rounded-full text-gray-400 hover:bg-gray-200/50 hover:text-gray-600 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
