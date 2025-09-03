import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { useTranslation } from '../lib/i18n';
import { TaskStatus } from '../types';

const AgentProgressPanel: React.FC = () => {
  const { agents, scheduledTasks } = useAgentStore();
  const { t } = useTranslation();

  const runningLogs = scheduledTasks
    .filter(task => task.status === TaskStatus.Running)
    .flatMap(task => task.logs.map(log => ({ ...log, agents: task.assignedAgents })));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('agentsAtWork')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <ul className="space-y-1 text-sm mb-4">
          {agents.map(agent => (
            <li key={agent.name} className="flex justify-between">
              <span>{agent.name}</span>
              <span className="text-dark-muted-foreground text-right ml-2 flex-1">{agent.task}</span>
            </li>
          ))}
        </ul>
        <h3 className="text-sm font-semibold mb-2">{t('progressLog')}</h3>
        <div className="bg-dark-secondary rounded p-2 h-40 overflow-y-auto text-xs space-y-1">
          {runningLogs.length === 0 ? (
            <p className="text-dark-muted-foreground">{t('noProgress')}</p>
          ) : (
            runningLogs.map((log, idx) => (
              <p key={idx}>
                {new Date(log.timestamp).toLocaleTimeString()} - {log.agents.join(', ')}: {log.message}
              </p>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentProgressPanel;
