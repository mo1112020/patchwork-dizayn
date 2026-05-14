import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDesigner } from '@/hooks/useDesigner';
import { useTextures, warmRugTextureThumbnail } from '@/hooks/useTextures';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';
import { useAuth } from '@/hooks/useAuth';
import { useDesigns } from '@/hooks/useDesigns';
import { generateOrderPdf } from '@/lib/pdf-generator';
import { DesignerCanvas } from '@/components/designer/DesignerCanvas';
import { TexturePanel } from '@/components/designer/TexturePanel';
import { PricePanel } from '@/components/designer/PricePanel';
import { ShareDialog } from '@/components/designer/ShareDialog';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { savePendingDesign, getPendingDesign, clearPendingDesign, hasPendingDesign } from '@/lib/design-storage';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { DesignSetupDialog } from '@/components/designer/DesignSetupDialog';
import {
  Settings2, PlusCircle, Keyboard,
  CheckCircle2, Loader2, Undo2, Redo2, History,
  Menu, ShoppingCart, Paintbrush, X, MousePointer2, SquarePlus, Eraser, Trash2, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RugTexture } from '@/types/design';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/** Memoized mobile texture tray — avoids re-rendering (and re-loading images) on every state change */
const MobileTextureTray = React.memo(function MobileTextureTray({
  textures,
  selectedTextureId,
  threadColors,
  currentThreadColor,
  onTextureSelect,
  onThreadColorSelect,
  onExpandTextures,
  onClose,
  patchInfo,
}: {
  textures: RugTexture[];
  selectedTextureId: string | null;
  threadColors: string[];
  currentThreadColor: string;
  onTextureSelect: (tex: RugTexture) => void;
  onThreadColorSelect: (hex: string) => void;
  onExpandTextures: () => void;
  onClose: () => void;
  patchInfo: string;
}) {
  const { t } = useLanguage();
  const [showAllColors, setShowAllColors] = useState(false);
  const visibleColors = showAllColors ? threadColors : threadColors.slice(0, 10);
  return (
    <div className="bg-card/98 backdrop-blur-2xl border border-border/60 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] rounded-t-3xl px-4 pt-3 pb-8 flex flex-col gap-3 overflow-hidden">
      {/* Drag handle */}
      <div className="w-10 h-1 rounded-full bg-border/60 mx-auto mb-1" />

      <div className="flex items-center justify-between px-0.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary leading-none">{t('designer.selectRugHint')}</span>
          <p className="text-[10px] text-muted-foreground font-medium">{patchInfo}</p>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-muted/40 hover:bg-muted"
            onClick={onExpandTextures}
            title="More textures"
          >
            <PlusCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-muted/40 hover:bg-muted"
            onClick={onClose}
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-hide no-scrollbar snap-x snap-mandatory -mx-0.5">
        {textures.map((tex) => {
          const isSelected = selectedTextureId === tex.id;
          return (
            <button
              key={tex.id}
              type="button"
              onPointerEnter={() => warmRugTextureThumbnail(tex)}
              onClick={() => onTextureSelect(tex)}
              className={cn(
                "relative aspect-square w-[4.25rem] h-[4.25rem] rounded-2xl border-2 overflow-hidden transition-all flex-shrink-0 shrink-0 snap-start active:scale-90 touch-manipulation",
                isSelected
                  ? 'border-primary ring-4 ring-primary/25 scale-105 z-10 shadow-lg shadow-primary/20'
                  : 'border-border/50 hover:border-primary/40'
              )}
            >
              <img src={tex.thumbnailUrl} alt={tex.name} className="w-full h-full object-cover" loading="eager" decoding="async" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-3 pb-0.5 px-1">
                <p className="text-[7px] text-white font-bold truncate leading-none uppercase tracking-wide">{tex.name}</p>
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Thread Colors */}
      <div className="pt-2 border-t border-border/40 flex items-center gap-2 flex-wrap">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{t('designer.threadColorLabel')}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {visibleColors.map((code) => {
            const hex = `#${code}`;
            const isSelected = currentThreadColor === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onThreadColorSelect(hex)}
                className={`w-7 h-7 rounded-lg border-2 shrink-0 transition-all touch-manipulation ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border/50'}`}
                style={{ backgroundColor: hex }}
              />
            );
          })}
          {threadColors.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllColors(v => !v)}
              className="text-[9px] font-bold text-primary underline underline-offset-2 shrink-0 touch-manipulation"
            >
              {showAllColors ? t('designer.showLess') : `+${threadColors.length - 10}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});


function loadTextureImagesAsDataUrls(
  textureIds: string[],
  textures: RugTexture[]
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const promises = textureIds.map((id) => {
    const tex = textures.find((t) => t.id === id);
    if (!tex?.imageUrl) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            map[id] = canvas.toDataURL('image/jpeg', 0.85);
          }
        } catch (_e) { }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = tex.imageUrl;
    });
  });
  return Promise.all(promises).then(() => map);
}

const Designer: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { saveDesign, getDesign } = useDesigns();
  const [isSaving, setIsSaving] = useState(false);
  const isSubmittingRef = useRef(false); // prevents double-tap without showing a spinner
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showAllThreadColors, setShowAllThreadColors] = useState(false);
  const [isDraggingTexture, setIsDraggingTexture] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMobileTextures, setShowMobileTextures] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const { orders, createOrder, getLatestOrderForDesign } = useOrders();

  const { settings: adminSettings } = useDesignerSettings();
  const { textures } = useTextures();
  const {
    design,
    selectedPatchId,
    selectedPatch,
    selectedColor,
    selectedTextureId,
    toolMode,
    isModified,
    gridWidth,
    gridHeight,
    canvasWidth,
    canvasHeight,
    gridUnitSize,
    canvasGridSize,
    canUndo,
    canRedo,
    setSelectedPatchId,
    setSelectedTextureId,
    setToolMode,
    updateDesign,
    addPatch,
    updatePatch,
    movePatch,
    resizePatch,
    deletePatch,
    clearPatches,
    clearPatchTextures,
    resetDesign,
    applyStripTemplate,
    getStripTemplatePatches,
    setDesign,
    undo,
    redo,
  } = useDesigner();

  const queryParams = new URLSearchParams(window.location.search);
  const designId = queryParams.get('id');

  /** Buttons (Share, Request Price) are only enabled when the template is filled with rug pictures (every patch has a textureId). 
   * Save button is now always allowed if there are patches. */
  const isTemplateFilled = useMemo(() => {
    return design.patches.every(p => p.textureId);
  }, [design.patches]);

  // Auto-deselect patch when clicking elsewhere or after certain actions
  // Removed auto-open sheet to avoid jumping UI, tray is better
  useEffect(() => {
    if (selectedPatchId && window.innerWidth < 1024) {
      // We keep the tray logic only
    }
  }, [selectedPatchId]);

  const canSave = design.patches.length > 0;

  // Stable callbacks for the memoized MobileTextureTray
  const handleTrayTextureSelect = useCallback((tex: RugTexture) => {
    warmRugTextureThumbnail(tex);
    if (selectedPatchId && selectedPatch) {
      updatePatch(selectedPatchId, { textureId: tex.id, color: tex.hex ?? selectedPatch.color });
      // Dismiss tray after selecting — user taps next patch to bring it back up
      setSelectedPatchId(null);
    }
  }, [selectedPatchId, selectedPatch, updatePatch, setSelectedPatchId]);

  const handleTrayThreadColorSelect = useCallback((hex: string) => {
    updateDesign({ metadata: { ...design.metadata, threadColor: hex } });
  }, [design.metadata, updateDesign]);

  const handleTrayExpandTextures = useCallback(() => setShowMobileTextures(true), []);
  const handleTrayClose = useCallback(() => setSelectedPatchId(null), []);

  const trayThreadColors = useMemo(() => {
    return adminSettings.thread_colors?.length ? adminSettings.thread_colors : ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'];
  }, [adminSettings.thread_colors]);

  const trayCurrentThreadColor = useMemo(() => {
    return (design.metadata.threadColor ?? '#E8E4DC').replace(/^#/, '').toUpperCase();
  }, [design.metadata.threadColor]);

  const trayPatchInfo = useMemo(() => {
    if (!selectedPatch) return '';
    return `${selectedPatch.width}x${selectedPatch.height} - ${((selectedPatch.width) * (selectedPatch.height) * gridUnitSize * gridUnitSize).toFixed(2)}m²`;
  }, [selectedPatch?.width, selectedPatch?.height, gridUnitSize]);

  // Check for pending design on mount (after auth redirect)
  useEffect(() => {
    if (designId) {
      setIsLoadingDesign(true);
      getDesign(designId)
        .then((savedDesign) => {
          if (savedDesign) {
            setDesign(savedDesign);
          }
        })
        .finally(() => setIsLoadingDesign(false));
    } else if (hasPendingDesign()) {
      if (isAuthenticated) {
        // User just logged in and has a pending design
        setShowRestoreDialog(true);
      } else {
        // User navigated back from auth without logging in — restore their design silently
        const pending = getPendingDesign();
        if (pending) setDesign(pending);
      }
    } else if (design.patches.length === 0 && !isModified) {
      setShowSetupDialog(true);
    }
  }, [designId, isAuthenticated]);

  const handleRestorePendingDesign = useCallback(() => {
    const pending = getPendingDesign();
    if (pending) {
      setDesign(pending);
      clearPendingDesign();
      toast({ title: t('designer.designRestoredToast'), description: t('designer.designRestoredToastDesc') });
    }
    setShowRestoreDialog(false);
  }, [setDesign, toast]);

  const handleDiscardPendingDesign = useCallback(() => {
    clearPendingDesign();
    setShowRestoreDialog(false);
    setShowSetupDialog(true);
  }, []);

  // Prevent unintentional reload/navigation if modified or has patches
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModified || design.patches.length > 0) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
        return ''; // Required for others
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModified, design.patches.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Control + Key shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); return; }
        if (e.key === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === '?') { e.preventDefault(); setShowKeyboardShortcuts(true); return; }
      }

      // Nudge with arrows
      if (selectedPatchId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const patch = design.patches.find(p => p.id === selectedPatchId);
        if (patch && !patch.isLocked) {
          let nx = patch.x;
          let ny = patch.y;
          if (e.key === 'ArrowUp') ny -= 1;
          if (e.key === 'ArrowDown') ny += 1;
          if (e.key === 'ArrowLeft') nx -= 1;
          if (e.key === 'ArrowRight') nx += 1;
          updatePatch(selectedPatchId, { x: nx, y: ny });
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v': setToolMode('select'); break;
        case 'a': setToolMode('add'); break;
        case 'd': setToolMode('delete'); break;
        case 'delete':
        case 'backspace': {
          const patch = selectedPatchId ? design.patches.find(p => p.id === selectedPatchId) : null;
          if (patch && !patch.isLocked) deletePatch(selectedPatchId);
          break;
        }
        case 'escape': setSelectedPatchId(null); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPatchId, setToolMode, deletePatch, setSelectedPatchId, undo, redo, design.patches, updatePatch]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    if (!isAuthenticated) {
      // Save design to localStorage before redirecting
      savePendingDesign(design);
      toast({ title: t('designer.savedLocally'), description: t('designer.loginToSave') });
      navigate('/auth');
      return;
    }
    setIsSaving(true);
    try {
      const totalPrice = design.totalArea * adminSettings.price_per_sqm;
      const saved = await saveDesign({ ...design, totalPrice });
      toast({ title: t('designer.savedToast'), description: t('designer.savedToastDesc') });

      // Redirect to design page with ID if not already there
      if (saved?.id && designId !== saved.id) {
        navigate(`/designer?id=${saved.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Save design error:', error);
      toast({
        title: t('designer.syncFailed'),
        description: error instanceof Error ? error.message : t('designer.syncFailedDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [canSave, isAuthenticated, design, adminSettings.price_per_sqm, saveDesign, toast, navigate, designId]);

  const canvasRef = useRef<{ getDataURL: () => string }>(null);

  const handleSubmit = useCallback(async () => {
    if (!isTemplateFilled) return;
    if (!isAuthenticated) {
      savePendingDesign(design);
      toast({ title: t('designer.savedLocally'), description: t('designer.loginToSubmitPrice') });
      navigate('/auth');
      return;
    }
    if (!adminSettings.company_email?.trim()) {
      toast({ title: t('designer.companyEmailNotSet'), description: t('designer.companyEmailNotSetDesc'), variant: 'destructive' });
      return;
    }
    if (isSubmittingRef.current) return; // prevent double-tap
    isSubmittingRef.current = true;

    const totalPrice = design.totalArea * adminSettings.price_per_sqm;
    const designWithPrice = { ...design, totalPrice };

    // Show success immediately — heavy work (PDF + email) runs in background
    setShowSuccessDialog(true);

    // Fire-and-forget: save design + generate PDF + send email + create order
    (async () => {
      try {
        const saved = await saveDesign(designWithPrice);
        await createOrder(saved?.id, designWithPrice);

        // PDF generation and email sending happen after order is created
        const designImage = canvasRef.current?.getDataURL() || '';
        const usedTextureIds = [...new Set(designWithPrice.patches.map((p) => p.textureId).filter(Boolean))] as string[];
        const textureImageDataUrls = await loadTextureImagesAsDataUrls(usedTextureIds, textures);
        const pdf = generateOrderPdf(designWithPrice, designImage, user, undefined, textures, {
          company_name: adminSettings.company_name,
          pdf_header_text: adminSettings.pdf_header_text,
          grid_unit_size: adminSettings.grid_unit_size,
        }, textureImageDataUrls);
        const pdfBase64 = pdf.output('datauristring').split(',')[1];

        const { error: emailError } = await supabase.functions.invoke('send-design-email', {
          body: {
            designData: designWithPrice,
            pdfBase64,
            userEmail: user?.email,
            userName: designWithPrice.metadata?.clientName || user?.email,
            companyEmail: adminSettings.company_email.trim(),
            companyName: adminSettings.company_name,
          },
        });
        if (emailError) console.error('Background email error:', emailError);
      } catch (error: any) {
        console.error('Background submit error:', error);
      } finally {
        isSubmittingRef.current = false;
      }
    })();
  }, [isTemplateFilled, isAuthenticated, design, user, navigate, toast, adminSettings, saveDesign, textures, createOrder]);

  const keyboardShortcuts = [
    { keys: t('designer.shortcutMouseKeys'), desc: t('designer.shortcutMouseDesc') },
    { keys: 'Ctrl + Z', desc: t('designer.undo') },
    { keys: 'Ctrl + Y', desc: t('designer.redo') },
    { keys: 'Esc', desc: t('designer.shortcutDeselect') },
  ];

  if (isLoadingDesign) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-5 pt-[80px]">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">{t('designer.initWorkspace')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden relative selection:bg-primary/20 pt-[80px]">
      <main className="flex-1 flex gap-0 md:gap-3 py-0 md:py-3 px-0 md:px-3 overflow-hidden bg-muted/30 min-w-0 pb-[72px] md:pb-3">

        {/* Left: Textures + thread color */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="hidden lg:flex flex-col w-80 min-w-[280px] shrink-0 gap-3 overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: 'calc(100vh - 5.5rem)' }}
        >
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4 flex flex-col min-h-0">
            <TexturePanel
              textures={textures}
              selectedTextureId={selectedPatch?.textureId ?? selectedTextureId}
              onTextureSelect={(tex) => {
                setSelectedTextureId(tex.id);
                if (selectedPatchId && selectedPatch) {
                  updatePatch(selectedPatchId, { textureId: tex.id, color: tex.hex ?? selectedPatch.color });
                }
              }}
              onTextureDragStart={() => setIsDraggingTexture(true)}
            />

            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('designer.threadColorLabel')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {(adminSettings.thread_colors?.length ? adminSettings.thread_colors : ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'])
                  .slice(0, showAllThreadColors ? undefined : 10)
                  .map((code) => {
                  const hex = `#${code}`;
                  const currentHex = (design.metadata.threadColor ?? '#E8E4DC').replace(/^#/, '').toUpperCase();
                  const isSelected = currentHex === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => updateDesign({ metadata: { ...design.metadata, threadColor: hex } })}
                      className={`w-9 h-9 rounded-xl border-2 shrink-0 transition-all shadow-sm ${isSelected ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border hover:border-primary/50 hover:scale-105'}`}
                      style={{ backgroundColor: hex }}
                      title={`#${code}`}
                    />
                  );
                })}
                {(adminSettings.thread_colors?.length ?? 0) > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAllThreadColors(v => !v)}
                    className="text-xs font-semibold text-primary underline underline-offset-2 shrink-0"
                  >
                    {showAllThreadColors ? t('designer.showLess') : `+${(adminSettings.thread_colors?.length ?? 0) - 10}`}
                  </button>
                )}
              </div>
            </div>

          </section>
        </motion.aside>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.03 }}
          className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative"
          style={{ maxHeight: '100%' }}
        >
          <div className="flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden md:rounded-2xl border-0 md:border-2 border-border bg-card shadow-none md:shadow-md ring-0 md:ring-1 md:ring-black/5 relative">
            {/* Mobile Floating Actions */}
            <div className="lg:hidden absolute top-3 right-3 z-30 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-md bg-card/90 backdrop-blur-md border border-border disabled:opacity-30"
                disabled={!canUndo}
                onClick={undo}
                title={t('designer.undo')}
              >
                <Undo2 size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-md bg-card/90 backdrop-blur-md border border-border disabled:opacity-30"
                disabled={!canRedo}
                onClick={redo}
                title={t('designer.redo')}
              >
                <Redo2 size={16} />
              </Button>
            </div>

            <DesignerCanvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              gridWidth={gridWidth}
              gridHeight={gridHeight}
              patches={design.patches}
              selectedPatchId={selectedPatchId}
              selectedColor={selectedColor}
              selectedTextureId={selectedTextureId}
              textures={textures}
              canvasGridSize={canvasGridSize}
              gridUnitSize={gridUnitSize}
              toolMode={toolMode}
              constraints={design.constraints}
              metadata={design.metadata}
              threadColor={(() => {
                const list = adminSettings.thread_colors?.length ? adminSettings.thread_colors : ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'];
                const current = (design.metadata.threadColor ?? '#E8E4DC').replace(/^#/, '').toUpperCase();
                const valid = list.includes(current) ? current : list[0];
                return `#${valid}`;
              })()}
              showGrid={adminSettings.show_grid}
              showRulers={adminSettings.show_rulers}
              isDraggingTexture={isDraggingTexture}
              onTextureDragEnd={() => setIsDraggingTexture(false)}
              onPatchSelect={setSelectedPatchId}
              onPatchAdd={addPatch}
              onPatchMove={movePatch}
              onPatchResize={resizePatch}
              onPatchRotate={(id, rot) => updatePatch(id, { rotation: rot })}
              onPatchDelete={deletePatch}
              updatePatch={updatePatch}
            />
          </div>
        </motion.div>

        {/* Right: Project + Price */}
        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
          className="hidden lg:flex flex-col w-80 min-w-[280px] shrink-0 gap-3 overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: 'calc(100vh - 5.5rem)' }}
        >
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('designer.project')}</span>
              <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-background" disabled={!canUndo} onClick={undo} title={t('designer.undo')}><Undo2 size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-background" disabled={!canRedo} onClick={redo} title={t('designer.redo')}><Redo2 size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-background" onClick={() => setShowKeyboardShortcuts(true)} title={t('designer.shortcuts')}><Keyboard size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-background" onClick={() => setShowSetupDialog(true)} title={t('pricePanel.projectSettings')}><Settings2 size={16} /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground truncate" title={design.name}>{design.name}</p>
              <Badge variant="secondary" className="text-[10px] font-mono w-fit">
                {Math.round(design.width * 100)}×{Math.round(design.height * 100)} cm
              </Badge>
            </div>
            {design.patches.length === 0 && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border border-dashed border-border">
                {t('designer.emptyProjectHint')}
              </p>
            )}
            <Button variant="outline" className="w-full justify-center gap-2 h-10 border-dashed rounded-xl text-xs font-medium hover:bg-muted/50" onClick={() => {
              if (confirm(t('designer.newDesignConfirm'))) { resetDesign(); setShowSetupDialog(true); }
            }}>
              <PlusCircle size={14} /> {t('pricePanel.newDesign')}
            </Button>
          </section>

          <section className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col min-h-0">
            <PricePanel design={design} isModified={isModified} isTemplateFilled={isTemplateFilled} canSave={canSave} onSave={handleSave} onSubmit={handleSubmit} onClear={clearPatchTextures} onShare={() => isTemplateFilled && setShowShareDialog(true)} isSaving={isSaving} currentOrder={getLatestOrderForDesign(design.id)} />
          </section>
        </motion.aside>
      </main>

      {/*
        Mobile Texture Tray — always kept in the DOM so <img> nodes are never
        destroyed. We only animate the Y position. Removing/adding the element
        from the tree (via conditional render or changing `key`) creates new DOM
        nodes which forces the browser to re-decode every image even if cached.
      */}
      {(() => {
        const trayVisible = !!(selectedPatchId && !showMobileTextures && !showMobileSummary);
        return (
          <motion.div
            initial={{ y: 240, opacity: 0 }}
            animate={trayVisible ? { y: 0, opacity: 1 } : { y: 240, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34, mass: 0.75 }}
            className="lg:hidden fixed bottom-[4.75rem] left-0 right-0 z-40 px-3 flex flex-col gap-2"
            style={{ pointerEvents: trayVisible ? 'auto' : 'none' }}
            aria-hidden={!trayVisible}
          >
            <MobileTextureTray
              textures={textures}
              selectedTextureId={selectedPatch?.textureId ?? null}
              threadColors={trayThreadColors}
              currentThreadColor={trayCurrentThreadColor}
              onTextureSelect={handleTrayTextureSelect}
              onThreadColorSelect={handleTrayThreadColorSelect}
              onExpandTextures={handleTrayExpandTextures}
              onClose={handleTrayClose}
              patchInfo={trayPatchInfo}
            />
          </motion.div>
        );
      })()}

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-4">
          <button
            onClick={() => setShowMobileTextures(true)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${showMobileTextures ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Paintbrush className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{t('designer.textures')}</span>
          </button>

          <div className="relative -top-4 flex flex-col items-center">
            <button
              onClick={() => setShowSetupDialog(true)}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-4 border-card"
            >
              <Settings2 className="w-6 h-6" />
            </button>
            <span className="text-[9px] font-bold text-primary mt-0.5 uppercase tracking-tight">{t('designer.dimensions')}</span>
          </div>

          <button
            onClick={() => setShowMobileSummary(true)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${showMobileSummary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{t('pricePanel.designSummary')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Textures Sheet */}
      <Sheet open={showMobileTextures} onOpenChange={setShowMobileTextures}>
        <SheetContent side="bottom" className="h-auto max-h-[85dvh] rounded-t-3xl border-t-2 border-primary/20 p-0 overflow-hidden bg-card transition-all duration-300">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-primary" />
              {t('designer.texturesTitle')}
            </SheetTitle>
            <SheetDescription className="sr-only">{t('designer.texturesDesc')}</SheetDescription>
          </SheetHeader>
          <div className="p-6 pt-2 overflow-y-auto max-h-[calc(85dvh-80px)] pb-10">
            {!selectedPatchId && (
              <div className="mb-4 bg-muted/50 border border-border p-3 rounded-lg flex gap-2 items-start">
                <MousePointer2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('designer.textureHint')}
                </p>
              </div>
            )}
            <div className="mb-4 bg-primary/5 border border-primary/10 p-3 rounded-lg flex gap-2 items-center">
              <Monitor className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[10px] text-primary/80 font-medium">
                {t('designer.desktopTip')}
              </p>
            </div>
            <TexturePanel
              textures={textures}
              selectedTextureId={selectedPatch?.textureId ?? selectedTextureId}
              onTextureSelect={(tex) => {
                setSelectedTextureId(tex.id);
                if (selectedPatchId && selectedPatch) {
                  updatePatch(selectedPatchId, { textureId: tex.id, color: tex.hex ?? selectedPatch.color });
                }
              }}
            />

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('designer.threadColorLabel')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {(adminSettings.thread_colors?.length ? adminSettings.thread_colors : ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'])
                  .slice(0, showAllThreadColors ? undefined : 10)
                  .map((code) => {
                  const hex = `#${code}`;
                  const currentHex = (design.metadata.threadColor ?? '#E8E4DC').replace(/^#/, '').toUpperCase();
                  const isSelected = currentHex === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => updateDesign({ metadata: { ...design.metadata, threadColor: hex } })}
                      className={`w-12 h-12 rounded-2xl border-2 transition-all shadow-sm ${isSelected ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'}`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
                {(adminSettings.thread_colors?.length ?? 0) > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAllThreadColors(v => !v)}
                    className="text-sm font-semibold text-primary underline underline-offset-2 shrink-0"
                  >
                    {showAllThreadColors ? t('designer.showLess') : `+${(adminSettings.thread_colors?.length ?? 0) - 10}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Summary Sheet */}
      <Sheet open={showMobileSummary} onOpenChange={setShowMobileSummary}>
        <SheetContent side="bottom" className="h-auto max-h-[90dvh] rounded-t-3xl border-t-2 border-primary/20 p-0 overflow-hidden bg-card transition-all duration-300">
          <SheetHeader className="p-6 pb-2 border-b border-border">
            <div className="flex items-center">
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                {t('pricePanel.summary')}
              </SheetTitle>
            </div>
            <SheetDescription className="sr-only">{t('pricePanel.summaryDesc')}</SheetDescription>
          </SheetHeader>
          <div className="p-6 pt-4 overflow-y-auto max-h-[calc(90dvh-80px)] space-y-4">
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex gap-2 items-center">
              <Monitor className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[10px] text-primary/80 font-medium leading-tight">
                {t('designer.desktopTip')}
              </p>
            </div>

            <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div
                className="space-y-0.5 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                onClick={() => setShowSetupDialog(true)}
              >
                <p className="text-sm font-semibold text-foreground truncate max-w-[150px]">{design.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  {Math.round(design.width * 100)}×{Math.round(design.height * 100)} cm
                  <Settings2 size={10} className="text-primary" />
                </p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1.5 rounded-lg" onClick={() => {
                if (confirm(t('designer.newDesignConfirm'))) { resetDesign(); setShowSetupDialog(true); setShowMobileSummary(false); }
              }}>
                <PlusCircle size={12} /> {t('pricePanel.newDesign')}
              </Button>
            </div>

            <PricePanel
              design={design}
              isModified={isModified}
              isTemplateFilled={isTemplateFilled}
              canSave={canSave}
              onSave={handleSave}
              onSubmit={handleSubmit}
              onClear={clearPatchTextures}
              onShare={() => isTemplateFilled && setShowShareDialog(true)}
              isSaving={isSaving}
              currentOrder={getLatestOrderForDesign(design.id)}
            />

            <div className="h-20" /> {/* Spacer for safe area and flow */}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t('designer.successDialogTitle')}</DialogTitle>
                <DialogDescription className="text-sm">{t('designer.successDialogDesc')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full h-12">
              {t('designer.returnToDesigner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        designName={design.name}
        designSummary={`${Math.round(design.width * 100)}×${Math.round(design.height * 100)} cm • ${design.patches.length} parça • ${design.totalArea.toFixed(2)} m²`}
      />

      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary shrink-0" />
              </div>
              <DialogTitle className="text-base">{t('designer.keyboardShortcuts')}</DialogTitle>
            </div>
          </DialogHeader>
          <ul className="space-y-2 py-1">
            {keyboardShortcuts.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-sm text-foreground">{s.desc}</span>
                <kbd className="shrink-0 px-2.5 py-1 text-xs font-mono bg-background border border-border rounded-lg shadow-sm">{s.keys}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* Restore Design Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t('designer.restoreTitle')}</DialogTitle>
                <DialogDescription className="text-sm">
                  {t('designer.restoreDesc')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleDiscardPendingDesign} className="flex-1">
              {t('designer.startFresh')}
            </Button>
            <Button onClick={handleRestorePendingDesign} className="flex-1">
              {t('designer.restoreDesign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DesignSetupDialog open={showSetupDialog} onOpenChange={setShowSetupDialog} currentDesign={design} user={user} onConfirm={(updates) => {
        const w = updates.width ?? design.width;
        const h = updates.height ?? design.height;
        const dimensionsChanged = w !== design.width || h !== design.height;
        // Apply template if dimensions changed OR if it's the first setup (no patches yet)
        if (dimensionsChanged || design.patches.length === 0) {
          const { patches, effectiveWidthM } = getStripTemplatePatches(w, h);
          updateDesign({ ...updates, width: effectiveWidthM, height: h, patches });
        } else {
          updateDesign(updates);
        }
      }} />
    </div>
  );
};

export default Designer;
