
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CustomCard = ({ 
  gradient = false, 
  hover = true,
  className, 
  children, 
  ...props 
}: CustomCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/30 p-5",
        "bg-background/30 text-white glass-effect shadow-subtle transition-all duration-300",
        hover && "hover:shadow-glow hover:-translate-y-1 hover:border-primary/30",
        gradient && "bg-gradient-to-br from-primary/20 to-secondary/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn("text-sm text-white/70", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default CustomCard;
