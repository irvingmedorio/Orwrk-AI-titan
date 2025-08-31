import React, { useState, useEffect } from 'react';
import { Agent, AgentName, AgentStatus } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge, getStatusColor } from './ui/Badge';
import { Button } from './ui/Button';
import { PowerIcon, PencilIcon, CodeIcon } from './icons';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';

interface AgentStatusCardProps {
  agent: Agent;
  onDeactivate: (agentName: AgentName) => void;
  onEdit: (agent: Agent) => void;
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent, onDeactivate, onEdit }) => {
  const { toggleAgentActivation } = useAgentStore();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState('');

  const isInactive = agent.status === AgentStatus.Inactive;

  useEffect(() => {
    let interval: number | undefined;
    if (isInactive && agent.reactivationTime) {
      interval = window.setInterval(() => {
        const timeLeft = new Date(agent.reactivationTime!).getTime() - Date.now();
        if (timeLeft <= 0) {
          setCountdown('');
          clearInterval(interval);
        } else {
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
          const minutes = Math.floor((timeLeft / 1000 / 60) % 60).toString().padStart(2, '0');
          const seconds = Math.floor((timeLeft / 1000) % 60).toString().padStart(2, '0');
          setCountdown(`${hours}:${minutes}:${seconds}`);
        }
      }, 1000);
    } else {
      setCountdown('');
    }
    return () => clearInterval(interval);
  }, [agent.reactivationTime, isInactive]);

  const handleToggle = () => {
    if (isInactive) {
      toggleAgentActivation(agent.name);
    } else {
      onDeactivate(agent.name);
    }
  };

  return (
    <Card className={`transition-all ${isInactive ? 'filter grayscale' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{agent.name}</CardTitle>
          <div className="flex items-center">
            <Button size="icon" variant="ghost" onClick={() => onEdit(agent)}>
              <PencilIcon />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleToggle} className={`${isInactive ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}>
              <PowerIcon />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge className={`text-white mb-2 ${getStatusColor(agent.status)}`}>
          {agent.status}
        </Badge>
        {countdown && (
          <p className="text-xs text-yellow-400 animate-pulse mt-1">
            {t('reactivatingIn')} {countdown}
          </p>
        )}
        <p className="text-sm text-dark-muted-foreground truncate h-5 mt-1">{agent.task}</p>
        {agent.modelFile && (
            <div className="text-xs text-dark-muted-foreground mt-2 flex items-center gap-1">
                <CodeIcon />
                <span className="truncate">{agent.modelFile}</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentStatusCard;