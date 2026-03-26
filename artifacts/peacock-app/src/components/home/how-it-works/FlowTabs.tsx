import React from 'react';
import { cn } from '@/lib/utils';

interface FlowTabsProps {
  flows: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

const FlowTabs: React.FC<FlowTabsProps> = ({ flows, activeId, onChange }) => {
  return (
    <div className="flex overflow-x-auto no-scrollbar py-1">
      <div className="inline-flex items-center p-1 rounded-full bg-[var(--tw-ring-offset-color)] border border-[rgba(232,230,227,1)]">
        {flows.map((flow) => {
          const isActive = activeId === flow.id;
          return (
            <button
              key={flow.id}
              onClick={() => onChange(flow.id)}
              className={cn(
                "relative mx-5 px-5 py-2.5 rounded-full text-base font-bold transition-all duration-300 whitespace-nowrap",
                isActive
                  ? "bg-[rgba(25,82,76,1)] text-white shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              {flow.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FlowTabs;
