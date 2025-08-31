import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import AgentStatusCard from '../components/AgentStatusCard';
import MetricCard from '../components/MetricCard';
import { CpuIcon, RamIcon, UserPlusIcon } from '../components/icons';
import RealtimeChart from '../components/RealtimeChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTranslation } from '../lib/i18n';
import DeactivateAgentModal from '../components/DeactivateAgentModal';
import { Agent, AgentName } from '../types';
import { Button } from '../components/ui/Button';
import AgentEditorModal from '../components/AgentEditorModal';

const DashboardView: React.FC = () => {
  const { agents, systemMetrics, llmMetrics } = useAgentStore();
  const { t } = useTranslation();
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [agentToDeactivate, setAgentToDeactivate] = useState<AgentName | null>(null);

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);

  const handleOpenDeactivateModal = (agentName: AgentName) => {
    setAgentToDeactivate(agentName);
    setIsDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setAgentToDeactivate(null);
  };

  const handleOpenEditorModal = (agent: Agent | null) => {
    setAgentToEdit(agent);
    setIsEditorModalOpen(true);
  };

  const handleCloseEditorModal = () => {
    setAgentToEdit(null);
    setIsEditorModalOpen(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('agentDashboard')}</h2>
          <p className="text-dark-muted-foreground">{t('agentDashboardDesc')}</p>
        </div>
        <Button onClick={() => handleOpenEditorModal(null)}>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          {t('addAgent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentStatusCard 
            key={agent.name} 
            agent={agent} 
            onDeactivate={handleOpenDeactivateModal}
            onEdit={() => handleOpenEditorModal(agent)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard title={t('cpuUsage')} value={`${systemMetrics.cpu.toFixed(1)}%`} icon={<CpuIcon />} />
         <MetricCard title={t('ramUsage')} value={`${systemMetrics.ram.toFixed(1)}%`} icon={<RamIcon />} />
         <MetricCard title={t('llmPrefill')} value={`${llmMetrics.prefillTokensPerSecond.toFixed(0)} tok/s`} icon={<CpuIcon />} />
         <MetricCard title={t('llmDecode')} value={`${llmMetrics.decodeTokensPerSecond.toFixed(0)} tok/s`} icon={<CpuIcon />} />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>{t('systemPerformance')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeChart dataPoint={systemMetrics.cpu} title={t('cpuUsage')} strokeColor="#8884d8" yAxisLabel="%" dataKey="cpu" />
          <RealtimeChart dataPoint={systemMetrics.ram} title={t('ramUsage')} strokeColor="#82ca9d" yAxisLabel="%" dataKey="ram"/>
        </CardContent>
      </Card>

      {isDeactivateModalOpen && agentToDeactivate && (
        <DeactivateAgentModal 
          agentName={agentToDeactivate} 
          onClose={handleCloseDeactivateModal} 
        />
      )}

      {isEditorModalOpen && (
        <AgentEditorModal
          agent={agentToEdit}
          onClose={handleCloseEditorModal}
        />
      )}
    </div>
  );
};

export default DashboardView;