import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import AutomationSession from '../components/AutomationSession';

const WebAutomationView: React.FC = () => {
    const { t } = useTranslation();
    const { 
        automationFlows, 
        activeAutomationSession, 
        startAutomationFlow,
        startAdHocAutomation,
    } = useAgentStore();
    const [url, setUrl] = useState('');

    const handleLaunch = () => {
        if (url.trim()) {
            startAdHocAutomation(url);
            setUrl('');
        }
    };

    if (activeAutomationSession) {
        return <AutomationSession />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('webAutomationTitle')}</h2>
                <p className="text-dark-muted-foreground">{t('webAutomationDesc')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('launchNewSession')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input 
                            placeholder={t('enterUrl')}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                        />
                        <Button onClick={handleLaunch}>{t('launch')}</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('recordedFlows')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {automationFlows.length > 0 ? (
                        automationFlows.map(flow => (
                            <Card key={flow.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{flow.name}</h3>
                                    <p className="text-sm text-dark-muted-foreground">{flow.description}</p>
                                </div>
                                <Button onClick={() => startAutomationFlow(flow.id)}>{t('runFlow')}</Button>
                            </Card>
                        ))
                    ) : (
                         <p className="text-center text-dark-muted-foreground py-8">{t('noFlows')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WebAutomationView;