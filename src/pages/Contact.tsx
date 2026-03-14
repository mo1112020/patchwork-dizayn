import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useContactMessages } from '@/hooks/useContactMessages';

const Contact: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitMessage } = useContactMessages();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMessage(formData);
      setIsSubmitted(true);
      toast({ title: t('contact.toastSent'), description: t('contact.toastSentDesc') });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('contact.submitFailedDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PageLayout>
      <div className="page-container">
        {/* Header — Left Aligned */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary mb-3">
            {t('contact.badge') || 'İletişim'}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {t('contact.title')}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Info Side */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-7 border-l-4 border-l-primary hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('contact.emailUs')}</h2>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t('contact.preferredContact')}</p>
                </div>
              </div>
              <a href={`mailto:${t('contact.emailAddress')}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                {t('contact.emailAddress')}
              </a>
            </div>

            <div className="bg-card rounded-2xl border border-border p-7 border-l-4 border-l-[#23eae7] hover:border-[#23eae7]/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#23eae7]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#23eae7]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('contact.responseTime')}</h2>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{t('contact.responseExpect')}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('contact.responseDesc')}
              </p>
            </div>

            <div className="bg-muted/40 rounded-2xl border border-border p-7">
              <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-widest">{t('contact.quickLinks')}</h3>
              <ul className="space-y-4">
                {[
                  { key: 'checkFaq', href: '/faq' },
                  { key: 'supportCenter', href: '/support' },
                  { key: 'howDesignerWorks', href: '/how-it-works' }
                ].map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                      {t(`contact.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            {isSubmitted ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{t('contact.messageSent')}</h2>
                <p className="text-sm text-muted-foreground mb-10 max-w-xs">{t('contact.messageSentDesc')}</p>
                <Button variant="outline" size="lg" className="px-8 h-12 rounded-xl border-border hover:bg-muted font-bold" onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                  {t('contact.sendAnother')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 md:p-10 space-y-6">
                <div className="mb-2">
                  <h2 className="text-xl font-bold mb-2">{t('contact.sendMessage')}</h2>
                  <p className="text-sm text-muted-foreground">Formu doldurun, en kısa sürede dönüş yapalım.</p>
                </div>

                {[
                  { id: 'name', labelKey: 'contact.name', placeholderKey: 'contact.placeholderName', type: 'text' },
                  { id: 'email', labelKey: 'contact.email', placeholderKey: 'contact.placeholderEmail', type: 'email' },
                  { id: 'subject', labelKey: 'contact.subject', placeholderKey: 'contact.placeholderSubject', type: 'text' },
                ].map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-semibold">{t(field.labelKey)}</Label>
                    <Input id={field.id} name={field.id} type={field.type} value={(formData as any)[field.id]} onChange={handleChange} placeholder={t(field.placeholderKey)} required className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary transition-colors bg-muted/20" />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">{t('contact.message')}</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder={t('contact.placeholderMessage')} rows={5} required className="rounded-lg border-muted-foreground/20 focus:border-primary transition-colors bg-muted/20 resize-none" />
                </div>

                <Button type="submit" className="w-full h-12 font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">{t('contact.sending')}</span>
                  ) : (
                    <span className="flex items-center gap-2">{t('contact.sendBtn')} <Send className="w-4 h-4" /></span>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
