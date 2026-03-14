import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';

const TABS = [
  { id: 'k', tabKey: 'termsPage.tab1', descKey: 'termsPage.tab1Desc' },
  { id: 'v', tabKey: 'termsPage.tab2', descKey: 'termsPage.tab2Desc' },
  { id: 'm', tabKey: 'termsPage.tab3', descKey: 'termsPage.tab3Desc' },
  { id: 't', tabKey: 'termsPage.tab4', descKey: 'termsPage.tab4Desc' },
];

const Terms: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('k');
  const [openSection, setOpenSection] = useState<number | null>(0);

  type Section = { title: string; content: React.ReactNode };

  const kSections: Section[] = [
    { title: t('termsPage.k1Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k1Desc')}</p> },
    { title: t('termsPage.k2Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k2Desc')}</p> },
    {
      title: t('termsPage.k3Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['k3Item1', 'k3Item2', 'k3Item3'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    { title: t('termsPage.k4Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k4Desc')}</p> },
    { title: t('termsPage.k5Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k5Desc')}</p> },
    { title: t('termsPage.k6Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k6Desc')}</p> },
    {
      title: t('termsPage.k7Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['k7Item1', 'k7Item2'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    { title: t('termsPage.k8Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k8Desc')}</p> },
    { title: t('termsPage.k9Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.k9Desc')}</p> },
  ];

  const vSections: Section[] = [
    { title: t('termsPage.v1Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.v1Desc')}</p> },
    {
      title: t('termsPage.v2Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['v2Item1', 'v2Item2', 'v2Item3', 'v2Item4'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    {
      title: t('termsPage.v3Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['v3Item1', 'v3Item2', 'v3Item3', 'v3Item4'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    { title: t('termsPage.v4Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.v4Desc')}</p> },
    {
      title: t('termsPage.v5Title'),
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {['v5Item1', 'v5Item2', 'v5Item3'].map((k) => (
              <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground pt-1">
            {t('termsPage.v5ContactPrefix')}{' '}
            <a href={`mailto:${t('termsPage.contactEmail')}`} className="text-primary hover:underline font-medium">{t('termsPage.contactEmail')}</a>
          </p>
        </div>
      ),
    },
  ];

  const mSections: Section[] = [
    {
      title: t('termsPage.m1Title'),
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">{t('termsPage.m1SellerLabel')}</p>
            <p>{t('termsPage.m1SellerName')}</p>
            <p>{t('termsPage.m1SellerAddress')}</p>
            <a href={`mailto:${t('termsPage.contactEmail')}`} className="text-primary hover:underline">{t('termsPage.contactEmail')}</a>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">{t('termsPage.m1BuyerLabel')}</p>
            <p>{t('termsPage.m1BuyerDesc')}</p>
          </div>
        </div>
      ),
    },
    { title: t('termsPage.m2Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.m2Desc')}</p> },
    {
      title: t('termsPage.m3Title'),
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t('termsPage.m3Desc')}</p>
          <ul className="space-y-1.5">
            {['m3Item1', 'm3Item2', 'm3Item3', 'm3Item4'].map((k) => (
              <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
            ))}
          </ul>
          <p className="italic border-l-2 border-primary/40 pl-3 text-muted-foreground/80">{t('termsPage.m3Note')}</p>
        </div>
      ),
    },
    {
      title: t('termsPage.m4Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['m4Item1', 'm4Item2', 'm4Item3'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    { title: t('termsPage.m5Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.m5Desc')}</p> },
    {
      title: t('termsPage.m6Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['m6Item1', 'm6Item2', 'm6Item3'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    {
      title: t('termsPage.m7Title'),
      content: (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {['m7Item1', 'm7Item2'].map((k) => (
            <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
          ))}
        </ul>
      ),
    },
    { title: t('termsPage.m8Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.m8Desc')}</p> },
    { title: t('termsPage.m9Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.m9Desc')}</p> },
  ];

  const tSections: Section[] = [
    {
      title: t('termsPage.t1Title'),
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t('termsPage.t1Desc')}</p>
          <ul className="space-y-1.5">
            {['t1Item1', 't1Item2', 't1Item3', 't1Item4'].map((k) => (
              <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: t('termsPage.t2Title'),
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t('termsPage.t2Desc')}</p>
          <ul className="space-y-1.5">
            {['t2Item1', 't2Item2', 't2Item3'].map((k) => (
              <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
            ))}
          </ul>
        </div>
      ),
    },
    { title: t('termsPage.t3Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.t3Desc')}</p> },
    {
      title: t('termsPage.t4Title'),
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t('termsPage.t4Desc')}</p>
          <ul className="space-y-1.5">
            {['t4Item1', 't4Item2', 't4Item3', 't4Item4'].map((k) => (
              <li key={k} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t(`termsPage.${k}`)}</li>
            ))}
          </ul>
        </div>
      ),
    },
    { title: t('termsPage.t5Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.t5Desc')}</p> },
    { title: t('termsPage.t6Title'), content: <p className="text-sm text-muted-foreground leading-relaxed">{t('termsPage.t6Desc')}</p> },
  ];

  const tabSections: Record<string, Section[]> = { k: kSections, v: vSections, m: mSections, t: tSections };
  const currentSections = tabSections[activeTab] || [];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — left aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">{t('termsPage.badge')}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">{t('termsPage.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('termsPage.lastUpdated')}</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="flex flex-wrap gap-2 mb-7"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOpenSection(0); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 border ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-border'
                }`}
            >
              {t(tab.tabKey)}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <p className="text-sm text-muted-foreground mb-6 italic border-l-2 border-primary/40 pl-4">
              {t(TABS.find((tab) => tab.id === activeTab)?.descKey ?? '')}
            </p>

            <div className="space-y-2">
              {currentSections.map((section, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                  >
                    <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
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
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 p-6 rounded-xl bg-foreground text-background"
        >
          <p className="text-sm font-semibold mb-1">{t('termsPage.contactLabel')}</p>
          <a href={`mailto:${t('termsPage.contactEmail')}`} className="text-primary hover:underline text-sm font-medium">
            {t('termsPage.contactEmail')}
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Terms;
