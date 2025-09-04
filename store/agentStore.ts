import { create } from 'zustand';
import { Agent, AgentName, AgentStatus, SystemMetrics, LlmMetrics, ChatMessage, ConfirmationState, ScheduledTask, TaskStatus, View, TaskSuggestion, ChatSession, Project, ProjectStatus, AutomationFlow, AutomationSession, AutomationCommand, AutomationCommandStatus, AutomationCommandType, FileSystemItem, FileType, TerminalLine, CommandSuggestion, WebIntelligenceSuggestion, DeepReasoningState, DeepReasoningStage, ApiIntegration, ApiIntegrationId, ApiActionSuggestion, WebIntelligenceMission, WebIntelligenceStatus, VoiceAgentState, VoiceChatMessage, AutomaticNote, AgendaItem, EditableAgent, DefaultAgentNames } from '../types';

type Language = 'en' | 'es';

interface AgentState {
  agents: Agent[];
  systemMetrics: SystemMetrics;
  llmMetrics: LlmMetrics;
  chatMessages: ChatMessage[];
  scheduledTasks: ScheduledTask[];
  chatHistory: ChatSession[];
  projects: Project[];
  fileSystem: FileSystemItem[];
  terminalHistory: TerminalLine[];
  apiIntegrations: ApiIntegration[];
  voiceAgentState: VoiceAgentState;
  confirmation: ConfirmationState;
  currentView: View;
  selectedTaskId: string | null;
  language: Language;
  downloadPath: string;
  useDefaultDownloadPath: boolean;
  automationFlows: AutomationFlow[];
  activeAutomationSession: AutomationSession | null;
  webIntelligenceMissions: WebIntelligenceMission[];
  activeIntelligenceMission: WebIntelligenceMission | null;
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: EditableAgent) => void;
  editAgent: (agentName: AgentName, updates: Partial<EditableAgent>) => void;
  deleteAgent: (agentName: AgentName) => void;
  setSystemMetrics: (metrics: SystemMetrics) => void;
  setLlmMetrics: (metrics: LlmMetrics) => void;
  addChatMessage: (message: ChatMessage) => void;
  addScheduledTask: (task: ScheduledTask) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  handleTaskSuggestion: (messageId: string, accepted: boolean) => void;
  deleteChatSession: (sessionId: string) => void;
  setConfirmation: (confirmation: ConfirmationState) => void;
  resolveConfirmation: (approved: boolean) => void;
  setCurrentView: (view: View) => void;
  selectTask: (taskId: string) => void;
  setLanguage: (lang: Language) => void;
  toggleAgentActivation: (agentName: AgentName, durationMs?: number | 'indefinite') => void;
  setDownloadPath: (path: string) => void;
  toggleUseDefaultDownloadPath: () => void;
  startAutomationFlow: (flowId: string) => void;
  startAdHocAutomation: (url: string) => void;
  endAutomationSession: () => void;
  updateCommandStatus: (commandIndex: number, status: AutomationCommandStatus, result?: string) => void;
  addFileSystemItem: (item: Omit<FileSystemItem, 'id' | 'lastModified'>) => void;
  updateFileSystemItem: (itemId: string, updates: Partial<Omit<FileSystemItem, 'id'>>) => void;
  deleteFileSystemItem: (itemId: string) => void;
  executeTerminalCommand: (command: string) => void;
  updateDeepReasoningState: (messageId: string, newState: Partial<DeepReasoningState>) => void;
  updateWebIntelligenceState: (messageId: string, newState: Partial<WebIntelligenceMission>) => void;
  startWebIntelligenceMission: (query: string) => void;
  endActiveMission: (finalStatus: WebIntelligenceStatus) => void;
  toggleApiConnection: (integrationId: ApiIntegrationId) => void;
  toggleVoiceRecording: () => void;
  addVoiceChatMessage: (message: VoiceChatMessage) => void;
  generateNote: (noteText: string) => void;
  deleteAutomaticNote: (noteId: string) => void;
  addAgendaItem: (content: string) => void;
  toggleAgendaItem: (itemId: string) => void;
  deleteAgendaItem: (itemId: string) => void;
  clearVoiceAgentState: () => void;
}

