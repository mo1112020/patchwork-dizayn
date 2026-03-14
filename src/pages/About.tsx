import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Scissors, Star, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';

const About: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { value: t('about.stat1Value'), label: t('about.stat1Label') },
    { value: t('about.stat2Value'), label: t('about.stat2Label') },
    { value: t('about.stat3Value'), label: t('about.stat3Label') },
    { value: t('about.stat4Value'), label: t('about.stat4Label') },
  ];

  const tags = [
    { icon: Star, label: t('about.productionTag1'), desc: t('about.productionTag1Desc') },
    { icon: Heart, label: t('about.productionTag2'), desc: t('about.productionTag2Desc') },
    { icon: MapPin, label: t('about.productionTag3'), desc: t('about.productionTag3Desc') },
  ];

  const capabilities = [
    t('about.capability1'),
    t('about.capability2'),
    t('about.capability3'),
    t('about.capability4'),
  ];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — left aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            {t('about.badge')}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            {t('about.title')}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-card px-6 py-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="space-y-4">
          {/* Who we are */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-card rounded-2xl border border-border p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold">{t('about.whoWeAre')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('about.whoWeAreDesc')}</p>
          </motion.section>

          {/* Production */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-card rounded-2xl border border-border p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold">{t('about.production')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t('about.productionDesc')}</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {tags.map((tag, i) => (
                <div key={i} className="rounded-xl bg-muted/50 border border-border/60 p-4">
                  <tag.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-semibold text-foreground">{tag.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tag.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Material */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-card rounded-2xl border border-border p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold">{t('about.materialTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('about.materialDesc')}</p>
          </motion.section>

          {/* Design Freedom */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="bg-card rounded-2xl border border-border p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold">{t('about.designFreedom')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t('about.designFreedomDesc')}</p>
            <ul className="space-y-2.5">
              {capabilities.map((cap, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{cap}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Delivery */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-card rounded-2xl border border-border p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold">{t('about.deliveryTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('about.deliveryDesc')}</p>
          </motion.section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-10"
        >
          <Button
            size="lg"
            className="h-12 px-8 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 group"
            onClick={() => navigate('/designer')}
          >
            {t('about.ctaButton')}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default About;
