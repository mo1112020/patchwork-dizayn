import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, CheckCircle2, Truck, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const { t } = useLanguage();
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: {
      label: t('orderStatusBadge.pending'),
      icon: <Clock className="w-3 h-3" />,
      variant: 'secondary',
    },
    price_sent: {
      label: t('orderStatusBadge.price_sent'),
      icon: <MessageSquare className="w-3 h-3" />,
      variant: 'default',
    },
    in_progress: {
      label: t('orderStatusBadge.in_progress'),
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      variant: 'default',
    },
    ready: {
      label: t('orderStatusBadge.ready'),
      icon: <CheckCircle2 className="w-3 h-3" />,
      variant: 'default',
    },
    delivered: {
      label: t('orderStatusBadge.delivered'),
      icon: <Truck className="w-3 h-3" />,
      variant: 'outline',
    },
  };
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={`gap-1.5 text-xs py-1 px-2.5 ${status === 'ready' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} ${className ?? ''}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
