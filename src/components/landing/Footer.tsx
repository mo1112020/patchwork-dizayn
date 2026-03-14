import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();

  // Only links that are not in the navbar (navbar has: How it works, About, Contact)
  const footerLinks = [
    { label: t('footer.designer'), href: '/designer' },
    { label: t('footer.manufacturing'), href: '/manufacturing-standards' },
    { label: t('footer.faq'), href: '/faq' },
    { label: t('footer.support'), href: '/support' },
    { label: t('footer.terms'), href: '/terms' },
    { label: t('footer.privacy'), href: '/privacy' },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="page-container py-4 px-4 md:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {footerLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => navigate(link.href)}
                className="text-[12px] text-background/70 hover:text-background transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <p className="text-[11px] text-background/40">
            © {new Date().getFullYear()} · {locale === 'tr' ? 'Türkiye\'den dünyaya' : 'From Turkey to the world'}
          </p>
        </div>
      </div>
    </footer>
  );
};
