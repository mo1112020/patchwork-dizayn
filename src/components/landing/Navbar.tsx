import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

const NAVBAR_HEIGHT = 80;

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut().then(() => {
        toast({ title: t('nav.signedOut'), description: t('nav.signedOutDesc') });
      });
    } else {
      navigate('/auth');
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: t('nav.howItWorks'), href: '/how-it-works' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border shadow-sm navbar-solid-bg overflow-visible"
      style={{ height: NAVBAR_HEIGHT }}
    >
      <div className="h-full page-container">
        <div className="flex items-center justify-between h-full gap-6">
          {/* Logo: no border, no background – just the image, large */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="navbar-logo-wrap hover:opacity-90 active:opacity-95 focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
            aria-label="PATCHWORK DIZAYN Home"
          >
            <img
              src="/logo.png"
              alt="PATCHWORK DIZAYN"
              className="navbar-logo-img pointer-events-none"
            />
          </button>

          {/* Desktop Nav — centered, clean links */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center max-w-xl mx-auto">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`flex-1 max-w-[140px] py-2.5 px-4 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right — lang + auth */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {/* Lang toggle */}
            <div className="flex border border-border rounded-xl overflow-hidden bg-muted/50 p-0.5">
              <button
                onClick={() => setLocale('tr')}
                className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                  locale === 'tr' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-3.5 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                  locale === 'en' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
            </div>

            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="max-w-[120px] truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={handleAuthClick}
                  className="p-2.5 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                  aria-label={t('nav.signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-5 font-semibold border-2 border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary/60"
                onClick={handleAuthClick}
              >
                {t('nav.signIn')}
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-3 rounded-xl text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-card border-b border-border shadow-lg overflow-hidden"
          >
            <div className="page-container px-4 py-5 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    isActive(link.href) ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground">Dil</span>
                <div className="flex border border-border rounded-xl overflow-hidden bg-muted/50 p-0.5">
                  <button
                    onClick={() => setLocale('tr')}
                    className={`px-4 py-2 text-xs font-bold ${locale === 'tr' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                  >
                    TR
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={`px-4 py-2 text-xs font-bold ${locale === 'en' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                  >
                    EN
                  </button>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border space-y-1">
                {loading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium text-foreground rounded-xl hover:bg-muted flex items-center gap-3"
                      onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                    >
                      <User className="w-4 h-4" />
                      {t('nav.profile')}
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 flex items-center gap-3"
                      onClick={handleAuthClick}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-foreground rounded-xl hover:bg-muted flex items-center gap-3"
                    onClick={handleAuthClick}
                  >
                    <User className="w-4 h-4" />
                    {t('nav.signIn')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export { NAVBAR_HEIGHT };
