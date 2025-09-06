import { create } from 'zustand';

export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  relatedTaskId?: string;
  relatedFileId?: string;
}

interface AgendaState {
  events: AgendaEvent[];
  addEvent: (event: Omit<AgendaEvent, 'id'>) => string;
  removeEvent: (id: string) => void;
}

export const useAgendaStore = create<AgendaState>((set) => ({
  events: [],
  addEvent: (event) => {
    const id = `agenda-${Date.now()}`;
    set(state => ({ events: [{ ...event, id }, ...state.events] }));
    return id;
  },
  removeEvent: (id) => set(state => ({
    events: state.events.filter(ev => ev.id !== id)
  })),
}));