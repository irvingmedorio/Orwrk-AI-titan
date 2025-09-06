import { create } from 'zustand';
import { VoiceBusinessStep, VoiceBusinessSession } from '../agents/voiceAgentLogic';

const steps: VoiceBusinessStep[] = [
  'Detectar oportunidad',
  'Validar mercado',
  'Diseñar oferta MVP',
  'Estrategia de adquisición',
  'Primeras ventas',
  'Iterar producto',
  'Escalar ingresos',
];

interface VoiceAgentState {
  sessions: VoiceBusinessSession[];
  activeSessionId?: string;
  startSession: (goal: string) => string;
  acceptSession: (sessionId: string) => void;
  advanceStep: (
    sessionId: string,
    advice: string,
    createTask: (step: VoiceBusinessStep, advice: string) => string,
    notify: (msg: string) => void,
    webhook?: (payload: any) => void
  ) => void;
  markStepDone: (sessionId: string, step: VoiceBusinessStep, notes?: string) => void;
  completeSession: (sessionId: string) => void;
}

export const useVoiceAgentStore = create<VoiceAgentState>((set, get) => ({
  sessions: [],
  activeSessionId: undefined,
  startSession: (goal) => {
    const id = `voice-${Date.now()}`;
    const session: VoiceBusinessSession = {
      id,
      goal,
      status: 'Draft',
      currentStep: steps[0],
      history: [],
      acceptedByUser: false,
      metrics: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }));
    return id;
  },
  acceptSession: (sessionId) => set(state => ({
    sessions: state.sessions.map(s =>
      s.id === sessionId
        ? { ...s, status: 'Running', acceptedByUser: true }
        : s
    ),
    activeSessionId: sessionId,
  })),
  advanceStep: (sessionId, advice, createTask, notify, webhook) => set(state => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return state;
    const currentIndex = steps.indexOf(session.currentStep);
    const nextStep = steps[currentIndex + 1] ?? session.currentStep;
    const taskId = createTask(session.currentStep, advice);
    notify(`Tarea creada para el paso: ${session.currentStep}`);
    if (webhook) {
      webhook({ sessionId, step: session.currentStep, advice, taskId, timestamp: new Date().toISOString() });
    }
    return {
      sessions: state.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              currentStep: nextStep,
              history: [
                ...s.history,
                { step: session.currentStep, advice, timestamp: new Date().toISOString() },
              ],
              metrics: {
                ...s.metrics,
                [session.currentStep]: {
                  completed: false,
                  notes: advice,
                  taskId,
                },
              },
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    };
  }),
  markStepDone: (sessionId, step, notes) => set(state => ({
    sessions: state.sessions.map(s =>
      s.id === sessionId
        ? {
            ...s,
            metrics: {
              ...s.metrics,
              [step]: { ...(s.metrics[step] ?? {}), completed: true, notes },
            },
            updatedAt: new Date().toISOString(),
          }
        : s
    ),
  })),
  completeSession: (sessionId) => set(state => ({
    sessions: state.sessions.map(s =>
      s.id === sessionId
        ? { ...s, status: 'Completed', updatedAt: new Date().toISOString() }
        : s
    ),
    activeSessionId: undefined,
  })),
}));