import React, { useState } from 'react';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Loader2, Send, Share2, Sparkles, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { RugDesign } from '@/types/design';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '@/hooks/useOrders';

interface PricePanelProps {
  design: RugDesign;
  isModified: boolean;
  /** True when every patch has a rug picture (textureId) assigned — Save/Share/Request Price are only enabled then. */
  isTemplateFilled: boolean;
  onSave: () => void;
  onSubmit: () => void;
  onClear: () => void;
  onShare: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  currentOrder?: Order | null;
}

export const PricePanel: React.FC<PricePanelProps> = ({
  design,
  isModified,
  isTemplateFilled,
  onSave,
  onSubmit,
  onClear,
  onShare,
  isSaving = false,
  canSave = false,
  currentOrder,
}) => {
  const { t } = useLanguage();
  const { settings } = useDesignerSettings();
  const { rate: usdToTry } = useExchangeRate();
  const [showTl, setShowTl] = useState(false);
  const patchCount = design.patches.length;
  const hasAnyRugPicture = design.patches.some((p) => Boolean(p.textureId));
  const showPrice = settings.show_price && (!currentOrder || currentOrder.status !== 'pending');

  const totalPriceUsd = design.totalArea * settings.price_per_sqm;
  const totalPriceTl = usdToTry != null ? totalPriceUsd * usdToTry : null;

  return (
    <div className="panel h-full flex flex-col min-h-0">
      <div className="panel-header flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm truncate">{showPrice ? t('pricePanel.title') : t('pricePanel.designSummary')}</span>
        </div>
        {patchCount > 0 && (
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
            {patchCount} {t('pricePanel.piece')}
          </Badge>
        )}
      </div>

      <div className="panel-content space-y-4 flex-1 overflow-x-hidden min-h-0">
        {/* Main Price Block */}
        {showPrice ? (
          <div className="bg-gradient-to-br from-primary/90 to-primary rounded-xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <p className="text-xs font-medium opacity-80 mb-1">{t('pricePanel.estimatedTotal')}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              {!showTl ? (
                <span className="text-3xl font-bold">${totalPriceUsd.toFixed(2)}</span>
              ) : totalPriceTl != null ? (
                <span className="text-3xl font-bold">{totalPriceTl.toFixed(2)} ₺</span>
              ) : (
                <span className="text-3xl font-bold">${totalPriceUsd.toFixed(2)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowTl((v) => !v)}
              className="mt-2 text-[11px] font-medium opacity-90 hover:opacity-100 underline underline-offset-2"
            >
              {showTl ? t('pricePanel.showUsd') : t('pricePanel.showTl')}
            </button>
          </div>
        ) : currentOrder?.status === 'pending' ? (
          <div className="bg-secondary/20 border border-dashed border-border rounded-xl p-5 text-center space-y-2">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <div>
              <p className="text-sm font-bold text-foreground">{t('orderStatusBadge.pending')}</p>
              <p className="text-[10px] text-muted-foreground">{t('pricePanel.addClientHint')}</p>
            </div>
          </div>
        ) : null}

        {/* Quick Stats */}
        <div className={`grid ${showPrice ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{design.totalArea.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t('pricePanel.squareMeters')}</p>
          </div>
          {showPrice && (
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              {!showTl ? (
                <>
                  <p className="text-lg font-bold text-foreground">${settings.price_per_sqm}</p>
                  <p className="text-xs text-muted-foreground">{t('pricePanel.perSqmUsd')}</p>
                </>
              ) : usdToTry != null ? (
                <>
                  <p className="text-lg font-bold text-foreground">{(settings.price_per_sqm * usdToTry).toFixed(0)} ₺</p>
                  <p className="text-xs text-muted-foreground">{t('pricePanel.perSqm')}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-foreground">${settings.price_per_sqm}</p>
                  <p className="text-xs text-muted-foreground">{t('pricePanel.perSqmUsd')}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Order Status */}
        {currentOrder && (
          <div className="bg-secondary/30 rounded-xl p-4 space-y-2 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('pricePanel.orderStatus')}</span>
              <div className="flex flex-col items-end gap-1">
                <OrderStatusBadge status={currentOrder.status} />
                {currentOrder.status !== 'pending' && currentOrder.design_snapshot?.totalPrice && (
                  <span className="text-sm font-black text-primary font-mono">
                    €{(currentOrder.design_snapshot.totalPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {currentOrder.admin_note && (
              <p className="text-xs text-muted-foreground bg-background rounded-lg p-2.5 border border-border">
                💬 {currentOrder.admin_note}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              {new Date(currentOrder.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Primary CTA: Request Price — only active when template is filled with rug pictures (every patch has a texture) */}
          <Button
            onClick={onSubmit}
            className="w-full h-12 font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow text-base gap-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
            disabled={!isTemplateFilled}
            title={!isTemplateFilled ? t('pricePanel.fillTemplateHint') : undefined}
          >
            <Send className="w-5 h-5" />
            {t('pricePanel.requestPrice')}
          </Button>

          {/* Secondary row: Save + Share */}
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              variant="outline"
              className="flex-1 h-10 font-medium rounded-lg border-2 hover:bg-secondary gap-2 disabled:opacity-50 disabled:pointer-events-none"
              disabled={!canSave || isSaving}
              title={!canSave ? t('pricePanel.piece') : undefined}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('pricePanel.saveDesign')}
                </>
              )}
            </Button>

            <Button
              onClick={onShare}
              variant="outline"
              className="h-10 px-4 font-medium rounded-lg border-2 hover:bg-secondary gap-2 disabled:opacity-50 disabled:pointer-events-none"
              disabled={!isTemplateFilled}
              title={!isTemplateFilled ? t('pricePanel.fillTemplateHint') : undefined}
            >
              <Share2 className="w-4 h-4" />
              {t('pricePanel.share')}
            </Button>
          </div>

          <Button
            onClick={onClear}
            variant="ghost"
            className="w-full h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm"
            disabled={!hasAnyRugPicture}
            title={hasAnyRugPicture ? t('pricePanel.clearHint') : t('pricePanel.noClearHint')}
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            {t('pricePanel.startOver')}
          </Button>
        </div>
      </div>
    </div>
  );
};
