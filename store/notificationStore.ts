import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface MeetingReminder {
  id: string;
  title: string;
  time: string; // ISO string
}

interface NotificationState {
  notifications: Notification[];
  reminders: MeetingReminder[];
  pushNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  addReminder: (title: string, time: string) => void;
  removeReminder: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  reminders: [],
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
  addReminder: (title, time) => set((state) => ({
    reminders: [
      ...state.reminders,
      { id: `rem-${Date.now()}`, title, time },
    ],
  })),
  removeReminder: (id) => set((state) => ({
    reminders: state.reminders.filter(r => r.id !== id),
  })),
}));
