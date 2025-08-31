import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { ScheduledTask, TaskStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../lib/i18n';
import AssignTaskModal from '../components/AssignTaskModal';

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Pending:
      return 'bg-yellow-600';
    case TaskStatus.Running:
      return 'bg-blue-500 animate-pulse';
    case TaskStatus.Completed:
      return 'bg-green-500';
    case TaskStatus.Failed:
      return 'bg-red-600';
    case TaskStatus.Paused:
        return 'bg-gray-500';
    default:
      return 'bg-gray-700';
  }
};

const TaskRow: React.FC<{ task: ScheduledTask }> = ({ task }) => {
    const { selectTask } = useAgentStore();
    const { t } = useTranslation();
    return (
        <tr 
            className="border-b border-dark-border hover:bg-dark-accent cursor-pointer"
            onClick={() => selectTask(task.id)}
        >
            <td className="p-4 align-top">
                <div className="font-medium text-dark-foreground">{task.name}</div>
                <div className="text-sm text-dark-muted-foreground truncate max-w-xs">{task.id}</div>
            </td>
            <td className="p-4 align-top text-dark-muted-foreground">{task.assignedAgents.join(', ')}</td>
            <td className="p-4 align-top">
                <Badge className={`text-white ${getStatusColor(task.status)}`}>
                    {task.status}
                </Badge>
            </td>
            <td className="p-4 align-top text-dark-muted-foreground">{new Date(task.scheduledTime).toLocaleString()}</td>
            <td className="p-4 align-top">
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from firing
                            // Implement cancel logic here
                            console.log(`Cancelling task ${task.id}`);
                        }}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </td>
        </tr>
    );
};


const ScheduledTasksView: React.FC = () => {
  const { scheduledTasks } = useAgentStore();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('scheduledTasksTitle')}</h2>
          <p className="text-dark-muted-foreground">{t('scheduledTasksDesc')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>{t('assignNewTask')}</Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('taskQueue')}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-dark-muted-foreground uppercase bg-dark-secondary">
                        <tr>
                            <th scope="col" className="p-4">{t('taskName')}</th>
                            <th scope="col" className="p-4">{t('assignedAgents')}</th>
                            <th scope="col" className="p-4">{t('status')}</th>
                            <th scope="col" className="p-4">{t('scheduledTime')}</th>
                            <th scope="col" className="p-4">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scheduledTasks.length > 0 ? (
                            scheduledTasks.map(task => <TaskRow key={task.id} task={task} />)
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-dark-muted-foreground">
                                    {t('noTasks')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
      
      <AssignTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ScheduledTasksView;