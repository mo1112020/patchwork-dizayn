import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const FLOATING_SHOW_AFTER_PX = 400;

export const FloatingCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > FLOATING_SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => navigate('/designer')}
          className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6 flex items-center justify-center gap-2 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={t('nav.designer')}
          title={t('nav.designer')}
        >
          <PenLine className="w-5 h-5 shrink-0" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
