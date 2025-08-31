
import React from 'react';
import { View } from '../types';
import { useAgentStore } from '../store/agentStore';
import { DashboardIcon, ChatIcon, SettingsIcon, ClockIcon, HistoryIcon, MousePointerIcon, FolderIcon, TerminalIcon, BrainCircuitIcon, MicVocalIcon } from './icons';
import { useTranslation } from '../lib/i18n';

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useAgentStore();
  const { t } = useTranslation();
  
  const navItems = [
    { view: View.Dashboard, icon: <DashboardIcon />, label: t('dashboard') },
    { view: View.Chat, icon: <ChatIcon />, label: t('chat') },
    { view: View.ScheduledTasks, icon: <ClockIcon />, label: t('scheduledTasks') },
    { view: View.History, icon: <HistoryIcon />, label: t('history') },
    { view: View.FileManager, icon: <FolderIcon />, label: t('fileManager') },
    { view: View.VoiceAgent, icon: <MicVocalIcon />, label: t('voiceAgent') },
    { view: View.WebAutomation, icon: <MousePointerIcon />, label: t('webAutomation') },
    { view: View.SystemOperations, icon: <TerminalIcon />, label: t('systemOperations') },
    { view: View.Settings, icon: <SettingsIcon />, label: t('settings') },
  ];

  return (
    <nav className="w-64 p-4 border-r border-dark-border bg-dark-secondary flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-foreground">Onwrk-AI Titan</h1>
        <p className="text-sm text-dark-muted-foreground">{t('autonomousStudio')}</p>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.view}>
            <button
              onClick={() => setCurrentView(item.view)}
              className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                currentView === item.view
                  ? 'bg-dark-primary-foreground text-dark-primary'
                  : 'hover:bg-dark-accent'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto text-xs text-dark-muted-foreground">
        <p>© 2024 Onwrk. All rights reserved.</p>
        <p>Version 1.0.0</p>
      </div>
    </nav>
  );
};

export default Sidebar;