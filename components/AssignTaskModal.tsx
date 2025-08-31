import React, { useState, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { AgentName, FilePreview, ScheduledTask, TaskStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FileIcon, TrashIcon } from './icons';
import { useTranslation } from '../lib/i18n';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fileToDataURL = (file: File): Promise<FilePreview> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        content: reader.result as string,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose }) => {
    const { addScheduledTask, agents } = useAgentStore();
    const { t } = useTranslation();
    const allAgents = agents.map(a => a.name);

    const [description, setDescription] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<AgentName[]>([]);
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    const resetForm = () => {
        setDescription('');
        setSelectedAgents([]);
        setPriority('Medium');
        setEstimatedTime('');
        setFiles([]);
        setError('');
    };

    const handleAgentToggle = (agent: AgentName) => {
        setSelectedAgents(prev => 
            prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
        );
    };

    const handleSubmit = async () => {
        if (!description.trim() || selectedAgents.length === 0) {
            setError(t('errorMandatoryFields'));
            return;
        }

        const filePreviews = await Promise.all(files.map(fileToDataURL));
        
        const newTask: ScheduledTask = {
            id: `task-${Date.now()}`,
            name: description,
            assignedAgents: selectedAgents,
            status: TaskStatus.Pending,
            priority: priority,
            scheduledTime: new Date().toISOString(),
            estimatedTime: estimatedTime || 'N/A',
            files: filePreviews,
        };
        
        addScheduledTask(newTask);
        resetForm();
        onClose();
    };
    
    const onFileSelect = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        }
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        onFileSelect(e.dataTransfer.files);
    };

    const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <CardHeader>
                    <CardTitle>{t('assignNewTask')}</CardTitle>
                    <CardDescription>{t('assignNewTaskDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="space-y-2">
                        <label className="font-medium">{t('taskDescription')} <span className="text-red-500">*</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('taskDescriptionPlaceholder')}
                            className="w-full min-h-[100px] p-2 bg-dark-background border border-dark-input rounded-md"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="font-medium">{t('selectAgents')} <span className="text-red-500">*</span></label>
                         <div className="grid grid-cols-2 gap-2 p-2 border border-dark-input rounded-md">
                            {allAgents.map(agent => (
                                <label key={agent} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedAgents.includes(agent)} onChange={() => handleAgentToggle(agent)} className="form-checkbox h-4 w-4 text-dark-primary-foreground bg-dark-input border-dark-border rounded" />
                                    <span>{agent}</span>
                                </label>
                            ))}
                         </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-medium">{t('priority')}</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full p-2 bg-dark-background border border-dark-input rounded-md">
                                <option value="Low">{t('low')}</option>
                                <option value="Medium">{t('medium')}</option>
                                <option value="High">{t('high')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium">{t('estimatedTime')}</label>
                            <Input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder={t('estimatedTimePlaceholder')} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="font-medium">{t('attachFiles')}</label>
                        <input type="file" ref={fileInputRef} onChange={e => onFileSelect(e.target.files)} multiple className="hidden" />
                        <div 
                            onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-dark-primary-foreground bg-dark-accent' : 'border-dark-border hover:border-dark-muted-foreground'}`}
                        >
                            <p className="text-dark-muted-foreground">{t('dragAndDrop')}</p>
                        </div>
                         {files.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {files.map((file, index) => (
                                    <div key={index} className="relative group bg-dark-secondary p-2 rounded-lg">
                                        {file.type.startsWith("image/") ? (
                                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-20 object-cover rounded"/>
                                        ) : (
                                            <div className="w-full h-20 flex flex-col items-center justify-center rounded"><FileIcon /></div>
                                        )}
                                        <p className="text-xs truncate mt-1">{file.name}</p>
                                        <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="flex justify-end space-x-4 p-4 border-t border-dark-border">
                    <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={handleSubmit}>{t('createTask')}</Button>
                </div>
            </Card>
        </div>
    );
};

export default AssignTaskModal;