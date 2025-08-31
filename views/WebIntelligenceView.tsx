
import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import IntelligenceSession from '../components/IntelligenceSession';
import { Badge } from '../components/ui/Badge';
import { WebIntelligenceStatus } from '../types';

const getStatusColor = (status: WebIntelligenceStatus): string => {
    switch (status) {
        case WebIntelligenceStatus.COMPLETED: return 'bg-green-500';
        case WebIntelligenceStatus.FAILED: return 'bg-red-600';
        default: return 'bg-gray-700';
    }
};


const WebIntelligenceView: React.FC = () => {
    const { t } = useTranslation();
    const {
        // FIX: Access correct state from store
        webIntelligenceMissions,
        activeIntelligenceMission,
        startWebIntelligenceMission,
    } = useAgentStore();
    const [query, setQuery] = useState('');

    const handleLaunch = () => {
        if (query.trim()) {
            startWebIntelligenceMission(query);
            setQuery('');
        }
    };

    if (activeIntelligenceMission) {
        return <IntelligenceSession />;
    }

    return (
        <div className="space-y-6">
            <div>
                {/* FIX: Use correct translation keys */}
                <h2 className="text-3xl font-bold tracking-tight">{t('webIntelligenceTitle')}</h2>
                <p className="text-dark-muted-foreground">{t('webIntelligenceDesc')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('launchNewMission')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input
                            placeholder={t('enterMissionQuery')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                        />
                        <Button onClick={handleLaunch}>{t('launch')}</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('pastMissions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* FIX: Render webIntelligenceMissions instead of automationFlows */}
                    {webIntelligenceMissions.length > 0 ? (
                        webIntelligenceMissions.map(mission => (
                            <Card key={mission.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{mission.query}</h3>
                                        <p className="text-sm text-dark-muted-foreground">
                                            {new Date(mission.startDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge className={`text-white ${getStatusColor(mission.status)}`}>
                                        {mission.status}
                                    </Badge>
                                </div>
                                {mission.finalReport && (
                                     <div className="mt-4 pt-4 border-t border-dark-border text-sm text-dark-muted-foreground whitespace-pre-wrap font-mono">
                                        {mission.finalReport.substring(0, 300)}...
                                     </div>
                                )}
                            </Card>
                        ))
                    ) : (
                         <p className="text-center text-dark-muted-foreground py-8">{t('noMissions')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WebIntelligenceView;
