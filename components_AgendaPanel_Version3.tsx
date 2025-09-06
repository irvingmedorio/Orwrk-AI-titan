import React, { useState } from 'react';
import { useAgendaStore } from '../store/agendaStore';
import { useTaskStore } from '../store/taskStore';
import { useFileStore } from '../store/fileStore';

export function AgendaPanel() {
  const events = useAgendaStore(state => state.events);
  const addEvent = useAgendaStore(state => state.addEvent);
  const removeEvent = useAgendaStore(state => state.removeEvent);

  const tasks = useTaskStore(state => state.tasks);
  const files = useFileStore(state => state.files);
  const fetchFileContent = useFileStore(state => state.fetchFileContent);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [relatedFileId, setRelatedFileId] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  return (
    <div>
      <h2>Agenda de Proyecto</h2>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del evento" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
        <select value={relatedTaskId} onChange={e => setRelatedTaskId(e.target.value)}>
          <option value="">Sin tarea vinculada</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <select value={relatedFileId} onChange={e => setRelatedFileId(e.target.value)}>
          <option value="">Sin archivo vinculado</option>
          {files.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <button onClick={() => {
          addEvent({ title, description, date, relatedTaskId, relatedFileId });
          setTitle('');
          setDescription('');
          setDate('');
          setRelatedTaskId('');
          setRelatedFileId('');
        }}>Agregar evento</button>
      </div>
      <h3>Eventos próximos</h3>
      <ul>
        {events
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(ev => (
          <li key={ev.id}>
            <b>{ev.title}</b> - {ev.description} <br />
            <em>{new Date(ev.date).toLocaleString()}</em>
            {ev.relatedTaskId && <div>Tarea: {tasks.find(t => t.id === ev.relatedTaskId)?.title}</div>}
            {ev.relatedFileId && (
              <div>
                Archivo: <button onClick={() => { setSelectedFileId(ev.relatedFileId); fetchFileContent(ev.relatedFileId); }}>
                  {files.find(f => f.id === ev.relatedFileId)?.name}
                </button>
              </div>
            )}
            <button onClick={() => removeEvent(ev.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      {selectedFileId && (
        <div>
          <h4>Previsualización de archivo</h4>
          <div>
            <b>{files.find(f => f.id === selectedFileId)?.name}</b>
            <pre style={{ maxHeight: 200, overflow: 'auto' }}>
              {files.find(f => f.id === selectedFileId)?.content || "Cargando..."}
            </pre>
            <a href={files.find(f => f.id === selectedFileId)?.url} target="_blank" rel="noopener noreferrer">
              Descargar archivo
            </a>
            <button onClick={() => setSelectedFileId(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}