import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Search } from 'lucide-react';

const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      categoryKey: 'faqPage.cat1',
      questions: [
        { q: t('faqPage.cat1q1'), a: t('faqPage.cat1a1') },
        { q: t('faqPage.cat1q2'), a: t('faqPage.cat1a2') },
        { q: t('faqPage.cat1q3'), a: t('faqPage.cat1a3') },
        { q: t('faqPage.cat1q4'), a: t('faqPage.cat1a4') },
        { q: t('faqPage.cat1q5'), a: t('faqPage.cat1a5') },
        { q: t('faqPage.cat1q6'), a: t('faqPage.cat1a6') },
      ],
    },
    {
      categoryKey: 'faqPage.cat2',
      questions: [
        { q: t('faqPage.cat2q1'), a: t('faqPage.cat2a1') },
        { q: t('faqPage.cat2q2'), a: t('faqPage.cat2a2') },
        { q: t('faqPage.cat2q3'), a: t('faqPage.cat2a3') },
      ],
    },
    {
      categoryKey: 'faqPage.cat3',
      questions: [
        { q: t('faqPage.cat3q1'), a: t('faqPage.cat3a1') },
        { q: t('faqPage.cat3q2'), a: t('faqPage.cat3a2') },
        { q: t('faqPage.cat3q3'), a: t('faqPage.cat3a3') },
      ],
    },
    {
      categoryKey: 'faqPage.cat4',
      questions: [
        { q: t('faqPage.cat4q1'), a: t('faqPage.cat4a1') },
        { q: t('faqPage.cat4q2'), a: t('faqPage.cat4a2') },
        { q: t('faqPage.cat4q3'), a: t('faqPage.cat4a3') },
        { q: t('faqPage.cat4q4'), a: t('faqPage.cat4a4') },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          !searchQuery ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  const totalFiltered = filteredFaqs.reduce((sum, c) => sum + c.questions.length, 0);

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — left aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">{t('faqPage.badge')}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">{t('faqPage.title')}</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">{t('faqPage.subtitle')}</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('faqPage.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {totalFiltered} {t('faqPage.searchResults')}
            </span>
          )}
        </motion.div>

        {filteredFaqs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-muted-foreground">
            <p className="text-lg font-semibold mb-1">{t('faqPage.noResults')}</p>
            <p className="text-sm">{t('faqPage.noResultsHint')}</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {filteredFaqs.map((section, i) => (
              <motion.div
                key={section.categoryKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-bold text-foreground">{t(section.categoryKey)}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {section.questions.length}
                  </span>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.questions.map((item, j) => (
                    <AccordionItem
                      key={j}
                      value={`${i}-${j}`}
                      className="bg-card border border-border rounded-xl px-4 data-[state=open]:border-primary/30 transition-all"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4 hover:text-primary transition-colors">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 rounded-xl bg-foreground text-background"
        >
          <p className="text-sm font-semibold mb-1">{t('faqPage.stillHelpTitle')}</p>
          <p className="text-xs text-background/60 mb-3">{t('faqPage.stillHelpDesc')}</p>
          <a
            href={`mailto:${t('faqPage.contactEmail')}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('faqPage.contactEmail')}
          </a>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
