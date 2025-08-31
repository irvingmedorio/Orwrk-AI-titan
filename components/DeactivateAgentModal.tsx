import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { AgentName } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { useTranslation } from '../lib/i18n';

interface DeactivateAgentModalProps {
  agentName: AgentName;
  onClose: () => void;
}

const DeactivateAgentModal: React.FC<DeactivateAgentModalProps> = ({ agentName, onClose }) => {
    const { toggleAgentActivation } = useAgentStore();
    const { t } = useTranslation();

    const handleDeactivate = (durationMs?: number | 'indefinite') => {
        toggleAgentActivation(agentName, durationMs);
        onClose();
    };

    const options = [
        { label: t('15mins'), value: 15 * 60 * 1000 },
        { label: t('1hour'), value: 60 * 60 * 1000 },
        { label: t('8hours'), value: 8 * 60 * 60 * 1000 },
        { label: t('24hours'), value: 24 * 60 * 60 * 1000 },
        { label: t('indefinitely'), value: 'indefinite' },
    ] as const;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('deactivateAgent')}: {agentName}</CardTitle>
                    <CardDescription>{t('deactivateAgentDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="font-semibold">{t('deactivateFor')}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {options.map(option => (
                             <Button key={option.label} variant="outline" onClick={() => handleDeactivate(option.value)}>
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
                <div className="flex justify-end p-4 border-t border-dark-border">
                    <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                </div>
            </Card>
        </div>
    );
};

export default DeactivateAgentModal;