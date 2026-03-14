import React, { useState } from 'react';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';
import { useLanguage } from '@/context/LanguageContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Ruler, User, Phone } from 'lucide-react';
import { RugDesign } from '@/types/design';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const CLIENT_INFO_KEY = 'patchwork_client_info';

function loadStoredClientInfo(): { clientName: string; phoneNumber: string } | null {
    try {
        const raw = localStorage.getItem(CLIENT_INFO_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return null;
}

function saveClientInfo(clientName: string, phoneNumber: string) {
    try {
        localStorage.setItem(CLIENT_INFO_KEY, JSON.stringify({ clientName, phoneNumber }));
    } catch {}
}

interface DesignSetupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (designPatch: Partial<RugDesign>) => void;
    currentDesign: RugDesign;
    user?: SupabaseUser | null;
}

export const DesignSetupDialog: React.FC<DesignSetupDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    currentDesign,
    user,
}) => {
    const { t } = useLanguage();
    const { settings } = useDesignerSettings();
    const maxWidthCm = Math.round(settings.max_rug_width * 100);
    const maxHeightCm = Math.round(settings.max_rug_height * 100);

    const isDefaultDesign = () =>
        (currentDesign.name === t('designerSetup.unnamedRug') || currentDesign.name === 'İsimsiz Halı' || !currentDesign.name?.trim()) &&
        Math.abs(currentDesign.width - settings.default_rug_width) < 0.001 &&
        Math.abs(currentDesign.height - settings.default_rug_height) < 0.001;

    const [name, setName] = useState('');
    const [widthCm, setWidthCm] = useState<string>('');
    const [heightCm, setHeightCm] = useState<string>('');
    const [clientName, setClientName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    React.useEffect(() => {
        if (open) {
            const stored = loadStoredClientInfo();
            // Prefer design metadata → localStorage → logged-in user profile → empty
            const resolvedClientName =
                currentDesign.metadata?.clientName ||
                stored?.clientName ||
                (user?.user_metadata?.full_name as string | undefined) ||
                '';
            const resolvedPhone =
                currentDesign.metadata?.phoneNumber ||
                stored?.phoneNumber ||
                '';

            if (isDefaultDesign()) {
                setName('');
                setWidthCm(Math.round(settings.default_rug_width * 100).toString());
                setHeightCm(Math.round(settings.default_rug_height * 100).toString());
            } else {
                setName(currentDesign.name || '');
                setWidthCm(Math.round(currentDesign.width * 100).toString());
                setHeightCm(Math.round(currentDesign.height * 100).toString());
            }
            setClientName(resolvedClientName);
            setPhoneNumber(resolvedPhone);
        }
    }, [open, currentDesign.name, currentDesign.width, currentDesign.height, currentDesign.metadata?.clientName, currentDesign.metadata?.phoneNumber, settings.default_rug_width, settings.default_rug_height]);

    const MIN_WIDTH_CM = 80;
    const MIN_HEIGHT_CM = 100;

    const wNum = parseInt(widthCm, 10) || 0;
    const hNum = parseInt(heightCm, 10) || 0;

    const hasName = name.trim().length > 0;
    const isPhoneValid = phoneNumber.replace(/[^0-9]/g, '').length >= 10;
    const hasClientInfo = clientName.trim().length > 0 && isPhoneValid;
    const hasValidDimensions =
        wNum >= MIN_WIDTH_CM && wNum <= maxWidthCm &&
        hNum >= MIN_HEIGHT_CM && hNum <= maxHeightCm;
    const canSubmit = hasName && hasValidDimensions && hasClientInfo;

    const handleConfirm = () => {
        if (!canSubmit) return;
        const widthM = wNum / 100;
        const heightM = hNum / 100;
        // Persist client info so new designs auto-fill
        saveClientInfo(clientName.trim(), phoneNumber.trim());
        onConfirm({
            name: name.trim(),
            width: widthM,
            height: heightM,
            metadata: { ...currentDesign.metadata, clientName: clientName.trim(), phoneNumber: phoneNumber.trim() },
        });
        onOpenChange(false);
    };

    const areaCm2 = (wNum >= MIN_WIDTH_CM && hNum >= MIN_HEIGHT_CM) ? wNum * hNum : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-2 border-border rounded-2xl shadow-2xl p-4 md:p-6"
                hideCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-foreground text-center md:text-left">{t('designerSetup.title')}</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center md:text-left">
                        {t('designerSetup.desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 md:space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> {t('designerSetup.projectName')}
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('designerSetup.placeholderName')}
                            className="h-10 md:h-11 border-2 rounded-xl bg-muted/30"
                            aria-invalid={!hasName}
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5" /> {t('designerSetup.dimensions')}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground ml-1">{t('designerSetup.width')}</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={widthCm}
                                    onChange={(e) => setWidthCm(e.target.value)}
                                    placeholder={`${MIN_WIDTH_CM}-${maxWidthCm} cm`}
                                    step="10"
                                    min={MIN_WIDTH_CM}
                                    max={maxWidthCm}
                                    className="h-10 md:h-11 border-2 rounded-xl bg-muted/30 font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground ml-1">{t('designerSetup.height')}</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                    placeholder={`${MIN_HEIGHT_CM}-${maxHeightCm} cm`}
                                    step="10"
                                    min={MIN_HEIGHT_CM}
                                    max={maxHeightCm}
                                    className="h-10 md:h-11 border-2 rounded-xl bg-muted/30 font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <p className={`text-[10px] ${areaCm2 > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {areaCm2 > 0 ? `${(areaCm2 / 10000).toFixed(2)} m²` : t('designerSetup.enterDimensions')}
                            </p>
                            {(wNum > 0 || hNum > 0) && !hasValidDimensions && (
                                <p className="text-[9px] text-destructive animate-pulse font-medium">
                                    Min {MIN_WIDTH_CM}x{MIN_HEIGHT_CM}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> {t('designerSetup.clientName')}
                            </Label>
                            <Input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder={t('designerSetup.placeholderClient')}
                                className="h-10 md:h-11 border-2 rounded-xl bg-muted/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" /> {t('designerSetup.phoneNumber')}
                            </Label>
                            <Input
                                type="tel"
                                inputMode="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={t('designerSetup.placeholderPhone')}
                                className="h-10 md:h-11 border-2 rounded-xl bg-muted/30"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 md:mt-8">
                    <Button
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.98]"
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                    >
                        {t('designerSetup.apply')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
