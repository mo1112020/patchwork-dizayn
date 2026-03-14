import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export const CTASection: React.FC = React.memo(function CTASection() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();

  return (
    <section className="py-28 md:py-40 relative overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.06] to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,600px)] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="page-container relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-5">
            {t('hero.statFree')}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-foreground">
            {t('cta.titleLine1')}
            <br />
            <span className="text-primary">{t('cta.titleLine2')}</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-12 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/25 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
              onClick={() => navigate('/designer')}
            >
              {t('cta.button')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-semibold rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary w-full sm:w-auto transition-colors"
              onClick={() => navigate('/how-it-works')}
            >
              {t('hero.ctaHow')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>{locale === 'tr' ? 'Ücretsiz tasarım' : 'Free to design'}</span>
            <span className="text-border">·</span>
            <span>{locale === 'tr' ? 'Hesap açmadan başla' : 'No account needed'}</span>
            <span className="text-border">·</span>
            <span>{locale === 'tr' ? 'Hızlı sipariş' : 'Quick ordering'}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
});
