import React, { useState, useEffect, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { Agent, AgentName, EditableAgent } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useTranslation } from '../lib/i18n';
import { TrashIcon } from './icons';

interface AgentEditorModalProps {
  agent: Agent | null;
  onClose: () => void;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({ agent, onClose }) => {
    const { agents, addAgent, editAgent, deleteAgent, setConfirmation } = useAgentStore();
    const { t } = useTranslation();
    
    const [formData, setFormData] = useState<EditableAgent>({
        name: agent?.name || '',
        task: agent?.task || '',
        modelFile: null,
    });
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!agent;

    useEffect(() => {
        if (agent) {
            setFormData({ name: agent.name, task: agent.task, modelFile: null });
        } else {
            setFormData({ name: '', task: '', modelFile: null });
        }
        setError('');
    }, [agent]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.gguf')) {
                setFormData({ ...formData, modelFile: file });
                setError('');
            } else {
                setError(t('invalidFileType'));
                event.target.value = ''; // Clear the input
            }
        }
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setError(t('errorAgentName'));
            return;
        }

        if (isEditMode) {
            editAgent(agent.name, { task: formData.task });
        } else {
            if (agents.some(a => a.name.toLowerCase() === formData.name.toLowerCase())) {
                setError(t('errorAgentExists', formData.name));
                return;
            }
            addAgent(formData);
        }
        onClose();
    };
    
    const handleDelete = () => {
        if (!agent) return;
        setConfirmation({
            isActive: true,
            message: t('confirmDeleteAgent', agent.name),
            onConfirm: () => {
                deleteAgent(agent.name);
                onClose();
                useAgentStore.getState().setConfirmation({ isActive: false, message: '', onConfirm: () => {}, onReject: () => {} });
            },
            onReject: () => {
                useAgentStore.getState().setConfirmation({ isActive: false, message: '', onConfirm: () => {}, onReject: () => {} });
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{isEditMode ? t('editAgent') : t('addAgent')}</CardTitle>
                    <CardDescription>{isEditMode ? t('editAgentDesc') : t('addAgentDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <div className="space-y-2">
                        <label className="font-medium">{t('agentName')}</label>
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('agentNamePlaceholder')}
                            disabled={isEditMode}
                        />
                    </div>

                     <div className="space-y-2">
                        <label className="font-medium">{t('initialTask')}</label>
                        <Input 
                            value={formData.task} 
                            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                            placeholder={t('initialTaskPlaceholder')}
                        />
                    </div>
                    
                    {!isEditMode && (
                        <div className="space-y-2">
                            <label className="font-medium">{t('customGGUFModel')}</label>
                             <p className="text-sm text-dark-muted-foreground">{t('ggufModelDesc')}</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".gguf" className="hidden" />
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    {t('uploadGGUF')}
                                </Button>
                                <div className="flex-1 text-sm text-dark-muted-foreground truncate p-2 border border-dark-input rounded-md">
                                    {formData.modelFile ? (
                                        <div className="flex justify-between items-center">
                                            <span>{formData.modelFile.name}</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setFormData({...formData, modelFile: null})}>
                                                <TrashIcon />
                                            </Button>
                                        </div>
                                    ) : t('noFileSelected')}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <div className="flex justify-between items-center p-4 border-t border-dark-border">
                    <div>
                        {isEditMode && (
                             <Button variant="destructive" onClick={handleDelete}>{t('deleteAgent')}</Button>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {isEditMode ? t('saveChanges') : t('createAgent')}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AgentEditorModal;
