import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  [key: string]: unknown;
}

export const Container: React.FC<ContainerProps> = ({
  className,
  as: Component = 'div',
  children,
  ...props
}) => (
  <Component
    className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    {...props}
  >
    {children}
  </Component>
);

export const Section: React.FC<ContainerProps> = ({
  className,
  as: Component = 'section',
  children,
  ...props
}) => (
  <Component
    className={cn("py-12 md:py-20 lg:py-24", className)}
    {...props}
  >
    {children}
  </Component>
);
