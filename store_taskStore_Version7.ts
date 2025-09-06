import { create } from 'zustand';

export interface BusinessTask {
  id: string;
  title: string;
  description: string;
  step: string;
  status: 'Pending' | 'InProgress' | 'Completed';
  createdAt: string;
  completedAt?: string;
}

interface TaskState {
  tasks: BusinessTask[];
  createTask: (step: string, advice: string) => string;
  completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  createTask: (step, advice) => {
    const id = `task-${Date.now()}`;
    const task: BusinessTask = {
      id,
      title: `Paso: ${step}`,
      description: advice,
      step,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    set(state => ({ tasks: [task, ...state.tasks] }));
    return id;
  },
  completeTask: (id) => set(state => ({
    tasks: state.tasks.map(t =>
      t.id === id
        ? { ...t, status: 'Completed', completedAt: new Date().toISOString() }
        : t
    ),
  })),
}));