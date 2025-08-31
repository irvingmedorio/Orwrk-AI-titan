import React from 'react';
import { DeepReasoningState, DeepReasoningStage } from '../types';
import { useTranslation } from '../lib/i18n';
import { Card, CardContent } from './ui/Card';

interface DeepReasoningVisualizerProps {
  state: DeepReasoningState;
}

const DeepReasoningVisualizer: React.FC<DeepReasoningVisualizerProps> = ({ state }) => {
  const { t } = useTranslation();

  const stages = [
    { id: DeepReasoningStage.DECOMPOSING, label: t('decomposingProblem') },
    { id: DeepReasoningStage.EVALUATING, label: t('evaluatingHypotheses') },
    { id: DeepReasoningStage.SIMULATING, label: t('simulatingOutcomes') },
    { id: DeepReasoningStage.SYNTHESIZING, label: t('synthesizingSolution') },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === state.stage);

  return (
    <Card className="mt-2 bg-dark-background/50 border-dark-border">
      <CardContent className="pt-4 space-y-3">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex || state.isComplete;
          
          let progress = 0;
          if (isCompleted) progress = 100;
          if (isActive) progress = state.progress;

          return (
            <div key={stage.id} className="text-sm">
              <div className="flex justify-between items-center mb-1">
                <p className={`${isActive || isCompleted ? 'text-dark-foreground' : 'text-dark-muted-foreground'}`}>
                  {isCompleted ? '✅' : isActive ? '⏳' : '⚪️'} {stage.label}
                </p>
                {isActive && <span className="text-xs text-blue-400 animate-pulse">{Math.round(progress)}%</span>}
              </div>
              <div className="w-full bg-dark-background rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DeepReasoningVisualizer;