import React from 'react';
import { cn } from '@/lib/utils';

interface TypeProps {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

export const H1: React.FC<TypeProps> = ({ children, className, as: Component = 'h1', style, ...props }) => (
  <Component
    className={cn("font-display font-normal tracking-tight text-foreground leading-[1.1] text-4xl md:text-6xl lg:text-[56px]", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const H2: React.FC<TypeProps> = ({ children, className, as: Component = 'h2', style, ...props }) => (
  <Component
    className={cn("font-display font-normal text-[28px] md:text-[40px] tracking-tight text-foreground leading-[1.15]", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const H3: React.FC<TypeProps> = ({ children, className, as: Component = 'h3', style, ...props }) => (
  <Component
    className={cn("font-display font-normal text-2xl md:text-[32px] tracking-normal text-foreground leading-[1.2]", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const H4: React.FC<TypeProps> = ({ children, className, as: Component = 'h4', style, ...props }) => (
  <Component
    className={cn("font-display font-normal text-xl md:text-2xl tracking-normal text-foreground leading-[1.3]", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const P: React.FC<TypeProps> = ({ children, className, as: Component = 'p', style, ...props }) => (
  <Component
    className={cn("font-body text-base text-warm-500 leading-relaxed", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const Small: React.FC<TypeProps> = ({ children, className, as: Component = 'p', style, ...props }) => (
  <Component
    className={cn("font-body text-sm text-warm-500 leading-normal", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);

export const Kicker: React.FC<TypeProps> = ({ children, className, as: Component = 'span', style, ...props }) => (
  <Component
    className={cn("font-body text-xs font-medium uppercase tracking-[0.08em] text-amber-200 mb-2 block", className)}
    style={style}
    {...props}
  >
    {children}
  </Component>
);
