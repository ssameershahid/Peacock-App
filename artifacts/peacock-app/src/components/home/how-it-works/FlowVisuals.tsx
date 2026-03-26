import React from 'react';
import { MapPin, Clock, CheckCircle2, Sparkles, PenLine, Plane, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const GlassCard = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden", className)}>
    {children}
  </div>
);

const PulseDot = ({ color = "bg-primary" }: { color?: string }) => (
  <span className="relative flex h-3 w-3">
    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
    <span className={cn("relative inline-flex rounded-full h-3 w-3", color)}></span>
  </span>
);

export const ReadyToGoVisual = () => {
  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
        alt="Scenic Train"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-xs bg-white/95 text-foreground transform transition-transform hover:scale-105 duration-500">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selected Tour</div>
              <div className="font-display font-normal text-lg">Hill Country Rails</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="p-5 space-y-6 relative">
            <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-100" />

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-300 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white z-10" />
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground">Day 1</div>
                <div className="text-sm font-semibold">Kandy Temple</div>
              </div>
            </div>

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-700 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white z-10" />
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground">Day 2-3</div>
                <div className="text-sm font-semibold">Tea Plantations</div>
              </div>
            </div>

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-1000 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white z-10" />
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground">Day 4</div>
                <div className="text-sm font-semibold">Ella Rock Hike</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-secondary/30 text-center animate-in fade-in duration-500 delay-[1500ms] fill-mode-both">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" /> Driver Included
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export const CreateYourOwnVisual = () => {
  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      <img
        src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df064c0a6b469e5a7164_Screenshot%202026-02-09%20at%203.56.00%E2%80%AFPM.png"
        alt="Sri Lanka countryside"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-xs bg-white/95 text-foreground transform transition-transform hover:scale-105 duration-500">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Route</div>
              <div className="font-display font-normal text-lg">Colombo to East Coast</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <PenLine className="h-4 w-4" />
            </div>
          </div>

          <div className="p-5 space-y-6 relative">
            <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-100" />

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-300 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white z-10" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-muted-foreground">Day 1–2</div>
                  <div className="text-sm font-semibold">Sigiriya & Dambulla</div>
                </div>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            </div>

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-700 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white z-10" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-muted-foreground">Day 3–4</div>
                  <div className="text-sm font-semibold">Trincomalee Beach</div>
                </div>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            </div>

            <div className="relative flex items-center gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-1000 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white z-10" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-muted-foreground">Day 5</div>
                  <div className="text-sm font-semibold">Passikudah</div>
                </div>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-secondary/30 flex items-center justify-center gap-4 animate-in fade-in duration-500 delay-[1500ms] fill-mode-both">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> 3 Stops
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Clock className="h-3 w-3" /> 5 Days
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export const TransfersVisual = () => {
  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      <img
        src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989f1fd72345b70e1ffcd77_Screenshot%202026-02-09%20at%203.54.02%E2%80%AFPM.png"
        alt="Sri Lanka coastal road"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-xs bg-white/95 text-foreground transform transition-transform hover:scale-105 duration-500">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirmed Transfer</div>
              <div className="font-display font-normal text-lg">Airport to Galle</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="p-5 space-y-1 relative">
            <div className="absolute left-[29px] top-10 bottom-12 w-0.5 bg-gray-200 border-l border-dashed border-gray-300" />

            <div className="relative flex items-start gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-300 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white z-10 mt-1" />
              <div className="flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pickup</div>
                <div className="text-sm font-semibold">Bandaranaike Airport</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Plane className="h-3 w-3" /> CMB — Terminal 1
                </div>
              </div>
            </div>

            <div className="h-6" />

            <div className="relative flex items-start gap-4 animate-in slide-in-from-left-4 fade-in duration-700 delay-700 fill-mode-both">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white z-10 mt-1" />
              <div className="flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Drop-off</div>
                <div className="text-sm font-semibold">Galle Fort</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> Southern Province
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pb-4 animate-in fade-in duration-500 delay-1000 fill-mode-both">
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2.5">
              <div className="text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Distance</div>
                <div className="text-sm font-bold text-foreground">162 km</div>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</div>
                <div className="text-sm font-bold text-foreground">3h 15m</div>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price</div>
                <div className="text-sm font-bold text-foreground">$145</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-secondary/30 text-center animate-in fade-in duration-500 delay-[1500ms] fill-mode-both">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" /> Instant Confirmation
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
