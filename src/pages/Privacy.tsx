import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';

const Privacy: React.FC = () => {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = [
    {
      titleKey: 'privacyPage.s1Title',
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['s1Item1', 's1Item2', 's1Item3', 's1Item4'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`privacyPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    {
      titleKey: 'privacyPage.s2Title',
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['s2Item1', 's2Item2', 's2Item3'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`privacyPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    {
      titleKey: 'privacyPage.s3Title',
      content: <p className="text-sm text-muted-foreground leading-relaxed">{t('privacyPage.s3Desc')}</p>,
    },
    {
      titleKey: 'privacyPage.s4Title',
      content: <p className="text-sm text-muted-foreground leading-relaxed">{t('privacyPage.s4Desc')}</p>,
    },
    {
      titleKey: 'privacyPage.s5Title',
      content: <p className="text-sm text-muted-foreground leading-relaxed">{t('privacyPage.s5Desc')}</p>,
    },
    {
      titleKey: 'privacyPage.s6Title',
      content: (
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">{t('privacyPage.s6Desc')}</p>
          <a href={`mailto:${t('privacyPage.contactEmail')}`} className="text-primary hover:underline font-medium">
            {t('privacyPage.contactEmail')}
          </a>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — left aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">{t('privacyPage.badge')}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">{t('privacyPage.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('privacyPage.lastUpdated')}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-sm text-muted-foreground mb-7 italic border-l-2 border-primary/40 pl-4 max-w-2xl"
        >
          {t('privacyPage.intro')}
        </motion.p>

        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
              >
                <h2 className="text-sm font-semibold text-foreground">{t(section.titleKey)}</h2>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openSection === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openSection === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-3 border-t border-border">{section.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-10 p-6 rounded-xl bg-foreground text-background"
        >
          <p className="text-sm font-semibold mb-1">{t('privacyPage.contactLabel')}</p>
          <a href={`mailto:${t('privacyPage.contactEmail')}`} className="text-primary hover:underline text-sm font-medium">
            {t('privacyPage.contactEmail')}
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
