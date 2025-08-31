
import React, { useEffect } from 'react';
import { useAgentStore } from './store/agentStore';
import { View } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ChatView from './views/ChatView';
import SettingsView from './views/SettingsView';
import ScheduledTasksView from './views/ScheduledTasksView';
import TaskDetailsView from './views/TaskDetailsView';
import HistoryView from './views/HistoryView';
import WebAutomationView from './views/WebAutomationView';
import FileManagerView from './views/FileManagerView';
import SystemOperationsView from './views/SystemOperationsView';
import ConfirmationModal from './components/ConfirmationModal';
import { useSimulation } from './hooks/useSimulation';
import VoiceAgentView from './views/VoiceAgentView';

const App: React.FC = () => {
  const { 
    confirmation, 
    currentView,
  } = useAgentStore();
  
  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Run all real-time data simulations from a custom hook
  useSimulation();

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView />;
      case View.Chat:
        return <ChatView />;
      case View.ScheduledTasks:
        return <ScheduledTasksView />;
      case View.History:
        return <HistoryView />;
      case View.WebAutomation:
        return <WebAutomationView />;
      case View.FileManager:
        return <FileManagerView />;
      case View.SystemOperations:
        return <SystemOperationsView />;
      case View.VoiceAgent:
        return <VoiceAgentView />;
      case View.Settings:
        return <SettingsView />;
      case View.TaskDetails:
        return <TaskDetailsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-dark-background text-dark-foreground">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderView()}
      </main>
      {confirmation.isActive && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onReject={confirmation.onReject}
        />
      )}
    </div>
  );
};

export default App;