import React, { useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Mail, Link2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designName: string;
  designSummary: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open, onOpenChange, designName, designSummary,
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const shareText = `🎨 ${designName}\n${designSummary}\n\n${window.location.href}`;

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  }, [shareText]);

  const handleEmail = useCallback(() => {
    window.open(`mailto:?subject=${encodeURIComponent(`${t('shareDialog.emailSubject')}: ${designName}`)}&body=${encodeURIComponent(shareText)}`, '_blank');
  }, [shareText, designName, t]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: t('shareDialog.linkCopiedToast') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t('shareDialog.copyFailedToast'), variant: 'destructive' });
    }
  }, [toast, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{t('shareDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-4">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <span className="text-xs font-medium text-foreground">{t('shareDialog.whatsapp')}</span>
          </button>

          <button
            onClick={handleEmail}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">{t('shareDialog.email')}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center group-hover:bg-accent transition-colors">
              {copied ? <Check className="w-6 h-6 text-primary" /> : <Link2 className="w-6 h-6 text-muted-foreground" />}
            </div>
            <span className="text-xs font-medium text-foreground">{copied ? t('shareDialog.copied') : t('shareDialog.copyLink')}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
