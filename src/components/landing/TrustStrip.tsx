import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, Heart, Award, Headphones } from 'lucide-react';

const stats = [
  { value: '2,500+', tr: 'Tamamlanan Proje', en: 'Projects Completed', Icon: Award },
  { value: '15+', tr: 'Hizmet Verilen Ülke', en: 'Countries Served', Icon: Globe },
  { value: '98%', tr: 'Müşteri Memnuniyeti', en: 'Client Satisfaction', Icon: Heart },
  { value: '24/7', tr: 'Destek Hizmeti', en: 'Customer Support', Icon: Headphones },
];

export const TrustStrip: React.FC = React.memo(function TrustStrip() {
  const { locale } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-14 md:py-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-accent/[0.04]" />
      <div className="page-container relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((item, i) => (
            <motion.div
              key={item.value}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border border-border/80 bg-card/80 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-foreground tabular-nums mb-1">{item.value}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider leading-snug">
                {locale === 'tr' ? item.tr : item.en}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
});
