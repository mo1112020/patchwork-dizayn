import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';

const HERO_SLIDE_DURATION_MS = 5000;

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const { settings } = useDesignerSettings();
  const heroImages = settings.hero_images ?? [];
  const [slideIndex, setSlideIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Reset failed set whenever the configured images change
  useEffect(() => {
    setFailedImages(new Set());
    setSlideIndex(0);
  }, [heroImages]);

  const liveImages = heroImages.filter(src => !failedImages.has(src));

  const markFailed = (src: string) => {
    setFailedImages(prev => new Set([...prev, src]));
  };

  // Keep slideIndex in bounds if a live image is removed mid-session
  useEffect(() => {
    if (liveImages.length > 0 && slideIndex >= liveImages.length) {
      setSlideIndex(0);
    }
  }, [liveImages.length, slideIndex]);

  useEffect(() => {
    if (liveImages.length <= 1) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % liveImages.length);
    }, HERO_SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [liveImages.length]);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Premium Artisanal Gradient: Deep Midnight Indigo base */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="page-container relative pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5 md:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[2.4rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.05] mb-4 md:mb-7 text-foreground"
            >
              {t('hero.titleLine1')}
              <br />
              <span className="text-primary">{t('hero.titleLine2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-xl text-muted-foreground max-w-xl mb-7 md:mb-10 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-8 md:mb-12"
            >
              <Button
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] group w-full sm:w-auto justify-center"
                onClick={() => navigate('/designer')}
              >
                {t('hero.ctaStart')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-border hover:bg-card rounded-xl group w-full sm:w-auto justify-center"
                onClick={() => navigate('/how-it-works')}
              >
                <Play className="mr-2 w-4 h-4 text-primary fill-primary" />
                {t('hero.ctaHow')}
              </Button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-x-7 gap-y-3 sm:gap-x-12"
            >
              {[
                { value: '2,500+', label: locale === 'tr' ? 'Tamamlanan Tasarım' : 'Designs Completed' },
                { value: '98%', label: locale === 'tr' ? 'Müşteri Memnuniyeti' : 'Client Satisfaction' },
                { value: '15+', label: locale === 'tr' ? 'Ülke' : 'Countries' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-xl md:text-3xl font-black text-foreground tabular-nums">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Hero images (admin) or default preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <button
              type="button"
              onClick={() => navigate('/designer')}
              className="group relative w-full bg-card rounded-3xl border border-border shadow-2xl overflow-hidden text-left hover:border-primary/40 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background"
            >
              {liveImages.length > 0 ? (
                /* Admin hero images: sliding carousel */
                <div className="aspect-[4/3] relative overflow-hidden rounded-3xl">
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${slideIndex * 100}%)` }}
                  >
                    {liveImages.map((src, i) => (
                      <div key={src} className="w-full flex-shrink-0 h-full relative">
                        <img
                          src={src}
                          alt=""
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 object-fill"
                          style={{ width: '75%', height: '133.33%' }}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          decoding={i === 0 ? 'sync' : 'async'}
                          fetchPriority={i === 0 ? 'high' : 'low'}
                          onError={() => markFailed(src)}
                        />
                      </div>
                    ))}
                  </div>
                  {liveImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {liveImages.map((_, i) => (
                        <span
                          key={i}
                          className={`block h-2 rounded-full transition-all duration-300 ${i === slideIndex ? 'w-6 bg-primary' : 'w-2 bg-foreground/20'}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-primary/5 transition-colors duration-300">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm font-bold bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-xl shadow-primary/30">
                      {t('cta.button')}
                    </span>
                  </div>
                </div>
              ) : (
                /* Default: designer mockup when no hero images */
                <>
                  <div className="h-12 bg-muted/30 border-b border-border flex items-center px-5 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/30" />
                      <div className="w-3 h-3 rounded-full bg-accent/30" />
                      <div className="w-3 h-3 rounded-full bg-success/30" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-background/50 border border-border/40 rounded-md px-4 py-1 text-[10px] text-muted-foreground font-mono tracking-wide">
                        patchworkdizayn.com/designer
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[4/3] bg-card relative p-8">
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div className="relative h-full w-full border border-border/40 rounded-xl overflow-hidden shadow-inner bg-background/20">
                      <div className="grid grid-cols-8 h-full w-full opacity-80 backdrop-blur-[1px]">
                        <div className="col-span-3 bg-primary/40 row-span-2 border-r border-b border-border/20" />
                        <div className="col-span-5 bg-accent/30 row-span-1 border-b border-border/20" />
                        <div className="col-span-2 bg-secondary/40 row-span-1 border-r border-border/20" />
                        <div className="col-span-3 bg-accent/20 row-span-1 border-r border-border/20" />
                        <div className="col-span-4 bg-primary/20 row-span-2 border-b border-border/20" />
                        <div className="col-span-4 bg-secondary/30 row-span-1 border-b border-border/20" />
                        <div className="col-span-5 bg-primary/10 row-span-1 border-r border-border/20" />
                        <div className="col-span-3 bg-accent/40 row-span-1 border-r border-border/20" />
                        <div className="col-span-8 bg-primary/30 row-span-1" />
                      </div>
                    </div>
                    <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md rounded-2xl border border-border p-4 shadow-xl">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5">{t('hero.previewColors')}</div>
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary shadow-sm" />
                        <div className="w-7 h-7 rounded-lg bg-accent shadow-sm" />
                        <div className="w-7 h-7 rounded-lg bg-secondary border border-border shadow-sm" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md rounded-2xl border border-border p-4 shadow-xl">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">{t('hero.previewDimensions')}</div>
                      <div className="text-lg font-black text-foreground">2.5m × 3.5m</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-primary/5 transition-all duration-300">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-sm font-bold bg-primary text-primary-foreground px-8 py-3.5 rounded-xl shadow-2xl shadow-primary/40">
                        {t('cta.button')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
