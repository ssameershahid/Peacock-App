import React from 'react';
import { Link } from 'wouter';
import { Container } from '@/components/peacock/Container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DesignAdventureCTA = () => {
  return (
    <div className="bg-background">
      <Container className="pt-[50px] pb-[70px]">
        <div className="relative rounded-3xl p-8 md:p-16 overflow-hidden text-center bg-black h-[620px]">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://s3.amazonaws.com/webflow-prod-assets/68fe492bc39e0e661cce824d/698395f1ee00ef17241321e4_Screen%20Recording%202026-02-04%20at%2011.51.42%E2%80%AFPM.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 max-w-[700px] mx-auto space-y-6 flex flex-col justify-center items-center mt-[30px] h-[400px]">
            <Badge className="bg-primary text-primary-foreground border-0 mb-4 hover:bg-primary">Custom Travel</Badge>
            <h2 className="font-display text-3xl md:text-[54px] font-normal leading-tight text-white">
              Design your own adventure
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Don't see what you're looking for? Use our interactive trip planner to build a route that perfectly matches your pace and interests.
            </p>
            <div className="pt-4">
              <Link href="/tours/custom">
                <Button
                  size="lg"
                  variant="ghost"
                  className="relative overflow-hidden bg-white/15 text-white font-bold rounded-full h-14 px-8 text-lg border border-white/[0.03] opacity-80 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_8px_32px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 hover:border-white/40 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_8px_40px_-4px_rgba(0,0,0,0.25)] before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none"
                >
                  Start Trip Wizard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DesignAdventureCTA;
