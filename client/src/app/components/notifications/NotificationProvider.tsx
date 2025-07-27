'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from './NotificationBanner';

type Notification = {
  message: string;
  error?: boolean;
};

type NotificationContextType = {
  notify: (notification: Notification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((n: Notification) => {
    setNotification(n);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <NotificationBanner
          message={notification.message}
          error={notification.error}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}
