import React from 'react';
import { TRUST_ITEMS } from './howItWorksContent';

const TrustStrip = () => {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 pt-8 border-t border-border/50">
      {TRUST_ITEMS.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <item.icon className="h-4 w-4 text-primary/60" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustStrip;
