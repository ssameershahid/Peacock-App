import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '@/components/peacock/Container';
import { H2, P, Kicker } from '@/components/peacock/Type';
import { Button } from '@/components/ui/button';
import { FLOW_CONTENT } from './how-it-works/howItWorksContent';
import FlowTabs from './how-it-works/FlowTabs';
import StepCards from './how-it-works/StepCards';
import TrustStrip from './how-it-works/TrustStrip';
import { ReadyToGoVisual, CreateYourOwnVisual, TransfersVisual } from './how-it-works/FlowVisuals';

interface HowItWorksSectionProps {
  merged?: boolean;
}

const HowItWorksSection = ({ merged }: HowItWorksSectionProps) => {
  const [activeFlowId, setActiveFlowId] = useState(FLOW_CONTENT[0].id);
  const activeFlow = FLOW_CONTENT.find(f => f.id === activeFlowId) || FLOW_CONTENT[0];

  const renderVisual = () => {
    switch (activeFlowId) {
      case 'ready-to-go': return <ReadyToGoVisual />;
      case 'create-your-own': return <CreateYourOwnVisual />;
      case 'transfers': return <TransfersVisual />;
      default: return <ReadyToGoVisual />;
    }
  };

  const inner = (
    <Container>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <Kicker>Process</Kicker>
        <H2 className="mb-4 md:text-6xl">How Peacock Drivers works</H2>
        <P className="max-w-2xl mx-auto pt-5 text-lg">
          Book a trusted driver-guide in minutes — with clear routes, transparent pricing, and secure checkout.
        </P>
      </div>

      <div className="flex justify-center mb-12">
        <FlowTabs
          flows={FLOW_CONTENT.map(f => ({ id: f.id, label: f.label }))}
          activeId={activeFlowId}
          onChange={setActiveFlowId}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h3 className="text-3xl md:text-4xl font-display font-normal text-foreground mb-3 leading-tight">
              {activeFlow.headline}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {activeFlow.subhead}
            </p>
          </div>

          <StepCards steps={activeFlow.steps} />

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link href={activeFlow.primaryCta.href}>
              <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/10 transition-all duration-200">
                {activeFlow.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="text-xs text-muted-foreground max-w-xs leading-tight">
              What happens next? You'll receive a confirmation email and itinerary instantly.
            </div>
          </div>

          <TrustStrip />
        </div>

        <div className="order-1 lg:order-2 h-full min-h-[500px] relative aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden bg-secondary shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-700">
          {renderVisual()}
        </div>
      </div>
    </Container>
  );

  if (merged) {
    return (
      <div className="relative overflow-hidden pt-12 md:pt-16 lg:pt-[60px]">
        {inner}
      </div>
    );
  }

  return (
    <Section className="relative overflow-hidden bg-[#faf7f2]">
      {inner}
    </Section>
  );
};

export default HowItWorksSection;
