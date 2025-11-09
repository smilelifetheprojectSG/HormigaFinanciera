import React from 'react';
import type { Notification as NotificationType } from '../hooks/useNotifications';
import { Notification } from './Notification';

interface NotificationContainerProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
      <div className="w-full flex flex-col items-center space-y-3 sm:items-end">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};
