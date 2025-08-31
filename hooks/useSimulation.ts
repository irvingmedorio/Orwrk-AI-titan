import { useEffect } from 'react';
import { useAgentStore } from '../store/agentStore';
// FIX: Import DefaultAgentNames to use for agent name values.
import { AgentName, AgentStatus, View, TaskStatus, AutomationCommandStatus, DeepReasoningStage, WebIntelligenceStatus, DefaultAgentNames } from '../types';
import { useTranslation } from '../lib/i18n';

const voiceTranscriptSnippets = [
    "Okay, so the first idea is to restructure the project onboarding flow. ",
    "We need to create a task to email the tech team about the new dependency. ",
    "Let's make a plan to launch the new version in three days. ",
    "Another idea could be to implement a feature flag system. ",
    "I need to remember the task of updating the documentation. ",
    "The core concept is solid. ",
    "The plan should include a testing phase. ",
];
let snippetIndex = 0;

export const useSimulation = () => {
  const { 
    setAgents, 
    setSystemMetrics, 
    setLlmMetrics, 
    setConfirmation, 
    addChatMessage, 
    updateTaskStatus,
    updateCommandStatus,
    updateDeepReasoningState,
    updateWebIntelligenceState,
    addVoiceChatMessage,
    generateNote,
  } = useAgentStore.getState();
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Get the latest state directly inside the interval to avoid stale closures
      let { agents, confirmation, scheduledTasks, activeAutomationSession, chatMessages, voiceAgentState } = useAgentStore.getState();

      // Check for agent reactivations
      const agentsAfterReactivation = agents.map(agent => {
        if (agent.status === AgentStatus.Inactive && agent.reactivationTime) {
          if (new Date(agent.reactivationTime).getTime() <= now) {
            return { ...agent, status: AgentStatus.Idle, reactivationTime: null, task: t('reactivatedAutomatically') };
          }
        }
        return agent;
      });

      // Simulate agent status changes for active agents only
      let needsConfirmation = false;
      const updatedAgents = agentsAfterReactivation.map(agent => {
        // Prevent changing status if a confirmation is active or if agent is in deep reasoning
        if (confirmation.isActive || agent.status === AgentStatus.DeepReasoning) return agent;

        if (agent.status !== AgentStatus.Inactive && Math.random() < 0.05) { // Lowered frequency
          const statuses = Object.values(AgentStatus).filter(s => ![AgentStatus.Inactive, AgentStatus.AwaitingConfirmation, AgentStatus.DeepReasoning].includes(s));
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          let newTask = agent.task;
          switch(newStatus) {
              case AgentStatus.Thinking: newTask = 'Analyzing data...'; break;
              case AgentStatus.Executing: newTask = 'Executing task sequence...'; break;
              case AgentStatus.Error: newTask = 'Error: Subprocess failed.'; break;
              case AgentStatus.Idle: newTask = 'Awaiting instructions.'; break;
          }
          return { ...agent, status: newStatus, task: newTask };
        }
        // Proactive confirmation request simulation
        // FIX: Use DefaultAgentNames.Code instead of AgentName.Code
        if (agent.name === DefaultAgentNames.Code && agent.status === AgentStatus.Executing && Math.random() < 0.02 && !confirmation.isActive) {
            needsConfirmation = true;
            return { ...agent, status: AgentStatus.AwaitingConfirmation, task: 'Requesting permission for file system write.'};
        }
        return agent;
      });
      
      if (needsConfirmation) {
          setConfirmation({
              isActive: true,
              // FIX: Use DefaultAgentNames.Code instead of AgentName.Code
              message: t('agentApprovalMessage', DefaultAgentNames.Code),
              onConfirm: () => useAgentStore.getState().resolveConfirmation(true),
              onReject: () => useAgentStore.getState().resolveConfirmation(false)
          });
      }

      setAgents(updatedAgents);

      // Simulate System & LLM Metrics
      setSystemMetrics({
        cpu: Math.random() * 50 + 10,
        ram: Math.random() * 40 + 30,
        disk: 75.0,
        network: Math.random() * 1000
      });
      setLlmMetrics({
        prefillTokensPerSecond: Math.random() * 500 + 800,
        decodeTokensPerSecond: Math.random() * 50 + 150
      });

      // Simulate task progression
      scheduledTasks.forEach(task => {
          if (task.status === TaskStatus.Pending && new Date(task.scheduledTime).getTime() <= now) {
              updateTaskStatus(task.id, TaskStatus.Running);
          } else if (task.status === TaskStatus.Running && Math.random() < 0.05) { // 5% chance to complete per interval
              updateTaskStatus(task.id, TaskStatus.Completed);
          }
      });
      
      // Simulate web automation progression
      if (activeAutomationSession && activeAutomationSession.status === 'running') {
        const session = activeAutomationSession;
        const currentIndex = session.currentCommandIndex;
        const currentCommand = session.flow.commands[currentIndex];

        if (currentCommand.status === AutomationCommandStatus.PENDING) {
             updateCommandStatus(currentIndex, AutomationCommandStatus.EXECUTING);
        } else if (currentCommand.status === AutomationCommandStatus.EXECUTING) {
             let result: string | undefined = undefined;
             if (currentCommand.type === 'extract') {
                 result = 'Extracted: "Headline 1", "Headline 2", "Headline 3"';
             } else if (currentCommand.type === 'screenshot') {
                 result = 'Screenshot saved as screenshot-12345.png';
             }
             updateCommandStatus(currentIndex, AutomationCommandStatus.COMPLETED, result);
        }
      }

      // Simulate deep reasoning progression
      const activeReasoningMessage = chatMessages.find(m => m.deepReasoningState && !m.deepReasoningState.isComplete);
      if (activeReasoningMessage && activeReasoningMessage.deepReasoningState) {
        const state = activeReasoningMessage.deepReasoningState;
        let newProgress = state.progress + 10 * Math.random();
        let newStage = state.stage;

        if (newProgress >= 100) {
            newProgress = 100;
            const stages = Object.values(DeepReasoningStage);
            const currentStageIndex = stages.indexOf(state.stage);
            if (currentStageIndex < stages.length - 1) {
                newStage = stages[currentStageIndex + 1];
                newProgress = 0;
            } else {
                // Reasoning is complete
                updateDeepReasoningState(activeReasoningMessage.id, { isComplete: true, progress: 100 });
                
                // Post the final report
                const originalRequest = chatMessages.find(m => m.id === activeReasoningMessage.id.replace('-reasoning', ''))?.text.replace('/deepthink ', '');
                const reportText = `
### 💡 Deep Reasoning Report

**${t('objective')}:**
To formulate a comprehensive growth strategy for a startup, based on the request: "${originalRequest}"

**${t('keyAssumptions')}:**
- The startup operates in the tech sector.
- Market conditions are stable.
- The team has the capability to execute the proposed strategies.

**${t('optionsEvaluated')}:**
1.  **Aggressive Marketing:** High cost, high potential return.
2.  **Product-Led Growth:** Focus on user experience and viral loops.
3.  **Strategic Partnerships:** Leverage existing networks for expansion.

**${t('recommendation')}:**
A hybrid approach is recommended. Start with a strong product-led growth foundation to ensure user retention. Concurrently, initiate targeted marketing campaigns to drive initial user acquisition. Explore strategic partnerships once a stable user base is established to scale effectively.
`;
                addChatMessage({
                    id: `msg-${Date.now()}-report`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: reportText,
                    timestamp: new Date().toISOString(),
                });

                // Reset planner agent status
                // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                setAgents(useAgentStore.getState().agents.map(a => a.name === DefaultAgentNames.Planner ? { ...a, status: AgentStatus.Idle, task: 'Ready for new instructions.' } : a));

            }
        }
        updateDeepReasoningState(activeReasoningMessage.id, { stage: newStage, progress: newProgress });
      }

      // Simulate Web Intelligence mission progression (in-chat)
      const activeMissionMessage = chatMessages.find(m => m.webIntelligenceState && m.webIntelligenceState.status !== WebIntelligenceStatus.COMPLETED && m.webIntelligenceState.status !== WebIntelligenceStatus.FAILED);
      if (activeMissionMessage && activeMissionMessage.webIntelligenceState) {
        let { status, progress, discoveredUrls, extractedInsights } = activeMissionMessage.webIntelligenceState;
        progress += Math.random() * 15;

        if (progress >= 100) {
            progress = 100;
            const stages = Object.values(WebIntelligenceStatus);
            const currentStageIndex = stages.indexOf(status);
            if (currentStageIndex < stages.indexOf(WebIntelligenceStatus.SYNTHESIZING)) {
                status = stages[currentStageIndex + 1];
                progress = 0;

                if (status === WebIntelligenceStatus.CRAWLING_EXTRACTING) {
                    discoveredUrls = [...discoveredUrls, `https://source${discoveredUrls.length + 1}.com`, `https://source${discoveredUrls.length + 2}.com`];
                } else if (status === WebIntelligenceStatus.SYNTHESIZING) {
                    extractedInsights = [...extractedInsights, `Key Insight #${extractedInsights.length + 1}`, `Finding #${extractedInsights.length + 2}`];
                }
            } else {
                const finalReport = `**${t('finalReport')}:**\n${t('missionQuery')}: "${activeMissionMessage.webIntelligenceState.query}"\n\n**${t('keyAssumptions')}:**\n- ${extractedInsights.join('\n- ')}\n\n**${t('discoveredUrls')}:**\n- ${discoveredUrls.join('\n- ')}`;
                updateWebIntelligenceState(activeMissionMessage.id, { status: WebIntelligenceStatus.COMPLETED, progress: 100, finalReport });
            }
        }
        updateWebIntelligenceState(activeMissionMessage.id, { status, progress, discoveredUrls, extractedInsights });
      }

      // Simulate Voice Agent
      if (voiceAgentState.isRecording) {
        const snippet = voiceTranscriptSnippets[snippetIndex % voiceTranscriptSnippets.length];
        snippetIndex++;
        
        // Add user's voice transcript to chat
        addVoiceChatMessage({ sender: 'User', text: snippet });

        const lowerSnippet = snippet.toLowerCase();
        let noteTaken = false;
        let agentResponse = '';

        if (lowerSnippet.includes('idea')) {
            generateNote(`- ✅ Idea: ${snippet.replace(/idea/i, '').trim()}`);
            noteTaken = true;
            agentResponse = 'Great idea! I\'ve noted that down.';
        } else if (lowerSnippet.includes('task')) {
            generateNote(`- 📌 Task: ${snippet.replace(/task to/i, '').trim()}`);
            noteTaken = true;
            agentResponse = 'Understood. I have added it to your tasks.';
        } else if (lowerSnippet.includes('plan')) {
            generateNote(`- ⏳ Plan: ${snippet.replace(/plan to/i, '').trim()}`);
            noteTaken = true;
            agentResponse = 'Okay, I\'ve captured that as part of the plan.';
        }

        if (noteTaken) {
            // Add agent's confirmation to chat after a short delay
            setTimeout(() => {
                // FIX: Use DefaultAgentNames.Voice instead of AgentName.Voice
                addVoiceChatMessage({ sender: DefaultAgentNames.Voice, text: agentResponse });
            }, 500);
        }
      }


    }, 2000); // Run simulation every 2 seconds

    return () => clearInterval(interval);
  }, [t, addChatMessage, setAgents, setConfirmation, setLlmMetrics, setSystemMetrics, updateCommandStatus, updateDeepReasoningState, updateWebIntelligenceState, updateTaskStatus, addVoiceChatMessage, generateNote]);
};