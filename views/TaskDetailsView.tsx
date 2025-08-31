import React, { useState, useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import { View, TaskStatus, TaskLog } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PauseIcon, PlayIcon, StopIcon } from '../components/icons';
import { useTranslation } from '../lib/i18n';
import { Input } from '../components/ui/Input';

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Pending: return 'bg-yellow-600';
    case TaskStatus.Running: return 'bg-blue-500';
    case TaskStatus.Completed: return 'bg-green-500';
    case TaskStatus.Failed: return 'bg-red-600';
    case TaskStatus.Paused: return 'bg-gray-500';
    default: return 'bg-gray-700';
  }
};

const getLogLevelColor = (level: TaskLog['level']): string => {
    switch (level) {
        case 'INFO': return 'text-blue-400';
        case 'WARN': return 'text-yellow-400';
        case 'ERROR': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

const TaskDetailsView: React.FC = () => {
    const { selectedTaskId, scheduledTasks, setCurrentView, updateTaskStatus } = useAgentStore();
    const { t } = useTranslation();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLevels, setActiveLevels] = useState<Set<TaskLog['level']>>(
      new Set(['INFO', 'WARN', 'ERROR'])
    );
    
    const task = scheduledTasks.find(t => t.id === selectedTaskId);

    const toggleLevel = (level: TaskLog['level']) => {
      setActiveLevels(prev => {
        const newLevels = new Set(prev);
        if (newLevels.has(level)) {
          newLevels.delete(level);
        } else {
          newLevels.add(level);
        }
        return newLevels;
      });
    };

    const filteredLogs = useMemo(() => {
      if (!task?.logs) return [];
      return task.logs
        .filter(log => activeLevels.has(log.level))
        .filter(log =>
          log.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [task?.logs, activeLevels, searchQuery]);

    if (!task) {
        return (
            <div className="text-center">
                <p>{t('taskNotFound')}</p>
                <Button onClick={() => setCurrentView(View.ScheduledTasks)} className="mt-4">
                    {t('backToTasks')}
                </Button>
            </div>
        );
    }
    
    const handlePause = () => updateTaskStatus(task.id, TaskStatus.Paused);
    const handleResume = () => updateTaskStatus(task.id, TaskStatus.Running);
    const handleCancel = () => updateTaskStatus(task.id, TaskStatus.Failed);

    const handleActivateDeactivate = () => {
        if (task.status === TaskStatus.Running || task.status === TaskStatus.Pending) {
            updateTaskStatus(task.id, TaskStatus.Paused); // Deactivate
        } else {
            updateTaskStatus(task.id, TaskStatus.Running); // Activate
        }
    };

    return (
        <div className="space-y-6">
            <Button onClick={() => setCurrentView(View.ScheduledTasks)} variant="outline">
                &larr; {t('backToTasks')}
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                            <CardTitle className="text-2xl">{task.name}</CardTitle>
                            <CardDescription>{t('taskId')}: {task.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className={`text-white text-base px-4 py-1 ${getStatusColor(task.status)}`}>
                                {task.status}
                            </Badge>
                             <div className="flex space-x-2">
                                { (task.status !== TaskStatus.Completed && task.status !== TaskStatus.Failed) && 
                                <>
                                    <Button size="default" variant="secondary" onClick={handleActivateDeactivate}>
                                        { (task.status === TaskStatus.Running || task.status === TaskStatus.Pending) ? 
                                            <><PauseIcon className="h-4 w-4 mr-2" />{t('deactivate')}</> : 
                                            <><PlayIcon className="h-4 w-4 mr-2" />{t('activate')}</>
                                        }
                                    </Button>
                                    <Button size="default" variant="destructive" onClick={handleCancel}>
                                        <StopIcon className="h-4 w-4 mr-2" />{t('cancel')}
                                    </Button>
                                </>
                                }
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-dark-muted-foreground">{t('priority')}</p>
                            <p className="font-semibold">{task.priority}</p>
                        </div>
                        <div>
                            <p className="text-dark-muted-foreground">{t('assignedAgents')}</p>
                            <p className="font-semibold">{task.assignedAgents.join(', ')}</p>
                        </div>
                         <div>
                            <p className="text-dark-muted-foreground">{t('scheduledTime')}</p>
                            <p className="font-semibold">{new Date(task.scheduledTime).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-dark-muted-foreground">{t('estimatedTime')}</p>
                            <p className="font-semibold">{task.estimatedTime}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('taskLogsHistory')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <Input 
                            placeholder={t('searchLogsPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                           {(['INFO', 'WARN', 'ERROR'] as const).map(level => (
                               <Button
                                   key={level}
                                   variant={activeLevels.has(level) ? 'secondary' : 'outline'}
                                   onClick={() => toggleLevel(level)}
                                   className="w-full sm:w-auto"
                               >
                                   {level}
                               </Button>
                           ))}
                        </div>
                    </div>
                    <div className="space-y-4 font-mono text-xs max-h-96 overflow-y-auto pr-2">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <div key={`${log.timestamp}-${index}`} className="flex items-start">
                                    <span className="text-dark-muted-foreground mr-4">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={`font-bold w-12 ${getLogLevelColor(log.level)}`}>{`[${log.level}]`}</span>
                                    <p className="flex-1 text-dark-foreground whitespace-pre-wrap">{log.message}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-dark-muted-foreground text-sm font-sans">
                                {task.logs && task.logs.length > 0 ? t('noMatchingLogs') : t('noLogs')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaskDetailsView;