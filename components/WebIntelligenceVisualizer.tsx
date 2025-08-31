import React from 'react';
import { WebIntelligenceMission, WebIntelligenceStatus } from '../types';
import { useTranslation } from '../lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

interface WebIntelligenceVisualizerProps {
  state: WebIntelligenceMission;
}

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

const WebIntelligenceVisualizer: React.FC<WebIntelligenceVisualizerProps> = ({ state }) => {
  const { t } = useTranslation();
  const { status, progress, discoveredUrls, extractedInsights, finalReport } = state;

  return (
    <Card className="mt-2 bg-dark-background/50 border-dark-border">
      <CardHeader>
        <CardTitle className="text-base">{t('missionInProgress')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <p>{status}</p>
                <Badge className={`text-white text-xs ${getStatusColor(status)}`}>{Math.round(progress)}%</Badge>
            </div>
            <div className="w-full bg-dark-background rounded-full h-2">
                <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs max-h-48 overflow-y-auto">
            <div className="space-y-1">
                <h4 className="font-semibold text-sm">{t('discoveredUrls')}</h4>
                {discoveredUrls.length > 0 ? (
                    discoveredUrls.map((url, i) => <p key={i} className="text-blue-400 truncate">{url}</p>)
                ) : (
                    <p className="text-dark-muted-foreground italic">{t('searching')}...</p>
                )}
            </div>
             <div className="space-y-1">
                <h4 className="font-semibold text-sm">{t('extractedInsights')}</h4>
                {extractedInsights.length > 0 ? (
                    extractedInsights.map((insight, i) => <p key={i} className="text-dark-foreground">- {insight}</p>)
                ) : (
                    <p className="text-dark-muted-foreground italic">{t('crawlingExtracting')}...</p>
                )}
            </div>
        </div>

        {finalReport && (
            <div>
                 <h4 className="font-semibold text-sm mb-2">{t('finalReport')}</h4>
                 <div className="text-xs font-mono whitespace-pre-wrap p-2 bg-dark-background rounded-md max-h-48 overflow-y-auto">
                    {finalReport}
                 </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default WebIntelligenceVisualizer;