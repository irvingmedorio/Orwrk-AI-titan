
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-dark-secondary border border-dark-border rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-dark-foreground ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<CardProps> = ({ children, className }) => (
  <p className={`text-sm text-dark-muted-foreground ${className}`}>{children}</p>
);

// FIX: Update CardContent to use React.forwardRef. This allows a ref to be passed
// to the underlying div element, which is necessary for scrolling the chat view in VoiceAgentView.
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
CardContent.displayName = 'CardContent';
