import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface FlashMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  flashMessage: FlashMessage | null;
  setFlashMessage: (message: FlashMessage | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'New answer to your question about React hooks',
      type: 'info',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
    },
    {
      id: '2',
      message: 'You earned 50 credits for helping with JavaScript!',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: false,
    },
  ]);
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const addNotification = (message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    darkMode,
    toggleDarkMode,
    notifications,
    addNotification,
    markNotificationRead,
    unreadCount,
    flashMessage,
    setFlashMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};