const initialAgents: Agent[] = [
  { name: DefaultAgentNames.Planner, status: AgentStatus.Idle, task: 'Awaiting user input...', reactivationTime: null },
  { name: DefaultAgentNames.Research, status: AgentStatus.Idle, task: 'Ready for research tasks.', reactivationTime: null },
  { name: DefaultAgentNames.Code, status: AgentStatus.Idle, task: 'Awaiting coding instructions.', reactivationTime: null },
  { name: DefaultAgentNames.Cloud, status: AgentStatus.Idle, task: 'Standing by for cloud operations.', reactivationTime: null },
];

const initialConfirmationState: ConfirmationState = {
    isActive: false,
    message: '',
    onConfirm: () => {},
    onReject: () => {},
};

const initialVoiceAgentState: VoiceAgentState = {
    isRecording: false,
    voiceChatHistory: [],
    automaticNotes: [],
    agenda: [],
};

const initialScheduledTasks: ScheduledTask[] = [
    { id: 'task-1', name: 'Analyze Q4 sales data and generate a report.', assignedAgents: [DefaultAgentNames.Research, DefaultAgentNames.Code], status: TaskStatus.Completed, priority: 'High', scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), estimatedTime: '1 hour', logs: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), level: 'INFO', message: 'Task initiated by Planner.' },
        { timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(), level: 'INFO', message: 'ResearchAgent started data fetching.' },
        { timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), level: 'INFO', message: 'CodeAgent began report generation script.' },
        { timestamp: new Date(Date.now() - 1.1 * 60 * 60 * 1000).toISOString(), level: 'INFO', message: 'Task successfully completed.' },
    ]},
    { id: 'task-2', name: 'Scrape competitor websites for new product launches.', assignedAgents: [DefaultAgentNames.Research], status: TaskStatus.Running, priority: 'Medium', scheduledTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), estimatedTime: '2 hours', logs: [
        { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), level: 'INFO', message: 'Task started.'},
        { timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), level: 'INFO', message: 'Scraping target: example.com'},
        { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), level: 'WARN', message: 'Rate limit hit on example.com, slowing down.'},
    ]},
    { id: 'task-3', name: 'Deploy the latest build to the staging server.', assignedAgents: [DefaultAgentNames.Cloud, DefaultAgentNames.Code], status: TaskStatus.Pending, priority: 'High', scheduledTime: new Date().toISOString(), estimatedTime: '30 minutes', logs: [] },
    { id: 'task-4', name: 'Backup all databases to cold storage.', assignedAgents: [DefaultAgentNames.Cloud], status: TaskStatus.Pending, priority: 'Low', scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), estimatedTime: '45 minutes', logs: [] },
    { id: 'task-5', name: 'Review and refactor the authentication module.', assignedAgents: [DefaultAgentNames.Code], status: TaskStatus.Failed, priority: 'Medium', scheduledTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), estimatedTime: '3 hours', logs: [
        { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), level: 'INFO', message: 'Refactoring started.'},
        { timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), level: 'ERROR', message: 'Fatal error in dependency: `auth-lib-v2`. Aborting task.'},
    ]},
];

const initialChatHistory: ChatSession[] = [
    { id: 'chat-session-1', title: 'Research on Q3 competitor earnings...', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), model: 'LFM2-VL-1.6B' },
    { id: 'chat-session-2', title: 'Drafting a project plan for the new API.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), model: 'gpt-4o-mini' },
];

