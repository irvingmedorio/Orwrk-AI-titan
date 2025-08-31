import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { WebIntelligenceStatus } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

const getStatusColor = (status: WebIntelligenceStatus): string => {
  switch (status) {
    case WebIntelligenceStatus.PLANNING:
    case WebIntelligenceStatus.SEARCHING:
    case WebIntelligenceStatus.CRAWLING_EXTRACTING:
    case WebIntelligenceStatus.SYNTHESIZING:
        return 'bg-blue-500 animate-pulse';
    case WebIntelligenceStatus.COMPLETED: return 'bg-green-500';
    case WebIntelligenceStatus.FAILED: return 'bg-red-600';
    default: return 'bg-gray-700';
  }
};

const IntelligenceSession: React.FC = () => {
    const { t } = useTranslation();
    const { activeIntelligenceMission, endActiveMission } = useAgentStore();

    if (!activeIntelligenceMission) return null;

    const { query, status, progress, discoveredUrls, extractedInsights, finalReport } = activeIntelligenceMission;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('missionInProgress')}</h2>
                    <p className="text-dark-muted-foreground">{query}</p>
                </div>
                <Button onClick={() => endActiveMission(WebIntelligenceStatus.FAILED)} variant="destructive">{t('cancel')}</Button>
            </div>
            
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold">{t('missionStatus')}: {status}</p>
                        <Badge className={`text-white text-base px-4 py-1 ${getStatusColor(status)}`}>{Math.round(progress)}%</Badge>
                    </div>
                     <div className="w-full bg-dark-background rounded-full h-2.5">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                        ></div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>{t('discoveredUrls')}</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2 text-sm">
                        {discoveredUrls.length > 0 ? discoveredUrls.map((url, i) => (
                            <p key={i} className="text-blue-400 truncate">{url}</p>
                        )) : <p className="text-dark-muted-foreground">Searching...</p>}
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>{t('extractedInsights')}</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2 text-sm">
                         {extractedInsights.length > 0 ? extractedInsights.map((insight, i) => (
                            <p key={i} className="text-dark-foreground">- {insight}</p>
                        )) : <p className="text-dark-muted-foreground">Crawling & Extracting...</p>}
                    </CardContent>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader><CardTitle>{t('finalReport')}</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 text-sm">
                        {finalReport ? (
                            <div className="whitespace-pre-wrap font-mono text-xs" dangerouslySetInnerHTML={{ __html: finalReport.replace(/\*\*(.*?)\*\*/g, '<strong class="text-dark-foreground">$1</strong>') }} />
                        ) : (
                            <p className="text-dark-muted-foreground">Synthesizing...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default IntelligenceSession;
