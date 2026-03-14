import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Image, Calculator, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const steps = [
    { number: '01', icon: Ruler, title: t('howItWorksPage.step1Title'), description: t('howItWorksPage.step1Desc') },
    { number: '02', icon: Image, title: t('howItWorksPage.step2Title'), description: t('howItWorksPage.step2Desc') },
    { number: '03', icon: Calculator, title: t('howItWorksPage.step3Title'), description: t('howItWorksPage.step3Desc') },
    { number: '04', icon: Send, title: t('howItWorksPage.step4Title'), description: t('howItWorksPage.step4Desc') },
  ];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — Left Aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            {t('howItWorksPage.badge')}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            {t('howItWorksPage.title')}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            {t('howItWorksPage.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step, index) => {
            const isEven = index % 2 === 1;
            const accentColor = isEven ? 'text-[#23eae7]' : 'text-primary';
            const bgColor = isEven ? 'bg-[#23eae7]/10' : 'bg-primary/10';
            const borderColor = isEven ? 'border-[#23eae7]/20' : 'border-primary/20';

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`group bg-card rounded-2xl border border-border p-6 md:p-7 flex gap-6 items-start hover:border-border/80 transition-all duration-300 relative overflow-hidden`}
              >
                {/* Number Badge */}
                <div className="shrink-0 relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center border ${borderColor}`}>
                    <span className={`text-base font-bold ${accentColor}`}>{step.number}</span>
                  </div>
                </div>

                <div className="pt-1 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className={`w-4 h-4 ${accentColor}`} />
                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>

                {/* Subtle hover effect background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${isEven ? 'bg-[#23eae7]' : 'bg-primary'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">{t('howItWorksPage.importantNotes')}</h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <li key={n} className="flex items-start gap-3 bg-muted/40 rounded-xl p-4 border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{t(`howItWorksPage.note${n}`)}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <Button
            size="lg"
            className="h-12 px-8 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl group"
            onClick={() => navigate('/designer')}
          >
            {t('howItWorksPage.startDesigning')}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default HowItWorks;
