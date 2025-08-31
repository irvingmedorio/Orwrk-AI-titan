export enum View {
  Dashboard = 'Dashboard',
  Chat = 'Chat',
  ScheduledTasks = 'Scheduled Tasks',
  Settings = 'Settings',
  TaskDetails = 'Task Details',
  History = 'History',
  WebAutomation = 'Web Automation',
  FileManager = 'File Manager',
  SystemOperations = 'System Operations',
  VoiceAgent = 'Voice Agent',
}

// AgentName is now a string type for flexibility
export type AgentName = string;

export const DefaultAgentNames = {
  Planner: 'Onwrk-agen',
  Research: 'ResearchAgent',
  Code: 'CodeAgent',
  Cloud: 'CloudAgent',
  Voice: 'VoiceAgent'
} as const;


export enum AgentStatus {
  Idle = 'Idle',
  Thinking = 'Thinking',
  Executing = 'Executing',
  AwaitingConfirmation = 'Awaiting Confirmation',
  Error = 'Error',
  Inactive = 'Inactive',
  DeepReasoning = 'Deep Reasoning',
}

export enum TaskStatus {
    Pending = 'Pending',
    Running = 'Running',
    Completed = 'Completed',
    Failed = 'Failed',
    Paused = 'Paused',
}

export interface Agent {
  name: AgentName;
  status: AgentStatus;
  task: string;
  reactivationTime?: string | null;
  modelFile?: string;
}

export interface EditableAgent {
    name: AgentName;
    task: string;
    modelFile?: File | null;
}

export interface SystemMetrics {
  cpu: number;
  ram: number;
  disk: number;
  network: number; // in kbps
}

export interface LlmMetrics {
  prefillTokensPerSecond: number;
  decodeTokensPerSecond: number;
}

export interface FilePreview {
  name: string;
  type: string;
  content: string; // Base64 Data URL
}

export type SuggestionType = 'task' | 'web-mission' | 'command' | 'api-action';

export interface CommandSuggestion {
    command: string;
}

export interface WebIntelligenceSuggestion {
    mission: string;
}

export interface ApiActionSuggestion {
    serviceId: ApiIntegrationId;
    action: string;
}

export interface TaskSuggestion {
    description?: string;
    assignedAgents?: AgentName[];
    priority?: 'Low' | 'Medium' | 'High';
    estimatedTime?: string;
    status: 'pending' | 'accepted' | 'rejected';
    suggestionType: SuggestionType;
    details: CommandSuggestion | WebIntelligenceSuggestion | ApiActionSuggestion | {};
}

export enum DeepReasoningStage {
    DECOMPOSING = 'Decomposing Problem',
    EVALUATING = 'Evaluating Hypotheses',
    SIMULATING = 'Simulating Outcomes',
    SYNTHESIZING = 'Synthesizing Solution',
}

export interface DeepReasoningState {
    stage: DeepReasoningStage;
    progress: number;
    isComplete: boolean;
}

// Web Intelligence Types
export enum WebIntelligenceStatus {
    PLANNING = 'Planning',
    SEARCHING = 'Searching',
    CRAWLING_EXTRACTING = 'Crawling & Extracting',
    SYNTHESIZING = 'Synthesizing',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
}

export interface WebIntelligenceMission {
    id: string;
    query: string;
    status: WebIntelligenceStatus;
    progress: number;
    discoveredUrls: string[];
    extractedInsights: string[];
    finalReport: string | null;
    startDate: string;
}

export interface ChatMessage {
    id: string;
    sender: AgentName | 'User';
    text: string;
    timestamp: string;
    files?: FilePreview[];
    suggestion?: TaskSuggestion;
    deepReasoningState?: DeepReasoningState;
    webIntelligenceState?: WebIntelligenceMission;
}

export interface ConfirmationState {
  isActive: boolean;
  message: string;
  onConfirm: () => void;
  onReject: () => void;
}

export interface TaskLog {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

export interface ScheduledTask {
    id: string;
    name: string;
    assignedAgents: AgentName[];
    status: TaskStatus;
    priority: 'Low' | 'Medium' | 'High';
    scheduledTime: string;
    estimatedTime: string;
    logs?: TaskLog[];
    files?: FilePreview[];
}

export interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
    model: string;
}

export enum ProjectStatus {
    InProgress = 'In Progress',
    Completed = 'Completed',
    Failed = 'Failed',
}

export interface Project {
    id: string;
    name: string;
    status: ProjectStatus;
    assignedAgents: AgentName[];
    startDate: string;
    endDate?: string;
}

// Web Automation Types
export enum AutomationCommandType {
    NAVIGATE = 'navigate',
    CLICK = 'click',
    TYPE = 'type',
    EXTRACT = 'extract',
    SUBMIT = 'submit',
    SCREENSHOT = 'screenshot',
}

export enum AutomationCommandStatus {
    PENDING = 'Pending',
    EXECUTING = 'Executing',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
}

export interface AutomationCommand {
    type: AutomationCommandType;
    selector?: string;
    text?: string;
    status: AutomationCommandStatus;
    result?: string;
}

export interface AutomationFlow {
    id: string;
    name: string;
    description: string;
    commands: AutomationCommand[];
}

export interface AutomationSession {
    flow: AutomationFlow;
    currentCommandIndex: number;
    status: 'running' | 'completed' | 'failed';
    iframeUrl: string | null;
}

// File Manager Types
export enum FileType {
    FOLDER = 'Folder',
    DOCUMENT = 'Document',
    SPREADSHEET = 'Spreadsheet',
    PRESENTATION = 'Presentation',
    CODE = 'Code',
}

export interface FileSystemItem {
    id: string;
    name: string;
    type: FileType;
    parentId: string | null;
    lastModified: string;
    content?: any; // string for text, 2D array for spreadsheet, array of slides for presentation
}

// System Operations Types
export interface TerminalLine {
    type: 'input' | 'output' | 'error';
    text: string;
}

// API Integrations Types
export enum ApiIntegrationId {
    GOOGLE_WORKSPACE = 'google_workspace',
    MICROSOFT_365 = 'microsoft_365',
    SLACK = 'slack',
    GITHUB = 'github',
    NOTION = 'notion',
}

export interface ApiIntegration {
    id: ApiIntegrationId;
    name: string;
    isConnected: boolean;
}

// Voice Agent Types
export interface VoiceChatMessage {
    sender: 'User' | 'VoiceAgent';
    text: string;
    files?: FilePreview[];
}

export interface AutomaticNote {
    id: string;
    type: 'Idea' | 'Task' | 'Plan';
    content: string;
}

export interface VoiceAgentState {
    isRecording: boolean;
    voiceChatHistory: VoiceChatMessage[];
    automaticNotes: AutomaticNote[];
}