const initialProjects: Project[] = [
    { id: 'proj-1', name: 'Q4 Sales Data Analysis', status: ProjectStatus.Completed, assignedAgents: [DefaultAgentNames.Research, DefaultAgentNames.Code], startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'proj-2', name: 'Staging Server Deployment', status: ProjectStatus.InProgress, assignedAgents: [DefaultAgentNames.Code, DefaultAgentNames.Cloud], startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialAutomationFlows: AutomationFlow[] = [
    {
        id: 'flow-1',
        name: 'Scrape News Headlines',
        description: 'Navigates to a news site and extracts the top 5 headlines.',
        commands: [
            { type: AutomationCommandType.NAVIGATE, text: 'https://news.ycombinator.com', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.EXTRACT, selector: '.titleline > a', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.SCREENSHOT, status: AutomationCommandStatus.PENDING },
        ]
    },
    {
        id: 'flow-2',
        name: 'Fill Contact Form',
        description: 'Fills and submits a sample contact form.',
        commands: [
            { type: AutomationCommandType.NAVIGATE, text: 'https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.CLICK, selector: 'button[data-modal-open="modal-1"]', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.TYPE, selector: '#fname', text: 'John Doe', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.TYPE, selector: '#email', text: 'john.doe@example.com', status: AutomationCommandStatus.PENDING },
            { type: AutomationCommandType.SUBMIT, selector: 'form', status: AutomationCommandStatus.PENDING },
        ]
    }
];

const initialFileSystem: FileSystemItem[] = [
    { id: 'root', name: 'Home', type: FileType.FOLDER, parentId: null, lastModified: new Date().toISOString() },
    { id: 'folder-1', name: 'Projects', type: FileType.FOLDER, parentId: 'root', lastModified: new Date().toISOString() },
    { id: 'folder-2', name: 'Reports', type: FileType.FOLDER, parentId: 'root', lastModified: new Date().toISOString() },
    { id: 'folder-3', name: 'Code', type: FileType.FOLDER, parentId: 'root', lastModified: new Date().toISOString() },
    { id: 'file-1', name: 'Q4_Sales_Analysis.xlsx', type: FileType.SPREADSHEET, parentId: 'folder-2', lastModified: new Date().toISOString(), content: [
        ['Month', 'Revenue', 'Profit'],
        ['October', '150000', '45000'],
        ['November', '185000', '62000'],
        ['December', '220000', '75000'],
    ]},
    { id: 'file-2', name: 'Competitor_Research.docx', type: FileType.DOCUMENT, parentId: 'folder-2', lastModified: new Date().toISOString(), content: 'Competitor Research Document...\n\nSection 1: ...' },
    { id: 'file-3', name: 'api_deployment.py', type: FileType.CODE, parentId: 'folder-3', lastModified: new Date().toISOString(), content: 'import os\n\ndef deploy():\n    print("Deploying to staging...")' },
    { id: 'file-4', name: 'Project_Titan_Proposal.pptx', type: FileType.PRESENTATION, parentId: 'folder-1', lastModified: new Date().toISOString(), content: [
        { title: 'Project Titan', subtitle: 'An Autonomous AI Agent Studio' },
        { title: 'Core Architecture', points: ['FastAPI Backend', 'React Frontend', 'Dockerized Services'] },
    ]},
];

const initialApiIntegrations: ApiIntegration[] = [
    { id: ApiIntegrationId.GOOGLE_WORKSPACE, name: 'Google Workspace', isConnected: true },
    { id: ApiIntegrationId.MICROSOFT_365, name: 'Microsoft 365', isConnected: false },
    { id: ApiIntegrationId.SLACK, name: 'Slack', isConnected: true },
    { id: ApiIntegrationId.GITHUB, name: 'GitHub', isConnected: false },
    { id: ApiIntegrationId.NOTION, name: 'Notion', isConnected: false },
];

const initialWebIntelligenceMissions: WebIntelligenceMission[] = [
    {
        id: 'wim-1',
        query: 'Analyze market trends for AI-powered code assistants',
        status: WebIntelligenceStatus.COMPLETED,
        progress: 100,
        discoveredUrls: ['https://techcrunch.com/ai', 'https://venturebeat.com/ai'],
        extractedInsights: ['Market is growing at 25% YoY', 'Key players are GitHub Copilot, Tabnine, and Amazon CodeWhisperer.'],
        finalReport: '**Final Report:**\n- Market is expanding rapidly.\n- High competition among key players.',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: initialAgents,
  systemMetrics: { cpu: 0, ram: 0, disk: 0, network: 0 },
  llmMetrics: { prefillTokensPerSecond: 0, decodeTokensPerSecond: 0 },
  chatMessages: [
    { id: `msg-${Date.now()}`, sender: DefaultAgentNames.Planner, text: "Welcome to Onwrk-AI Titan. How can I help you strategize today?", timestamp: new Date().toISOString() }
  ],
  scheduledTasks: initialScheduledTasks,
  chatHistory: initialChatHistory,
  projects: initialProjects,
  fileSystem: initialFileSystem,
  terminalHistory: [
    { type: 'output', text: 'Onwrk-AI Secure Terminal. Type `help` for a list of commands.' }
  ],
  apiIntegrations: initialApiIntegrations,
  voiceAgentState: initialVoiceAgentState,
  confirmation: initialConfirmationState,
  currentView: View.Dashboard,
  selectedTaskId: null,
  language: 'en',
  downloadPath: 'C:\\Users\\DefaultUser\\Downloads\\Onwrk-AI',
  useDefaultDownloadPath: true,
  automationFlows: initialAutomationFlows,
  activeAutomationSession: null,
  webIntelligenceMissions: initialWebIntelligenceMissions,
  activeIntelligenceMission: null,

  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set(state => ({
    agents: [...state.agents, { 
        name: agent.name, 
        task: agent.task, 
        // FIX: The modelFile property on an Agent must be a string (the file name), not a File object.
        modelFile: agent.modelFile?.name,
        status: AgentStatus.Idle, 
        reactivationTime: null 
    }]
  })),
  editAgent: (agentName, updates) => set(state => ({
    agents: state.agents.map(a => a.name === agentName ? { ...a, ...updates } : a)
  })),
  deleteAgent: (agentName) => set(state => ({
    agents: state.agents.filter(a => a.name !== agentName)
  })),
  setSystemMetrics: (metrics) => set({ systemMetrics: metrics }),
  setLlmMetrics: (metrics) => set({ llmMetrics: metrics }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  addScheduledTask: (task) => set((state) => ({ scheduledTasks: [task, ...state.scheduledTasks] })),
  updateTaskStatus: (taskId, status) => set(state => ({
    scheduledTasks: state.scheduledTasks.map(task => 
        task.id === taskId ? { ...task, status } : task
    ),
  })),
  handleTaskSuggestion: (messageId: string, accepted: boolean) => set(state => {
    let taskToCreate: ScheduledTask | null = null;
    let confirmationMessage: ChatMessage | null = null;
    let projectToCreate: Project | null = null;
    let commandToExecute: string | null = null;
    
    const updatedMessages = state.chatMessages.map(msg => {
        if (msg.id === messageId && msg.suggestion?.status === 'pending') {
            const suggestion = msg.suggestion;
            const newStatus: 'accepted' | 'rejected' = accepted ? 'accepted' : 'rejected';
            const updatedSuggestion = { ...suggestion, status: newStatus };

            if (accepted) {
                switch(suggestion.suggestionType) {
                    case 'web-mission':
                        const missionDetails = suggestion.details as WebIntelligenceSuggestion;
                        const missionMessageId = `msg-${Date.now()}-mission`;
                        confirmationMessage = {
                            id: missionMessageId,
                            sender: DefaultAgentNames.Planner,
                            text: `Web Intelligence Mission for "${missionDetails.mission}" accepted. Starting now...`,
                            timestamp: new Date().toISOString(),
                            webIntelligenceState: {
                                id: `wi-${Date.now()}`,
                                query: missionDetails.mission,
                                status: WebIntelligenceStatus.PLANNING,
                                progress: 0,
                                discoveredUrls: [],
                                extractedInsights: [],
                                finalReport: null,
                                startDate: new Date().toISOString(),
                            }
                        };
                        break;

                    case 'command':
                        commandToExecute = (suggestion.details as CommandSuggestion).command;
                        confirmationMessage = {
                            id: `msg-${Date.now()}`,
                            sender: DefaultAgentNames.Planner,
                            text: `Command "${commandToExecute}" accepted. Executing now...`,
                            timestamp: new Date().toISOString()
                        };
                        break;
                    
                    case 'api-action':
                        const apiDetails = suggestion.details as ApiActionSuggestion;
                        const serviceName = state.apiIntegrations.find(i => i.id === apiDetails.serviceId)?.name || 'Unknown Service';
                         confirmationMessage = {
                            id: `msg-${Date.now()}`,
                            sender: DefaultAgentNames.Planner,
                            text: `✅ Successfully performed "${apiDetails.action}" via ${serviceName}.`,
                            timestamp: new Date().toISOString()
                        };
                        break;

                    case 'task':
                    default:
                        const newTaskId = `task-${Date.now()}`;
                        taskToCreate = {
                            id: newTaskId,
                            name: suggestion.description!,
                            assignedAgents: suggestion.assignedAgents!,
                            status: TaskStatus.Pending,
                            priority: suggestion.priority!,
                            scheduledTime: new Date().toISOString(),
                            estimatedTime: suggestion.estimatedTime || 'N/A'
                        };
                        confirmationMessage = {
                            id: `msg-${Date.now()}`,
                            sender: DefaultAgentNames.Planner,
                            text: `Task "${suggestion.description}" accepted and added to the schedule.`,
                            timestamp: new Date().toISOString()
                        };
                        if (suggestion.assignedAgents!.length > 1) {
                            projectToCreate = {
                                id: `proj-${Date.now()}`,
                                name: suggestion.description!,
                                status: ProjectStatus.InProgress,
                                assignedAgents: suggestion.assignedAgents!,
                                startDate: new Date().toISOString(),
                            };
                        }
                        break;
                }
            }
            return { ...msg, suggestion: updatedSuggestion };
        }
        return msg;
    });

    if (commandToExecute) {
      get().executeTerminalCommand(commandToExecute);
      setTimeout(() => get().setCurrentView(View.SystemOperations), 100);
    }

    return {
        chatMessages: confirmationMessage ? [...updatedMessages, confirmationMessage] : updatedMessages,
        scheduledTasks: taskToCreate ? [taskToCreate, ...state.scheduledTasks] : state.scheduledTasks,
        projects: projectToCreate ? [projectToCreate, ...state.projects] : state.projects,
    };
  }),
  deleteChatSession: (sessionId: string) => set(state => ({
    chatHistory: state.chatHistory.filter(session => session.id !== sessionId)
  })),
  setConfirmation: (confirmation) => set({ confirmation }),
  resolveConfirmation: (approved) => set((state) => {
    const agentToUpdate = state.agents.find(a => a.status === AgentStatus.AwaitingConfirmation);
    if (agentToUpdate) {
        const updatedAgents = state.agents.map(agent =>
            agent.name === agentToUpdate.name
                ? { ...agent, status: approved ? AgentStatus.Executing : AgentStatus.Idle, task: approved ? 'Action approved. Executing...' : 'Action rejected. Returning to idle.' }
                : agent
        );
        return { agents: updatedAgents, confirmation: initialConfirmationState };
    }
    return { confirmation: initialConfirmationState };
  }),
  setCurrentView: (view) => set({ currentView: view, selectedTaskId: null }), // Reset selected task when changing main views
  selectTask: (taskId) => set({ selectedTaskId: taskId, currentView: View.TaskDetails }),
  setLanguage: (lang) => set({ language: lang }),
  toggleAgentActivation: (agentName, durationMs) => set(state => {
    const agentToToggle = state.agents.find(a => a.name === agentName);
    if (!agentToToggle) return state;

    const isDeactivating = agentToToggle.status !== AgentStatus.Inactive;

    const updatedAgents = state.agents.map(agent => {
        if (agent.name === agentName) {
            if (isDeactivating) {
                const reactivationTime = durationMs === 'indefinite' 
                    ? null 
                    : (durationMs ? new Date(Date.now() + durationMs).toISOString() : null);
                return { ...agent, status: AgentStatus.Inactive, reactivationTime, task: 'Agent is inactive.' };
            } else {
                // Reactivating manually
                return { ...agent, status: AgentStatus.Idle, reactivationTime: null, task: 'Reactivated manually.' };
            }
        }
        return agent;
    });
    return { agents: updatedAgents };
  }),
  setDownloadPath: (path) => set({ downloadPath: path }),
  toggleUseDefaultDownloadPath: () => set(state => ({ useDefaultDownloadPath: !state.useDefaultDownloadPath })),

  // Web Automation Actions
  startAutomationFlow: (flowId: string) => set(state => {
    const flowToStart = state.automationFlows.find(f => f.id === flowId);
    if (!flowToStart) return state;
    // Reset statuses to pending before starting
    const resetFlow = {
        ...flowToStart,
        commands: flowToStart.commands.map(c => ({...c, status: AutomationCommandStatus.PENDING, result: undefined}))
    };
    const firstNavCommand = resetFlow.commands.find(c => c.type === AutomationCommandType.NAVIGATE);
    return {
        activeAutomationSession: {
            flow: resetFlow,
            currentCommandIndex: 0,
            status: 'running',
            iframeUrl: firstNavCommand?.text || null,
        },
        currentView: View.WebAutomation
    };
  }),
  startAdHocAutomation: (url: string) => {
    const adHocFlow: AutomationFlow = {
        id: `adhoc-${Date.now()}`,
        name: `Ad-Hoc Session: ${url}`,
        description: `Single navigation to ${url}`,
        commands: [
            { type: AutomationCommandType.NAVIGATE, text: url, status: AutomationCommandStatus.PENDING }
        ]
    };
    set({
        activeAutomationSession: {
            flow: adHocFlow,
            currentCommandIndex: 0,
            status: 'running',
            iframeUrl: url,
        },
        currentView: View.WebAutomation
    });
  },
  endAutomationSession: () => set({ activeAutomationSession: null }),
  updateCommandStatus: (commandIndex, status, result) => set(state => {
    if (!state.activeAutomationSession) return state;
    
    const updatedCommands = state.activeAutomationSession.flow.commands.map((cmd, idx) => {
        if (idx === commandIndex) {
            const newCmd = { ...cmd, status };
            if (result) newCmd.result = result;
            return newCmd;
        }
        return cmd;
    });

    const newSessionState: AutomationSession = {
        ...state.activeAutomationSession,
        flow: {
            ...state.activeAutomationSession.flow,
            commands: updatedCommands
        }
    };

    // Update iframe URL on successful navigation
    const currentCommand = updatedCommands[commandIndex];
    if (currentCommand.type === AutomationCommandType.NAVIGATE && status === AutomationCommandStatus.COMPLETED) {
        newSessionState.iframeUrl = currentCommand.text || null;
    }

    // Move to next command or end session
    if (status === AutomationCommandStatus.COMPLETED) {
        if (commandIndex >= updatedCommands.length - 1) {
            newSessionState.status = 'completed';
        } else {
            newSessionState.currentCommandIndex = commandIndex + 1;
        }
    } else if (status === AutomationCommandStatus.FAILED) {
        newSessionState.status = 'failed';
    }

    return { activeAutomationSession: newSessionState };
  }),

  // File System Actions
  addFileSystemItem: (item) => set(state => {
    const newItem: FileSystemItem = {
        ...item,
        id: `fs-${Date.now()}`,
        lastModified: new Date().toISOString(),
    };
    return { fileSystem: [...state.fileSystem, newItem] };
  }),
  updateFileSystemItem: (itemId, updates) => set(state => ({
    fileSystem: state.fileSystem.map(item => 
        item.id === itemId ? { ...item, ...updates, lastModified: new Date().toISOString() } : item
    )
  })),
  deleteFileSystemItem: (itemId) => set(state => {
    // Also delete all children recursively
    const itemsToDelete = new Set<string>([itemId]);
    let changed = true;
    while(changed) {
        changed = false;
        state.fileSystem.forEach(item => {
            if(item.parentId && itemsToDelete.has(item.parentId) && !itemsToDelete.has(item.id)) {
                itemsToDelete.add(item.id);
                changed = true;
            }
        });
    }
    return { fileSystem: state.fileSystem.filter(item => !itemsToDelete.has(item.id)) };
  }),
  executeTerminalCommand: (command: string) => set(state => {
    const newHistory: TerminalLine[] = [...state.terminalHistory, { type: 'input', text: command }];
    const [cmd, ...args] = command.trim().split(' ');
    const whitelistedCommands = ['help', 'ls', 'echo', 'pwd', 'whoami', 'date', 'git', 'docker'];

    if (whitelistedCommands.includes(cmd)) {
        let output = '';
        switch(cmd) {
            case 'help': output = 'Available commands: help, ls, echo, pwd, whoami, date, git status, docker ps'; break;
            case 'ls': output = 'Projects  Reports  Code  README.md'; break;
            case 'echo': output = args.join(' '); break;
            case 'pwd': output = '/home/onwrk-ai/workspaces/project_titan'; break;
            case 'whoami': output = 'onwrk-agent'; break;
            case 'date': output = new Date().toString(); break;
            case 'git': output = args[0] === 'status' ? 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean' : `git: '${args[0]}' is not a git command.`; break;
            case 'docker': output = args[0] === 'ps' ? 'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES\n1a2b3c4d5e6f   llama-cpp      "./server -m models..."   5 hours ago     Up 5 hours   8080/tcp  onwrk-llama' : `docker: '${args[0]}' is not a docker command.`; break;
            default: output = '';
        }
        newHistory.push({ type: 'output', text: output });
    } else {
        newHistory.push({ type: 'error', text: `command not found: ${cmd}` });
    }
    
    return { terminalHistory: newHistory };
  }),
  updateDeepReasoningState: (messageId: string, newState: Partial<DeepReasoningState>) => set(state => ({
    chatMessages: state.chatMessages.map(msg => 
        msg.id === messageId && msg.deepReasoningState
            ? { ...msg, deepReasoningState: { ...msg.deepReasoningState, ...newState } }
            : msg
    )
  })),
  updateWebIntelligenceState: (messageId: string, newState: Partial<WebIntelligenceMission>) => set(state => ({
    chatMessages: state.chatMessages.map(msg => 
        msg.id === messageId && msg.webIntelligenceState
            ? { ...msg, webIntelligenceState: { ...msg.webIntelligenceState, ...newState } }
            : msg
    )
  })),
  startWebIntelligenceMission: (query: string) => set(state => {
    const newMission: WebIntelligenceMission = {
        id: `wim-${Date.now()}`,
        query,
        status: WebIntelligenceStatus.PLANNING,
        progress: 0,
        discoveredUrls: [],
        extractedInsights: [],
        finalReport: null,
        startDate: new Date().toISOString(),
    };
    return {
        activeIntelligenceMission: newMission,
        webIntelligenceMissions: [newMission, ...state.webIntelligenceMissions],
    };
  }),
  endActiveMission: (finalStatus: WebIntelligenceStatus) => set(state => {
      if (!state.activeIntelligenceMission) return state;
      const missionId = state.activeIntelligenceMission.id;
      const updatedMissions = state.webIntelligenceMissions.map(m =>
          m.id === missionId ? { ...state.activeIntelligenceMission!, status: finalStatus, progress: finalStatus === WebIntelligenceStatus.FAILED ? state.activeIntelligenceMission.progress : 100 } : m
      );
      return {
          activeIntelligenceMission: null,
          webIntelligenceMissions: updatedMissions,
      };
  }),
  toggleApiConnection: (integrationId: ApiIntegrationId) => set(state => ({
    apiIntegrations: state.apiIntegrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, isConnected: !integration.isConnected }
        : integration
    )
  })),
  // Voice Agent Actions
  toggleVoiceRecording: () => set(state => {
    const isStarting = !state.voiceAgentState.isRecording;
    const initialMessage: VoiceChatMessage = { sender: DefaultAgentNames.Voice as 'VoiceAgent', text: 'New voice session started. I am listening...' };
    if (isStarting) {
        return {
            voiceAgentState: {
                isRecording: true,
                voiceChatHistory: [initialMessage],
                automaticNotes: [],
            }
        };
    }
    return { 
        voiceAgentState: { 
            ...state.voiceAgentState, 
            isRecording: false 
        } 
    };
  }),
  addVoiceChatMessage: (message: VoiceChatMessage) => set(state => ({
    voiceAgentState: {
        ...state.voiceAgentState,
        voiceChatHistory: [...state.voiceAgentState.voiceChatHistory, message],
    }
  })),
  generateNote: (noteText: string) => set(state => {
    let noteType: AutomaticNote['type'] = 'Idea';
    let content = noteText;
    
    const noteMatch = noteText.match(/- (✅|📌|⏳) (.*?): (.*)/);
    if (noteMatch) {
        const [, icon, typeStr, noteContent] = noteMatch;
        content = noteContent;
        if (typeStr.toLowerCase() === 'idea') noteType = 'Idea';
        if (typeStr.toLowerCase() === 'task') noteType = 'Task';
        if (typeStr.toLowerCase() === 'plan') noteType = 'Plan';
    }

    const newNote: AutomaticNote = {
        id: `note-${Date.now()}`,
        type: noteType,
        content: content,
    };
    
    return {
        voiceAgentState: {
            ...state.voiceAgentState,
            automaticNotes: [...state.voiceAgentState.automaticNotes, newNote],
        }
    };
  }),
  deleteAutomaticNote: (noteId: string) => set(state => ({
      voiceAgentState: {
          ...state.voiceAgentState,
          automaticNotes: state.voiceAgentState.automaticNotes.filter(note => note.id !== noteId),
      }
  })),
  addAgendaItem: (content: string) => set(state => ({
      voiceAgentState: {
          ...state.voiceAgentState,
          agenda: [...state.voiceAgentState.agenda, { id: `agenda-${Date.now()}`, content, completed: false }],
      }
  })),
  toggleAgendaItem: (itemId: string) => set(state => ({
      voiceAgentState: {
          ...state.voiceAgentState,
          agenda: state.voiceAgentState.agenda.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item),
      }
  })),
  deleteAgendaItem: (itemId: string) => set(state => ({
      voiceAgentState: {
          ...state.voiceAgentState,
          agenda: state.voiceAgentState.agenda.filter(item => item.id !== itemId),
      }
  })),
  clearVoiceAgentState: () => set({ voiceAgentState: initialVoiceAgentState }),
}));