import React from 'react';

// FIX: Add size prop to ButtonProps to allow for different button sizes.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // FIX: Destructure the new 'size' prop with 'default' as its default value.
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      primary: 'bg-dark-primary-foreground text-dark-primary hover:bg-dark-primary-foreground/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-dark-input bg-transparent hover:bg-dark-accent hover:text-dark-accent-foreground',
      secondary: 'bg-dark-secondary text-dark-secondary-foreground hover:bg-dark-secondary/80',
      ghost: 'hover:bg-dark-accent hover:text-dark-accent-foreground',
    };

    // FIX: Define classes for different button sizes.
    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        // FIX: Apply size-specific classes instead of hardcoded padding.
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
