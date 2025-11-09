import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = uuidv4();
    // Prevent duplicate notifications
    setNotifications(currentNotifications => {
        const isDuplicate = currentNotifications.some(n => n.title === notification.title && n.message === notification.message);
        if (isDuplicate) {
            return currentNotifications;
        }
        return [...currentNotifications, { ...notification, id }];
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(currentNotifications =>
      currentNotifications.filter(n => n.id !== id)
    );
  }, []);

  return { notifications, addNotification, dismissNotification };
};
