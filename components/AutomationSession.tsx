import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { AutomationCommand, AutomationCommandStatus } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

const getStatusColor = (status: AutomationCommandStatus): string => {
  switch (status) {
    case AutomationCommandStatus.PENDING: return 'bg-gray-500';
    case AutomationCommandStatus.EXECUTING: return 'bg-blue-500 animate-pulse';
    case AutomationCommandStatus.COMPLETED: return 'bg-green-500';
    case AutomationCommandStatus.FAILED: return 'bg-red-600';
    default: return 'bg-gray-700';
  }
};

const CommandRow: React.FC<{ command: AutomationCommand; isCurrent: boolean }> = ({ command, isCurrent }) => {
    const { t } = useTranslation();
    return (
        <div className={`p-2 rounded-md ${isCurrent ? 'bg-dark-accent ring-2 ring-dark-primary-foreground' : ''}`}>
            <div className="flex justify-between items-center">
                <span className="font-semibold capitalize">{command.type}</span>
                <Badge className={`text-white text-xs ${getStatusColor(command.status)}`}>{command.status}</Badge>
            </div>
            <p className="text-xs text-dark-muted-foreground truncate" title={command.selector || command.text}>
                {t('target')}: {command.selector || command.text || 'N/A'}
            </p>
        </div>
    );
};

const AutomationSession: React.FC = () => {
    const { t } = useTranslation();
    const { activeAutomationSession, endAutomationSession } = useAgentStore();

    if (!activeAutomationSession) return null;

    const { flow, currentCommandIndex, iframeUrl } = activeAutomationSession;
    const completedCommands = flow.commands.filter(c => c.status === AutomationCommandStatus.COMPLETED && c.result);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('liveSession')}</h2>
                    <p className="text-dark-muted-foreground">{flow.name}</p>
                </div>
                <Button onClick={endAutomationSession} variant="destructive">{t('endSession')}</Button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Left Panel: Command List */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{t('commandList')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {flow.commands.map((cmd, index) => (
                            <CommandRow key={index} command={cmd} isCurrent={index === currentCommandIndex} />
                        ))}
                    </CardContent>
                </Card>
                {/* Center and Right Panel */}
                <div className="lg:col-span-2 grid grid-rows-2 gap-4 min-h-0">
                     {/* Center Panel: Browser View */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{t('browserView')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                           {iframeUrl ? (
                                <iframe
                                    src={iframeUrl}
                                    sandbox="allow-scripts allow-same-origin"
                                    className="w-full h-full border border-dark-border rounded-md"
                                    title="Simulated Browser"
                                ></iframe>
                           ) : (
                                <div className="w-full h-full flex items-center justify-center bg-dark-background rounded-md">
                                    <p className="text-dark-muted-foreground">Waiting for navigate command...</p>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                     {/* Right Panel: Logs & Data */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{t('logsAndData')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto font-mono text-xs pr-2 space-y-2">
                           {completedCommands.length > 0 ? (
                                completedCommands.map((cmd, index) => (
                                    <div key={index}>
                                        <span className="text-green-400 font-bold">{`[${cmd.type.toUpperCase()}] > `}</span>
                                        <span className="text-dark-foreground whitespace-pre-wrap">{cmd.result}</span>
                                    </div>
                                ))
                           ) : (
                                <p className="text-dark-muted-foreground font-sans">No data extracted yet.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AutomationSession;
