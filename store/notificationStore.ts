import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  pushNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  pushNotification: (type, message) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        id: `notif-${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString(),
      },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
}));
