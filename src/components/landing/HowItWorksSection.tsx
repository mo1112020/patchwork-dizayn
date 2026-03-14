import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Palette, FileDown, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HowItWorksSection: React.FC = React.memo(function HowItWorksSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const steps = [
    { icon: PenTool, step: '01', titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
    { icon: Palette, step: '02', titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
    { icon: FileDown, step: '03', titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
  ];

  const benefits = [t('howItWorks.benefit1'), t('howItWorks.benefit2'), t('howItWorks.benefit3'), t('howItWorks.benefit4')];

  return (
    <section className="py-16 md:py-32 bg-foreground text-background relative overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground/95 to-foreground" />
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='currentColor' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="page-container relative">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-4"
          >
            {t('howItWorks.badge')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight mb-5"
          >
            {t('howItWorks.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-background/60 text-lg leading-relaxed"
          >
            {t('howItWorks.subtitle')}
          </motion.p>
        </div>

        {/* Steps — cards with connector */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 mb-16 md:mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary/30 to-transparent pointer-events-none" />
              )}
              <div className="relative p-8 rounded-2xl bg-background/5 border border-background/10 hover:border-primary/30 hover:bg-background/10 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-primary">{step.step}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <step.icon size={22} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-background">{t(step.titleKey)}</h3>
                <p className="text-background/55 text-sm leading-relaxed flex-1">{t(step.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {benefits.map((benefit, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2.5 bg-background/10 rounded-full px-5 py-2.5 border border-background/10 text-sm font-medium text-background/85"
            >
              <Check className="w-4 h-4 text-primary shrink-0" />
              {benefit}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            className="h-14 px-10 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30 group"
            onClick={() => navigate('/designer')}
          >
            {t('hero.ctaStart')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
});
