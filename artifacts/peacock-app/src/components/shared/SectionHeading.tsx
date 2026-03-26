import React from 'react';
import { cn, parseHeadingParts } from '@/lib/utils';

interface SectionHeadingProps {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({ overline, title, subtitle, align = 'left', className }: SectionHeadingProps) {
  const parts = parseHeadingParts(title);
  return (
    <div className={cn(`flex flex-col mb-12`, align === 'center' && 'items-center text-center', className)}>
      {overline && (
        <span className="font-body text-[12px] font-medium tracking-[0.08em] uppercase text-amber-200 mb-3">
          {overline}
        </span>
      )}
      <h2 className="font-display font-normal text-[28px] md:text-[40px] text-warm-900 leading-[1.15] mb-4">
        {parts.map((p, i) =>
          p.italic ? <em key={i} className="italic">{p.text}</em> : <span key={i}>{p.text}</span>
        )}
      </h2>
      {subtitle && (
        <p className="font-body text-lg text-warm-500 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
