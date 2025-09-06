import React, { useState } from 'react';
import { useVoiceAgentStore } from '../store/voiceAgentStore';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import { sendVoiceAgentWebhook } from '../utils/webhook';

export function VoiceAgentBusinessPanel() {
  const sessions = useVoiceAgentStore(state => state.sessions);
  const activeSessionId = useVoiceAgentStore(state => state.activeSessionId);
  const startSession = useVoiceAgentStore(state => state.startSession);
  const acceptSession = useVoiceAgentStore(state => state.acceptSession);
  const advanceStep = useVoiceAgentStore(state => state.advanceStep);
  const markStepDone = useVoiceAgentStore(state => state.markStepDone);
  const completeSession = useVoiceAgentStore(state => state.completeSession);

  const createTask = useTaskStore(state => state.createTask);
  const completeTask = useTaskStore(state => state.completeTask);
  const tasks = useTaskStore(state => state.tasks);

  const pushNotification = useNotificationStore(state => state.pushNotification);

  const [goal, setGoal] = useState('');
  const [advice, setAdvice] = useState('');
  const [notes, setNotes] = useState('');

  const session = sessions.find(s => s.id === activeSessionId);

  return (
    <div>
      <h2>Agente Voice: Negocios Digitales</h2>
      {!session && (
        <div>
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="¿Cuál es el objetivo de negocio? (Ej: vender un curso, lanzar tienda, etc.)"
          />
          <button onClick={() => startSession(goal)}>Iniciar proceso</button>
        </div>
      )}
      {session && !session.acceptedByUser && (
        <div>
          <h4>Propuesta de objetivo:</h4>
          <div>{session.goal}</div>
          <button onClick={() => acceptSession(session.id)}>Aceptar y empezar</button>
        </div>
      )}
      {session && session.acceptedByUser && session.status === 'Running' && (
        <div>
          <h4>Paso actual: {session.currentStep}</h4>
          <textarea
            value={advice}
            onChange={e => setAdvice(e.target.value)}
            placeholder="Sugerencia experta para este paso"
          />
          <button
            onClick={async () => {
              advanceStep(session.id, advice, createTask, msg => pushNotification('info', msg), sendVoiceAgentWebhook);
              setAdvice('');
            }}
          >
            Siguiente paso (se genera tarea y webhook)
          </button>
          <div>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notas o evidencia de ejecución"
            />
            <button onClick={() => {
              markStepDone(session.id, session.currentStep, notes);
              const stepMetric = session.metrics[session.currentStep];
              if (stepMetric?.taskId) completeTask(stepMetric.taskId);
              pushNotification('success', `Paso "${session.currentStep}" completado`);
              setNotes('');
            }}>
              Marcar paso/tarea como completado
            </button>
          </div>
          <h5>Historial:</h5>
          <ul>
            {session.history.map((h, i) => (
              <li key={i}>
                <b>{h.step}:</b> {h.advice} <em>{h.timestamp}</em>
              </li>
            ))}
          </ul>
          <h5>Tareas generadas:</h5>
          <ul>
            {Object.entries(session.metrics).map(([step, m]) =>
              m.taskId ? (
                <li key={m.taskId}>
                  {tasks.find(t => t.id === m.taskId)?.title} - {tasks.find(t => t.id === m.taskId)?.status}
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
      {session && session.status === 'Completed' && (
        <div>
          <h4>¡Emprendimiento completado!</h4>
          <ul>
            {Object.entries(session.metrics).map(([step, data]) =>
              data.completed ? (
                <li key={step}>
                  <b>{step}:</b> {data.notes}
                </li>
              ) : null
            )}
          </ul>
          <button onClick={() => completeSession(session.id)}>Cerrar proceso</button>
        </div>
      )}
    </div>
  );
}