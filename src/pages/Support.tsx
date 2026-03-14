import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const gettingStarted = [
    { titleKey: 'support.step1Title', descKey: 'support.step1Desc' },
    { titleKey: 'support.step2Title', descKey: 'support.step2Desc' },
    { titleKey: 'support.step3Title', descKey: 'support.step3Desc' },
    { titleKey: 'support.step4Title', descKey: 'support.step4Desc' },
  ];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — Left Aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary mb-3">
            {t('support.badge') || 'Destek'}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {t('support.title')}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            {t('support.subtitle')}
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: HelpCircle, labelKey: 'support.faq', descKey: 'support.faqDesc', href: '/faq' },
            { icon: BookOpen, labelKey: 'support.howItWorks', descKey: 'support.howDesc', href: '/how-it-works' },
            { icon: Mail, labelKey: 'support.contact', descKey: 'support.contactDesc', href: '/contact' },
          ].map(item => (
            <button key={item.href} onClick={() => navigate(item.href)} className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1 text-foreground">{t(item.labelKey)}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
            </button>
          ))}
        </motion.div>

        <div className="space-y-4">
          {/* Getting Started */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-8 mb-4">
            <h2 className="text-base font-bold mb-6 text-foreground">{t('support.gettingStarted')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {gettingStarted.map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">{i + 1}</div>
                  <div>
                    <h4 className="text-sm font-bold mb-1 text-foreground">{t(step.titleKey)}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <Button size="lg" onClick={() => navigate('/designer')} className="h-10 px-6 rounded-xl group font-semibold">
                {t('support.openDesigner')}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.section>

          {/* Keyboard Shortcuts */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-8 mb-4">
            <h2 className="text-base font-bold mb-5 text-foreground">{t('support.shortcuts')}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { labelKey: 'support.undo', key: 'Ctrl+Z' },
                { labelKey: 'support.redo', key: 'Ctrl+Y' },
                { labelKey: 'support.deselect', key: 'Escape' },
                { labelKey: 'support.selectPatch', key: 'Mouse' },
              ].map(s => (
                <div key={s.key} className="flex flex-col gap-3 justify-between bg-muted/40 rounded-xl p-4 border border-border/50">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t(s.labelKey)}</span>
                  <div className="flex">
                    <kbd className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-mono font-bold shadow-sm">{s.key}</kbd>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Still Need Help */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-foreground text-background rounded-3xl p-10 text-center relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#23eae7]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t('support.stillNeedHelp')}</h2>
              <p className="text-sm text-background/70 mb-8 max-w-sm mx-auto leading-relaxed">{t('support.stillNeedHelpDesc')}</p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 rounded-xl h-12" onClick={() => navigate('/contact')}>
                {t('support.contactSupport')}
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Support;
