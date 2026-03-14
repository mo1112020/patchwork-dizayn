import React from 'react';
import { Footer } from '@/components/landing/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  bare?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, bare }) => {
  if (bare) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <main className="flex-1 pt-28 pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
};
