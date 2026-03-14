import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Scissors, Calculator, Image, Download, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const featureKeys = [
  { iconKey: 'Layers' as const, titleKey: 'features.gridTitle', descKey: 'features.gridDesc' },
  { iconKey: 'Image' as const, titleKey: 'features.textureTitle', descKey: 'features.textureDesc' },
  { iconKey: 'Scissors' as const, titleKey: 'features.cutTitle', descKey: 'features.cutDesc' },
  { iconKey: 'Calculator' as const, titleKey: 'features.priceTitle', descKey: 'features.priceDesc' },
  { iconKey: 'Download' as const, titleKey: 'features.pdfTitle', descKey: 'features.pdfDesc' },
  { iconKey: 'Mail' as const, titleKey: 'features.mailTitle', descKey: 'features.mailDesc' },
];
const iconMap = { Layers, Scissors, Calculator, Image, Download, Mail };

export const FeaturesSection: React.FC = React.memo(function FeaturesSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = featureKeys.map((f) => ({ ...f, icon: iconMap[f.iconKey] }));

  return (
    <section className="py-24 md:py-32 scroll-mt-16">
      <div className="page-container">
        {/* Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-4"
          >
            {t('features.badge')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-5"
          >
            {t('features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-lg leading-relaxed"
          >
            {t('features.subtitle')}
          </motion.p>
        </div>

        {/* Bento Grid – first and last row same layout: [wide card][standard card] */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => {
            const isLarge = i === 0 || i === 3 || i === 4;
            const accentVariant = i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'accent' : 'secondary';
            const iconBg = accentVariant === 'primary' ? 'bg-primary/10' : accentVariant === 'accent' ? 'bg-accent/10' : 'bg-secondary/40';
            const iconColor = accentVariant === 'primary' ? 'text-primary' : accentVariant === 'accent' ? 'text-accent' : 'text-foreground';
            const borderAccent = accentVariant === 'primary' ? 'hover:border-primary/30' : accentVariant === 'accent' ? 'hover:border-accent/30' : 'hover:border-primary/20';
            const leftBorder = accentVariant === 'primary' ? 'border-l-4 border-l-primary' : accentVariant === 'accent' ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-secondary';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`group relative p-7 md:p-8 rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${borderAccent} ${leftBorder} ${isLarge ? 'lg:col-span-2' : ''
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon size={22} className={iconColor} />
                  </div>
                  <h3 className="text-lg font-bold mb-2.5 text-foreground">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 md:mt-16 text-center"
        >
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-sm font-bold rounded-xl border-2 border-primary/40 hover:border-primary hover:bg-primary/10 hover:text-primary group transition-colors"
            onClick={() => navigate('/designer')}
          >
            {t('cta.button')}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
});
