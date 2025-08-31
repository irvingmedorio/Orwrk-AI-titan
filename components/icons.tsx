import React from 'react';

const iconProps = {
  className: "h-5 w-5",
};

export const DashboardIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export const ChatIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export const ClockIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

export const HistoryIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V21" />
    </svg>
);

export const SettingsIcon: React.FC = () => (
  <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MicVocalIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v3m0 0h-2m2 0h2M5 11a7 7 0 0114 0m-7 6v3m-3.5-9.5A3.5 3.5 0 0112 4.5v5a3.5 3.5 0 01-7 0z" />
    </svg>
);

export const MousePointerIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l5-2 2 8z" />
    </svg>
);

export const FolderIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

export const TerminalIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
);

export const BrainCircuitIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6M9 12h6m-6 4h6m2-12a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2m-4-10a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-2m-4-4a2 2 0 012-2h2a2 2 0 012 2m0 0v2m-4-2v2" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const GlobeIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.3l.16-.295A2 2 0 0110 8h4a2 2 0 011.84 1.005l.16.295M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

export const CpuIcon: React.FC = () => (
    <svg {...iconProps} className="h-4 w-4 text-dark-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1M9 6l1.07-1.07M15 6l-1.07-1.07M9 18l1.07 1.07M15 18l-1.07 1.07M5.64 5.64L6.7 6.7M18.36 5.64L17.3 6.7M5.64 18.36l1.06-1.06M18.36 18.36l-1.06-1.06" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
);

export const RamIcon: React.FC = () => (
    <svg {...iconProps} className="h-4 w-4 text-dark-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4v16M18 4v16" />
    </svg>
);

export const SendIcon: React.FC = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const FileIcon: React.FC = () => (
    <svg className="h-8 w-8 text-dark-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PlusIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const ImageIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const VideoIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const MicIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v3m0 0h-2m2 0h2M5 11a7 7 0 0114 0m-7 6v3m-3.5-9.5A3.5 3.5 0 0112 4.5v5a3.5 3.5 0 01-7 0z" />
    </svg>
);

export const FileTextIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const LightbulbIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const PauseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
    </svg>
);

export const PlayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const StopIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
    </svg>
);

export const PowerIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
    </svg>
);

export const TableIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M9 4v16M15 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
);

export const PresentationIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m12-4h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4H4m16 0l-4.5-4.5M4 12l4.5-4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
    </svg>
);

export const CodeIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

export const UserPlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10h4m-2-2v4" />
    </svg>
);

export const PencilIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);


// API Integration Icons
export const GoogleIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.35 11.1H12.18V13.83H18.67C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.42 5.03 12.5C5.03 8.58 8.36 5.73 12.19 5.73C14.04 5.73 15.63 6.36 16.85 7.48L19.09 5.24C17.11 3.44 14.83 2.5 12.19 2.5C6.96 2.5 2.73 6.73 2.73 12.5C2.73 18.27 6.96 22.5 12.19 22.5C17.6 22.5 21.5 18.53 21.5 12.83C21.5 12.03 21.45 11.56 21.35 11.1Z" />
  </svg>
);

export const SlackIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.04 15.12c0 1.58.98 2.88 2.22 2.88s2.22-1.3 2.22-2.88c0-1.58-.98-2.88-2.22-2.88s-2.22 1.3-2.22 2.88zM9.42 15.12c0-1.58.98-2.88 2.22-2.88s2.22 1.3 2.22 2.88v4.98c0 1.58-.98 2.88-2.22 2.88s-2.22-1.3-2.22-2.88v-4.98zM8.88 9.42c-1.58 0-2.88-.98-2.88-2.22s1.3-2.22 2.88-2.22c1.58 0 2.88.98 2.88 2.22s-1.3 2.22-2.88 2.22zM8.88 1.08c1.58 0 2.88.98 2.88 2.22v4.5c0 1.58-1.3 2.88-2.88 2.88c-1.58 0-2.88-.98-2.88-2.88v-4.5c0-1.24.98-2.22 2.88-2.22zM15.12 8.88c1.58 0 2.88.98 2.88 2.22s-1.3 2.22-2.88 2.22c-1.58 0-2.88-.98-2.88-2.22s1.3-2.22 2.88-2.22zM22.92 8.88c-1.58 0-2.88.98-2.88 2.22v-4.5c0-1.58 1.3-2.88 2.88-2.88c1.58 0 2.88.98 2.88 2.22v4.5c0 1.24-.98 2.22-2.88 2.22zM14.58 14.58c0-1.58.98-2.88 2.22-2.88s2.22 1.3 2.22 2.88c0 1.58-.98 2.88-2.22 2.88s-2.22-1.3-2.22-2.88zm-4.98 0c0 1.58-.98 2.88-2.22 2.88s-2.22-1.3-2.22-2.88v-4.98c0-1.58.98-2.88 2.22-2.88s2.22 1.3 2.22 2.88v4.98z" />
  </svg>
);

export const GithubIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export const MicrosoftIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 21.9h-9.3v-9.3h9.3v9.3zm0-11.4h-9.3v-9.3h9.3v9.3zm11.5 11.4h-9.4v-9.3h9.4v9.3zm0-11.4h-9.4v-9.3h9.4v9.3z" />
  </svg>
);

export const NotionIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor" >
       <path d="M14.463 3.235L5.5 20.765V3.235h8.963zm.575 0h3.512v17.529h-3.512V3.235zm-9.538 0H1.988v17.529h3.512V3.235z"/>
    </svg>
);