export type VoiceBusinessStep =
  | 'Detectar oportunidad'
  | 'Validar mercado'
  | 'Diseñar oferta MVP'
  | 'Estrategia de adquisición'
  | 'Primeras ventas'
  | 'Iterar producto'
  | 'Escalar ingresos';

export interface VoiceBusinessSession {
  id: string;
  goal: string;
  status: 'Draft' | 'Running' | 'Completed' | 'Failed';
  currentStep: VoiceBusinessStep;
  history: { step: VoiceBusinessStep; advice: string; timestamp: string }[];
  acceptedByUser: boolean;
  metrics: { [step in VoiceBusinessStep]?: { completed: boolean; notes?: string; taskId?: string } };
  createdAt: string;
  updatedAt: string;
}