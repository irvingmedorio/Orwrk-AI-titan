import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MicVocalIcon, TrashIcon, SendIcon, PlusIcon, ImageIcon, VideoIcon, MicIcon, FileTextIcon, FileIcon } from '../components/icons';
// FIX: Import DefaultAgentNames to use for agent name values.
import { VoiceChatMessage, AgentName, FilePreview, AutomaticNote, DefaultAgentNames } from '../types';
import { Input } from '../components/ui/Input';

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

const VoiceChatBubble: React.FC<{ message: VoiceChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'User';
  const bubbleClasses = isUser
    ? 'bg-dark-primary-foreground text-dark-primary self-end'
    : 'bg-dark-secondary text-dark-foreground self-start';
  const senderName = isUser ? 'You' : message.sender;

  return (
    <div className={`max-w-xl w-fit rounded-lg px-4 py-2 ${bubbleClasses}`}>
      <p className="text-xs font-bold mb-1">{senderName}</p>
      {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
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
    </div>
  );
};

const AutomaticNoteItem: React.FC<{ note: AutomaticNote }> = ({ note }) => {
    const { deleteAutomaticNote } = useAgentStore();
    const { t } = useTranslation();
    const iconMap = {
        'Idea': '✅',
        'Task': '📌',
        'Plan': '⏳',
    };
    return (
        <div className="group flex items-start my-1 text-sm p-2 rounded-md hover:bg-dark-accent">
            <span className="mr-3 mt-1">{iconMap[note.type]}</span>
            <div className="flex-1">
                <strong className="text-dark-foreground">{t(note.type.toLowerCase() as any)}:</strong> {note.content}
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteAutomaticNote(note.id)}
            >
                <TrashIcon />
            </Button>
        </div>
    );
};

const VoiceAgentView: React.FC = () => {
    const { t } = useTranslation();
    const { voiceAgentState, toggleVoiceRecording, clearVoiceAgentState, addVoiceChatMessage, downloadPath, deleteAutomaticNote } = useAgentStore();
    const { isRecording, voiceChatHistory, automaticNotes } = voiceAgentState;
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [voiceChatHistory]);


    const handleSave = () => {
        const noteHeader = `## ${new Date().toLocaleDateString()} - Voice Notes\n`;
        const notesContent = automaticNotes.map(note => {
            const iconMap = { 'Idea': '✅', 'Task': '📌', 'Plan': '⏳' };
            return `- ${iconMap[note.type]} ${note.type}: ${note.content}`;
        }).join('\n');
        
        const fullContent = noteHeader + notesContent;
        alert(`${t('notesSavedTo')}:\n\n${downloadPath}\n\n--- CONTENT ---\n${fullContent}`);
    };

    const handleSend = async () => {
        if (input.trim() === '' && files.length === 0) return;

        const filePreviews = await Promise.all(files.map(fileToDataURL));
        
        addVoiceChatMessage({ sender: 'User', text: input, files: filePreviews });
        
        // Simulate agent response
        setTimeout(() => {
            // FIX: Use DefaultAgentNames.Voice instead of AgentName.Voice
            addVoiceChatMessage({ sender: DefaultAgentNames.Voice, text: `I've received your message: "${input}". How can I elaborate on that?` });
        }, 500);

        setInput('');
        setFiles([]);
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

    return (
        <div 
            className={`space-y-6 h-full flex flex-col transition-colors ${isDragging ? 'bg-dark-accent/50' : ''}`}
            onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}
        >
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('voiceAgentTitle')}</h2>
                <p className="text-dark-muted-foreground">{t('voiceAgentDesc')}</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                {/* Left/Center Panel: Chat and Controls */}
                <div className="md:col-span-2 flex flex-col gap-6">
                   <Card className="flex-1 flex flex-col min-h-0">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>{t('voiceChatSession')}</CardTitle>
                             <button
                                onClick={toggleVoiceRecording}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/50' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                <MicVocalIcon />
                            </button>
                        </CardHeader>
                        <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {voiceChatHistory.map((msg, index) => (
                                <VoiceChatBubble key={index} message={msg} />
                            ))}
                        </CardContent>
                        <div className="p-4 border-t border-dark-border">
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
                            <div className="flex items-center space-x-2">
                                 <div className="relative">
                                    <Button onClick={() => setIsMenuOpen(prev => !prev)} variant="ghost" size="icon" disabled={isRecording}>
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
                                <Input
                                    type="text"
                                    placeholder={t('typeOrSpeak')}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1"
                                    disabled={isRecording}
                                />
                                <Button onClick={handleSend} variant="primary" className="p-3" disabled={isRecording}>
                                    <SendIcon />
                                </Button>
                            </div>
                        </div>
                   </Card>
                </div>

                {/* Right Panel: Automatic Notes */}
                <Card className="flex flex-col min-h-0">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>{t('automaticNotes')}</CardTitle>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={handleSave} disabled={automaticNotes.length === 0}>{t('saveNotes')}</Button>
                             <Button variant="destructive" size="icon" onClick={clearVoiceAgentState} disabled={!isRecording && voiceChatHistory.length === 0}>
                                 <TrashIcon />
                             </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                         {automaticNotes.length > 0 ? (
                            <div className="space-y-1">
                                {automaticNotes.map(note => <AutomaticNoteItem key={note.id} note={note} />)}
                            </div>
                         ) : (
                             <p className="text-dark-muted-foreground italic">{t('notesPlaceholder')}</p>
                         )}
                    </CardContent>
                </Card>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={e => onFileSelect(e.target.files)} multiple className="hidden" />
        </div>
    );
};

export default VoiceAgentView;