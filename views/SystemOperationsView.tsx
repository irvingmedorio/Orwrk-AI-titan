import React, { useState, useEffect, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TerminalLine } from '../types';

const SystemOperationsView: React.FC = () => {
    const { t } = useTranslation();
    const { terminalHistory, executeTerminalCommand } = useAgentStore();
    const [input, setInput] = useState('');
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalHistory]);

    const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            executeTerminalCommand(input);
            setInput('');
        }
    };

    const renderLine = (line: TerminalLine, index: number) => {
        switch (line.type) {
            case 'input':
                return <div key={index}><span className="text-green-400">$ &gt; </span><span>{line.text}</span></div>;
            case 'output':
                return <div key={index} className="whitespace-pre-wrap">{line.text}</div>;
            case 'error':
                 return <div key={index} className="text-red-400 whitespace-pre-wrap">{line.text}</div>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('systemOperations')}</h2>
                <p className="text-dark-muted-foreground">{t('systemOperationsDesc')}</p>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col bg-black rounded-lg font-mono text-sm">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {terminalHistory.map(renderLine)}
                        <div ref={terminalEndRef} />
                    </div>
                    <div className="flex items-center mt-2">
                        <span className="text-green-400 mr-2">$ &gt;</span>
                        <Input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleCommand}
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 p-0 text-sm"
                            placeholder={t('terminalPlaceholder')}
                            autoFocus
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemOperationsView;