import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../store/agentStore';
// FIX: Import DefaultAgentNames to use for agent name values.
import { AgentName, ChatMessage, FilePreview, AgentStatus, DeepReasoningStage, ApiActionSuggestion, ApiIntegrationId, WebIntelligenceSuggestion, CommandSuggestion, WebIntelligenceStatus, DefaultAgentNames } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { SendIcon, FileIcon, TrashIcon, PlusIcon, ImageIcon, VideoIcon, MicIcon, FileTextIcon, LightbulbIcon, GoogleIcon, SlackIcon, GithubIcon, BrainCircuitIcon, GlobeIcon } from '../components/icons';
import { useTranslation } from '../lib/i18n';
import DeepReasoningVisualizer from '../components/DeepReasoningVisualizer';
import WebIntelligenceVisualizer from '../components/WebIntelligenceVisualizer';

const TaskSuggestionCard: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const { handleTaskSuggestion } = useAgentStore();
  const { t } = useTranslation();
  const suggestion = message.suggestion!;

  if (suggestion.status === 'accepted') {
    return (
      <p className="text-sm italic text-green-400 mt-2 p-2 border-l-2 border-green-400">
        {t('taskAccepted')}
      </p>
    );
  }

  if (suggestion.status === 'rejected') {
    return (
      <p className="text-sm italic text-red-400 mt-2 p-2 border-l-2 border-red-400">
        {t('taskRejected')}
      </p>
    );
  }
  
  const renderDetails = () => {
    switch(suggestion.suggestionType) {
        case 'web-mission':
            const webDetails = suggestion.details as WebIntelligenceSuggestion;
            return (
                 <ul className="space-y-1 list-disc list-inside text-dark-muted-foreground">
                    <li><strong>{t('missionQuery')}:</strong> {webDetails.mission}</li>
                 </ul>
            );
        case 'api-action':
            const apiDetails = suggestion.details as ApiActionSuggestion;
            const serviceName = useAgentStore.getState().apiIntegrations.find(i => i.id === apiDetails.serviceId)?.name || 'API';
            let ServiceIcon;
            switch(apiDetails.serviceId) {
                case ApiIntegrationId.GOOGLE_WORKSPACE: ServiceIcon = GoogleIcon; break;
                case ApiIntegrationId.SLACK: ServiceIcon = SlackIcon; break;
                case ApiIntegrationId.GITHUB: ServiceIcon = GithubIcon; break;
                default: ServiceIcon = () => null;
            }
            return (
                <ul className="space-y-1 list-disc list-inside text-dark-muted-foreground">
                    <li><strong>{t('action')}:</strong> {apiDetails.action}</li>
                    <li className="flex items-center gap-2"><strong>{t('service')}:</strong> <ServiceIcon /> {serviceName}</li>
                </ul>
            );
        case 'task':
        default:
             return (
                 <ul className="space-y-1 list-disc list-inside text-dark-muted-foreground">
                  <li><strong>{t('description')}:</strong> {suggestion.description}</li>
                  <li><strong>{t('agents')}:</strong> {suggestion.assignedAgents!.join(', ')}</li>
                  <li><strong>{t('priority')}:</strong> {t(suggestion.priority!.toLowerCase() as any)}</li>
                  <li><strong>{t('estimatedTime')}:</strong> {suggestion.estimatedTime}</li>
                </ul>
             );
    }
  };

  const titleMap = {
    'task': t('taskSuggestion'),
    'api-action': t('apiActionSuggestion'),
    'web-mission': t('webMissionSuggestion'),
    'command': 'Command Suggestion'
  };
  const title = titleMap[suggestion.suggestionType] || t('taskSuggestion');
  const Icon = suggestion.suggestionType === 'web-mission' ? BrainCircuitIcon : () => <span className="font-emoji">📌</span>;

  return (
    <Card className="mt-2 bg-dark-background/50 border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Icon /> {title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {renderDetails()}
        {suggestion.status === 'pending' && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => handleTaskSuggestion(message.id, false)}>{t('reject')}</Button>
            <Button size="sm" variant="primary" onClick={() => handleTaskSuggestion(message.id, true)}>{t('accept')}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'User';
  const bubbleClasses = isUser
    ? 'bg-dark-primary-foreground text-dark-primary self-end'
    : 'bg-dark-secondary text-dark-foreground self-start';
  const senderName = isUser ? 'You' : message.sender;

  return (
    <div className={`max-w-xl w-fit rounded-lg px-4 py-2 ${bubbleClasses}`}>
      <p className="text-xs font-bold mb-1">{senderName}</p>
      {message.text && <p className="whitespace-pre-wrap">{message.text.split('### 💡')[0]}</p>}
      
      {message.text.includes('### 💡') && (
        <Card className="mt-2 bg-dark-background/50 border-dark-border">
          <CardContent className="text-sm pt-4">
            <div dangerouslySetInnerHTML={{ __html: message.text.substring(message.text.indexOf('### 💡')).replace(/### 💡/g, '<h3 class="flex items-center gap-2 font-bold text-base mb-2"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg> Deep Reasoning Report</h3>').replace(/\*\*(.*?)\*\*:/g, '<strong class="text-dark-foreground block mt-3 mb-1">$1:</strong>') }} />
          </CardContent>
        </Card>
      )}

      {message.suggestion && <TaskSuggestionCard message={message} />}
      
      {message.deepReasoningState && <DeepReasoningVisualizer state={message.deepReasoningState} />}
      
      {message.webIntelligenceState && <WebIntelligenceVisualizer state={message.webIntelligenceState} />}

      {message.files && message.files.length > 0 && (
        <div className={`mt-2 grid gap-2 grid-cols-2 ${message.files.length > 2 ? 'sm:grid-cols-3' : ''}`}>
          {message.files.map((file, index) => (
            <div key={index} className="rounded-lg overflow-hidden border border-dark-border bg-dark-background">
              {file.type.startsWith('image/') ? (
                <img src={file.content} alt={file.name} className="w-full h-24 object-cover" />
              ) : (
                <div className="p-2 h-24 flex flex-col items-center justify-center">
                  <FileIcon />
                  <span className="text-xs text-center break-all w-full mt-1">{file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-right opacity-60 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

const fileToDataURL = (file: File): Promise<FilePreview> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        content: reader.result as string,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ChatView: React.FC = () => {
  const { chatMessages, addChatMessage, setAgents } = useAgentStore();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'chat' | 'agent'>('chat');
  
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeepReasoning, setIsDeepReasoning] = useState(false);
  const [isWebIntelligence, setIsWebIntelligence] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (input.trim() === '' && files.length === 0) {
        setError(t('cannotSendEmptyMessage'));
        return;
    }
    
    const filePreviews = await Promise.all(files.map(fileToDataURL));

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'User',
      text: input,
      files: filePreviews,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    const userMessageText = input.toLowerCase();
    const deepReasoningKeywords = ['plan', 'strateg', 'optimize', 'complex', 'decision', 'growth plan', '/deepthink'];
    const webIntelKeywords = ['trends', 'latest on', 'what are the newest', 'market research'];
    const taskKeywords = ['research', 'analyze', 'create', 'report', 'investigate', 'summarize', 'build', 'find'];
    const apiKeywords: { [key: string]: { service: ApiIntegrationId, action: string } } = {
        'email': { service: ApiIntegrationId.GOOGLE_WORKSPACE, action: 'Send Email' },
        'mail': { service: ApiIntegrationId.GOOGLE_WORKSPACE, action: 'Send Email' },
        'slack': { service: ApiIntegrationId.SLACK, action: 'Post Message' },
        'github': { service: ApiIntegrationId.GITHUB, action: 'Create Issue' },
        'post to': { service: ApiIntegrationId.SLACK, action: 'Post Message' },
    };
    
    // Explicit mode toggles take precedence
    if (isDeepReasoning) {
        setAgents(useAgentStore.getState().agents.map(a => 
            // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
            a.name === DefaultAgentNames.Planner ? { ...a, status: AgentStatus.DeepReasoning, task: 'Initiating deep reasoning process...' } : a
        ));
        addChatMessage({
            id: `${userMessage.id}-reasoning`,
            // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
            sender: DefaultAgentNames.Planner,
            text: t('analyzingDeeply'),
            timestamp: new Date().toISOString(),
            deepReasoningState: {
                stage: DeepReasoningStage.DECOMPOSING,
                progress: 0,
                isComplete: false,
            }
        });
    } else if (isWebIntelligence) {
        addChatMessage({
            id: `${userMessage.id}-webintel`,
            // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
            sender: DefaultAgentNames.Planner,
            text: `🌐 ${t('missionInProgress')}...`,
            timestamp: new Date().toISOString(),
            webIntelligenceState: {
                id: `wi-${Date.now()}`,
                query: input,
                status: WebIntelligenceStatus.PLANNING,
                progress: 0,
                discoveredUrls: [],
                extractedInsights: [],
                finalReport: null,
                startDate: new Date().toISOString(),
            }
        });
    } else { // Keyword detection as fallback
        let isDeepReasoningKeyword = deepReasoningKeywords.some(k => userMessageText.includes(k));
        let isWebIntelKeyword = !isDeepReasoningKeyword && webIntelKeywords.some(k => userMessageText.includes(k));
        let isTask = !isDeepReasoningKeyword && !isWebIntelKeyword && taskKeywords.some(k => userMessageText.includes(k));
        let apiKeywordFound = Object.keys(apiKeywords).find(k => userMessageText.includes(k));
        
        setTimeout(() => {
            if (isDeepReasoningKeyword) {
                 addChatMessage({
                    id: `${userMessage.id}-reasoning`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: t('analyzingDeeply'),
                    timestamp: new Date().toISOString(),
                    deepReasoningState: {
                        stage: DeepReasoningStage.DECOMPOSING,
                        progress: 0,
                        isComplete: false,
                    }
                });
            } else if (isWebIntelKeyword) {
                addChatMessage({
                    id: `msg-${Date.now()}-sugg`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: "I can initiate a Web Intelligence mission to find that information. Please confirm.",
                    timestamp: new Date().toISOString(),
                    suggestion: {
                        suggestionType: 'web-mission',
                        status: 'pending',
                        details: { mission: `Research on: "${input}"` } as WebIntelligenceSuggestion
                    }
                });
            } else if (apiKeywordFound) {
                const { service, action } = apiKeywords[apiKeywordFound];
                addChatMessage({
                    id: `msg-${Date.now()}-sugg`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: "I can help with that using a connected service. Please confirm the action.",
                    timestamp: new Date().toISOString(),
                    suggestion: {
                        suggestionType: 'api-action',
                        details: { serviceId: service, action: `${action} with content: "${input}"` },
                        status: 'pending'
                    }
                });
            } else if (isTask) {
                addChatMessage({
                    id: `msg-${Date.now()}-sugg`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: "Based on your request, I've prepared a task suggestion. Please review and approve.",
                    timestamp: new Date().toISOString(),
                    suggestion: {
                        description: `"${input}"`,
                        // FIX: Use DefaultAgentNames for agent names
                        assignedAgents: [DefaultAgentNames.Research, DefaultAgentNames.Planner],
                        priority: 'Medium',
                        estimatedTime: '1 hour',
                        status: 'pending',
                        suggestionType: 'task',
                        details: {},
                    }
                });
            } else {
                addChatMessage({
                    id: `msg-${Date.now()}-ack`,
                    // FIX: Use DefaultAgentNames.Planner instead of AgentName.Planner
                    sender: DefaultAgentNames.Planner,
                    text: `Acknowledged. Analyzing your request. I will now coordinate with the team.`,
                    timestamp: new Date().toISOString(),
                });
            }
        }, 1500);
    }
    
    setInput('');
    setFiles([]);
    setError('');
    setIsDeepReasoning(false);
    setIsWebIntelligence(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
        setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
    } else if (e.type === 'dragleave') {
        setIsDragging(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = (accept: string) => {
    if (fileInputRef.current) {
        fileInputRef.current.accept = accept;
        fileInputRef.current.click();
    }
    setIsMenuOpen(false);
  };

  const menuOptions = [
    { label: t('image'), icon: <ImageIcon />, accept: 'image/*' },
    { label: t('video'), icon: <VideoIcon />, accept: 'video/*' },
    { label: t('audio'), icon: <MicIcon />, accept: 'audio/*' },
    { label: t('document'), icon: <FileTextIcon />, accept: '.pdf,.doc,.docx,.txt,.md' },
  ];

  const getPlaceholder = () => {
    if (isDeepReasoning) return t('deepReasoningActive');
    if (isWebIntelligence) return t('webIntelligenceActive');
    return t('typeInstruction');
  };

  return (
    <div 
      className={`flex flex-col h-full transition-colors ${isDragging ? 'bg-dark-accent/50' : ''}`}
      onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}
    >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-3xl font-bold tracking-tight">
                {t('agenChat')}
            </h2>
            <div className="flex space-x-2">
                <Button onClick={() => setMode('chat')} variant={mode === 'chat' ? 'secondary' : 'outline'}>{t('agenChat')}</Button>
                <Button onClick={() => setMode('agent')} variant={mode === 'agent' ? 'secondary' : 'outline'}>{t('agentMode')}</Button>
            </div>
        </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-dark-secondary/50 rounded-lg border border-dark-border"
      >
        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="mt-4">
        <input type="file" ref={fileInputRef} onChange={e => onFileSelect(e.target.files)} multiple className="hidden" />
        
        {files.length > 0 && (
            <div className="mb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {files.map((file, index) => (
                <div key={index} className="relative group bg-dark-secondary p-2 rounded-lg">
                    {file.type.startsWith("image/") ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-20 object-cover rounded"/>
                    ) : (
                        <div className="w-full h-20 flex flex-col items-center justify-center rounded"><FileIcon /></div>
                    )}
                    <p className="text-xs truncate mt-1">{file.name}</p>
                    <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon />
                    </button>
                </div>
            ))}
            </div>
        )}
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="relative flex items-center space-x-2">
            <div className="relative">
                <Button onClick={() => setIsMenuOpen(prev => !prev)} variant="ghost" size="icon">
                    <PlusIcon />
                </Button>
                {isMenuOpen && (
                    <div className="absolute bottom-full mb-2 w-48 bg-dark-secondary border border-dark-border rounded-md shadow-lg z-10">
                        {menuOptions.map(option => (
                             <button key={option.label} onClick={() => handleAttachmentClick(option.accept)} className="w-full text-left px-4 py-2 text-sm hover:bg-dark-accent flex items-center gap-2">
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <Button 
                onClick={() => { setIsDeepReasoning(prev => !prev); setIsWebIntelligence(false); }} 
                variant={isDeepReasoning ? "secondary" : "ghost"} 
                size="icon"
                title={t('toggleDeepReasoning')}
            >
                <BrainCircuitIcon />
            </Button>
             <Button 
                onClick={() => { setIsWebIntelligence(prev => !prev); setIsDeepReasoning(false); }} 
                variant={isWebIntelligence ? "secondary" : "ghost"} 
                size="icon"
                title={t('toggleWebIntelligence')}
            >
                <GlobeIcon />
            </Button>
            <Input
              type="text"
              placeholder={getPlaceholder()}
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} variant="primary" className="p-3">
              <SendIcon />
              <span className="sr-only">{t('sendMessage')}</span>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;