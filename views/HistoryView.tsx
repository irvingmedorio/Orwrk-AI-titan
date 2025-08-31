import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { ChatIcon, TrashIcon } from '../components/icons';
import { Badge } from '../components/ui/Badge';
import { ProjectStatus } from '../types';

const getProjectStatusColor = (status: ProjectStatus): string => {
    switch (status) {
        case ProjectStatus.InProgress: return 'bg-blue-500';
        case ProjectStatus.Completed: return 'bg-green-500';
        case ProjectStatus.Failed: return 'bg-red-600';
        default: return 'bg-gray-700';
    }
};

const HistoryView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'chat' | 'projects'>('chat');
    const { chatHistory, projects, deleteChatSession, setConfirmation } = useAgentStore();

    const handleDeleteChat = (sessionId: string, sessionTitle: string) => {
        setConfirmation({
            isActive: true,
            message: `${t('deleteConfirmationMessage')} "${sessionTitle}"?`,
            onConfirm: () => {
                deleteChatSession(sessionId);
                useAgentStore.getState().setConfirmation({ isActive: false, message: '', onConfirm: () => {}, onReject: () => {} });
            },
            onReject: () => {
                useAgentStore.getState().setConfirmation({ isActive: false, message: '', onConfirm: () => {}, onReject: () => {} });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('historyTitle')}</h2>
                <p className="text-dark-muted-foreground">{t('historyDesc')}</p>
            </div>

            <div className="flex space-x-2 border-b-2 border-dark-border">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('chat')}
                    className={`rounded-b-none border-b-2 ${activeTab === 'chat' ? 'border-dark-primary-foreground text-dark-primary-foreground' : 'border-transparent text-dark-muted-foreground'}`}
                >
                    {t('chatHistory')}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('projects')}
                    className={`rounded-b-none border-b-2 ${activeTab === 'projects' ? 'border-dark-primary-foreground text-dark-primary-foreground' : 'border-transparent text-dark-muted-foreground'}`}
                >
                    {t('projects')}
                </Button>
            </div>

            {activeTab === 'chat' && (
                <div className="space-y-4">
                    {chatHistory.map(session => (
                        <Card key={session.id} className="flex items-center justify-between p-4 hover:bg-dark-accent transition-colors">
                            <div className="flex items-center space-x-4">
                                <ChatIcon />
                                <div>
                                    <p className="font-semibold">{session.title}</p>
                                    <p className="text-sm text-dark-muted-foreground">
                                        {new Date(session.timestamp).toLocaleString()} &bull; {t('model')}: {session.model}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteChat(session.id, session.title)}>
                                <TrashIcon />
                                <span className="sr-only">{t('deleteChat')}</span>
                            </Button>
                        </Card>
                    ))}
                    {chatHistory.length === 0 && <p className="text-center text-dark-muted-foreground py-8">{t('noChatHistory')}</p>}
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{project.name}</CardTitle>
                                    <Badge className={`text-white ${getProjectStatusColor(project.status)}`}>{project.status}</Badge>
                                </div>
                                <CardDescription className="text-xs pt-1">{t('projectStartDate')}: {new Date(project.startDate).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-semibold">{t('agentsInvolved')}</h4>
                                    <p className="text-sm text-dark-muted-foreground">{project.assignedAgents.join(', ')}</p>
                                </div>
                                <div className="flex justify-end pt-2">
                                     <Button variant="outline" size="sm">{t('viewDetails')}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {projects.length === 0 && <p className="text-center text-dark-muted-foreground py-8 col-span-full">{t('noProjects')}</p>}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
