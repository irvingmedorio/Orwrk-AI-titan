import React from 'react';
import { AgentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'border-transparent bg-dark-primary-foreground text-dark-primary',
    secondary: 'border-transparent bg-dark-secondary text-dark-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'text-foreground',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</div>;
};

export const getStatusColor = (status: AgentStatus): string => {
  switch (status) {
    case AgentStatus.Idle:
      return 'bg-gray-500';
    case AgentStatus.Thinking:
      return 'bg-blue-500 animate-pulse';
    case AgentStatus.Executing:
      return 'bg-green-500';
    case AgentStatus.AwaitingConfirmation:
      return 'bg-yellow-500 animate-ping';
    case AgentStatus.Error:
      return 'bg-red-500';
    case AgentStatus.Inactive:
      return 'bg-gray-700';
    default:
      return 'bg-gray-700';
  }
};