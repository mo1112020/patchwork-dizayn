import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { FloatingCTA } from '@/components/landing/FloatingCTA';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <HeroSection />
      <TrustStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default Index;
