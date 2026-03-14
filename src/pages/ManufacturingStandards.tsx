import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Calculator, Ruler, FileText, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/context/LanguageContext';

const ManufacturingStandards: React.FC = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Grid3X3,
      title: t('manufacturingStandards.gridSystem'),
      delay: 0.1,
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t('manufacturingStandards.gridDesc')}</p>
          <div className="bg-muted/40 rounded-lg p-4 space-y-2">
            {[
              [t('manufacturingStandards.gridUnit'), '5 cm (0.05 m)'],
              [t('manufacturingStandards.minPatch'), '5 cm × 5 cm'],
              [t('manufacturingStandards.snapBehavior'), 'All edges snap to grid'],
              [t('manufacturingStandards.rugSizeRange'), '0.5 m to 5.0 m']
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                <span className="font-medium text-foreground">{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: Calculator,
      title: t('manufacturingStandards.areaCalculation'),
      delay: 0.15,
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="bg-foreground text-background rounded-lg p-4 font-mono text-xs">
            Total Area = Σ (patch_width × patch_height)
          </div>
          <div className="bg-muted/40 rounded-lg p-4 space-y-2">
            {[
              [t('manufacturingStandards.precision'), '2 decimal places (m²)'],
              [t('manufacturingStandards.materialBuffer'), '+10%'],
              [t('manufacturingStandards.overlap'), 'Not permitted']
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                <span className="font-medium text-foreground">{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: Ruler,
      title: t('manufacturingStandards.precisionTolerance'),
      delay: 0.2,
      content: (
        <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
          {[
            [t('manufacturingStandards.dimTolerance'), '±1 cm per meter'],
            [t('manufacturingStandards.seamWidth'), '0.5 - 1.0 cm'],
            [t('manufacturingStandards.colorMatching'), 'Within dye lot batch'],
            [t('manufacturingStandards.edgeFinishing'), 'Overlock or bound edge']
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
              <span className="font-medium text-foreground">{k}</span><span>{v}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: FileText,
      title: t('manufacturingStandards.pdfSpec'),
      delay: 0.25,
      content: (
        <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
          {[
            [t('manufacturingStandards.designVisual'), 'Scaled color representation'],
            [t('manufacturingStandards.dimTable'), 'Width, height, position'],
            [t('manufacturingStandards.colorRef'), 'Hex values and names'],
            [t('manufacturingStandards.areaSummary'), 'Total area and estimate']
          ].map(([k, v]) => (
            <div key={k} className="bg-muted/40 rounded-lg p-3">
              <span className="font-semibold text-foreground block text-xs">{k}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      )
    },
  ];

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — Left Aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary mb-3">
            {t('manufacturingStandards.badge')}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {t('manufacturingStandards.title')}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            {t('manufacturingStandards.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.delay }}
              className="bg-card rounded-2xl border border-border p-7 hover:border-border/80 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground">{s.title}</h2>
              </div>
              {s.content}
            </motion.section>
          ))}

          {/* Pricing disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-accent/5 border border-accent/20 rounded-2xl p-6 flex gap-4 mt-6"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">{t('manufacturingStandards.disclaimerTitle')}</p>
              <p className="text-muted-foreground leading-relaxed">{t('manufacturingStandards.disclaimerDesc')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ManufacturingStandards;
