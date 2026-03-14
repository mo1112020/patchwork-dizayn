import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { adminUpdateSettings, adminUploadHeroImage } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, DollarSign, Mail, Building2, Eye, Plus, Trash2, Palette, ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/image-utils';

function SettingGroup({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="pl-4 sm:pl-12 space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type SettingsSection = 'pricing' | 'hero' | 'thread' | 'email';

export function AdminDesignerSettings({ activeSection }: { activeSection?: SettingsSection }) {
  const queryClient = useQueryClient();
  const { settings, isLoading } = useDesignerSettings();
  const { rate: usdToTry } = useExchangeRate();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    price_per_sqm: 150,
    default_rug_width: 2,
    default_rug_height: 3,
    waste_allowance: 5,
    precision_tolerance: 2,
    grid_unit_size: 0.05,
    canvas_grid_size: 40,
    company_email: '',
    company_name: 'PATCHWORK DIZAYN',
    pdf_header_text: '',
    default_tool_mode: 'add',
    show_grid: true,
    show_rulers: true,
    max_rug_width: 5,
    max_rug_height: 5,
    show_price: true,
    thread_colors: ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'],
    hero_images: [] as string[],
  });
  const [newThreadHex, setNewThreadHex] = useState('');
  const [heroUploading, setHeroUploading] = useState(false);

  useEffect(() => {
    setForm({
      price_per_sqm: settings.price_per_sqm,
      default_rug_width: settings.default_rug_width,
      default_rug_height: settings.default_rug_height,
      waste_allowance: settings.waste_allowance,
      precision_tolerance: settings.precision_tolerance,
      grid_unit_size: settings.grid_unit_size,
      canvas_grid_size: settings.canvas_grid_size,
      company_email: settings.company_email,
      company_name: settings.company_name,
      pdf_header_text: settings.pdf_header_text,
      default_tool_mode: settings.default_tool_mode,
      show_grid: settings.show_grid,
      show_rulers: settings.show_rulers,
      max_rug_width: settings.max_rug_width,
      max_rug_height: settings.max_rug_height,
      show_price: settings.show_price,
      thread_colors: settings.thread_colors?.length ? settings.thread_colors : ['E8E4DC', '2C2C2C', '8B7355', 'F5F5DC', '4A4A4A'],
      hero_images: settings.hero_images?.length ? settings.hero_images : [],
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const { error } = await adminUpdateSettings(form);
    setIsUpdating(false);
    if (error) {
      toast({ title: 'Kaydedilemedi', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Ayarlar kaydedildi ✓' });
    queryClient.invalidateQueries({ queryKey: ['designer-settings'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const normalizeHex = (s: string) => s.replace(/^#/, '').trim().toUpperCase().slice(0, 6);
  const addThreadColor = () => {
    const hex = normalizeHex(newThreadHex);
    if (hex.length === 6 && !form.thread_colors.includes(hex)) {
      setForm((f) => ({ ...f, thread_colors: [...f.thread_colors, hex] }));
      setNewThreadHex('');
    }
  };
  const removeThreadColor = (hex: string) => {
    setForm((f) => ({ ...f, thread_colors: f.thread_colors.filter((c) => c !== hex) }));
  };

  const addHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    e.target.value = '';
    setHeroUploading(true);

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const compressedFile = await compressImage(file);
        const { url, error } = await adminUploadHeroImage(compressedFile);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else if (url) {
          urls.push(url);
        }
      } catch (err) {
        errors.push(`${file.name}: Sıkıştırma hatası`);
      }
    }

    setHeroUploading(false);

    if (errors.length > 0) {
      toast({
        title: 'Bazı görseller yüklenemedi',
        description: errors.join('\n'),
        variant: 'destructive'
      });
    }

    if (urls.length > 0) {
      setForm((f) => ({ ...f, hero_images: [...f.hero_images, ...urls] }));
      if (errors.length === 0) {
        toast({ title: 'Görseller başarıyla eklendi ✓' });
      }
    }
  };
  const removeHeroImage = (url: string) => {
    setForm((f) => ({ ...f, hero_images: f.hero_images.filter((u) => u !== url) }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeSection ?? undefined} defaultValue="pricing" className="w-full">
        {!activeSection && (
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-12 rounded-xl bg-muted/60 p-1 gap-1">
            <TabsTrigger value="pricing" className="gap-2 text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
              <DollarSign className="w-3.5 h-3.5" /> Fiyat & Ölçü
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2 text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
              <ImageIcon className="w-3.5 h-3.5" /> Hero
            </TabsTrigger>
            <TabsTrigger value="thread" className="gap-2 text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
              <Palette className="w-3.5 h-3.5" /> İp Renkleri
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
              <Mail className="w-3.5 h-3.5" /> E-posta & PDF
            </TabsTrigger>
          </TabsList>
        )}

        {/* Pricing */}
        {(!activeSection || activeSection === 'pricing') && (
          <TabsContent value="pricing" className="space-y-4 mt-6">
            <SettingGroup icon={Eye} title="Fiyat Görünürlüğü" description="Kullanıcılara fiyat bilgisini göster veya gizle">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Fiyatı kullanıcılara göster</Label>
                  <p className="text-xs text-muted-foreground">Kapatıldığında tasarımcıda fiyat paneli gizlenir</p>
                </div>
                <Switch
                  checked={form.show_price}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, show_price: checked }))}
                />
              </div>
            </SettingGroup>

            <SettingGroup icon={DollarSign} title="Fiyatlandırma" description="m² başına birim fiyat (USD)">
              <FieldRow label="Fiyat (USD/m²)" hint="Tasarımcıda m² fiyatı dolar olarak kullanılır">
                <div className="flex items-center gap-3 flex-wrap">
                  <Input type="number" min={0} step={0.5} value={form.price_per_sqm}
                    onChange={(e) => setForm(f => ({ ...f, price_per_sqm: Number(e.target.value) || 0 }))}
                    className="w-32" />
                  {usdToTry != null && (
                    <span className="text-sm text-muted-foreground">
                      ≈ {(form.price_per_sqm * usdToTry).toFixed(0)} ₺
                    </span>
                  )}
                </div>
              </FieldRow>
            </SettingGroup>
          </TabsContent>
        )}

        {/* Hero section (home page) images */}
        {(!activeSection || activeSection === 'hero') && (
          <TabsContent value="hero" className="space-y-4 mt-6">
            <SettingGroup icon={ImageIcon} title="Ana sayfa hero görselleri" description="Hero bölümünde gösterilecek görseller. Birden fazla eklenirse sağa doğru kayan bir carousel olur.">
              <FieldRow label="Mevcut görseller" hint="Sıra: yukarıdan aşağıya. Kaydet'e basınca ana sayfada görünür.">
                <div className="flex flex-wrap gap-3">
                  {form.hero_images.map((url) => (
                    <div key={url} className="relative group rounded-xl border border-border overflow-hidden bg-muted/30 w-32 aspect-video shrink-0">
                      <img
                        src={url}
                        alt=""
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 object-fill"
                        style={{ width: '56.25%', height: '177.77%' }}
                      />
                      <button type="button" onClick={() => removeHeroImage(url)} className="absolute top-1 right-1 p-1.5 rounded-lg bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="Kaldır">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </FieldRow>
              <FieldRow label="Görsel ekle">
                <div className="flex items-center gap-2">
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={addHeroImage} className="text-sm file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium" disabled={heroUploading} />
                  {heroUploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  <p className="text-[10px] text-muted-foreground/60">Büyük dosyalar otomatik optimize edilir.</p>
                </div>
              </FieldRow>
            </SettingGroup>
          </TabsContent>
        )}

        {/* Thread (ip) colors */}
        {(!activeSection || activeSection === 'thread') && (
          <TabsContent value="thread" className="space-y-4 mt-6">
            <SettingGroup icon={Palette} title="Parçalar arası ip renkleri" description="Tasarımcıda kullanıcılar sadece bu renklerden birini seçebilir. Hex kodu ile ekleyin (örn. ff0000).">
              <FieldRow label="Mevcut renkler" hint="Her renk 6 karakterlik hex kodu ile gösterilir (örn. E8E4DC)">
                <div className="flex flex-wrap gap-2">
                  {form.thread_colors.map((code) => (
                    <div key={code} className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2 py-1.5">
                      <div className="w-6 h-6 rounded border border-border shrink-0" style={{ backgroundColor: `#${code}` }} title={`#${code}`} />
                      <span className="text-xs font-mono text-foreground">{code}</span>
                      <button type="button" onClick={() => removeThreadColor(code)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive" title="Kaldır">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </FieldRow>
              <FieldRow label="Yeni renk ekle (hex)" hint="Örn: ff0000 veya E8E4DC">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="ff0000"
                    value={newThreadHex}
                    onChange={(e) => setNewThreadHex(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addThreadColor())}
                    className="w-28 font-mono uppercase"
                    maxLength={7}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addThreadColor} className="gap-1">
                    <Plus className="w-4 h-4" /> Ekle
                  </Button>
                </div>
              </FieldRow>
            </SettingGroup>
          </TabsContent>
        )}

        {/* Email & PDF */}
        {(!activeSection || activeSection === 'email') && (
          <TabsContent value="email" className="space-y-4 mt-6">
            <SettingGroup icon={Building2} title="Şirket Bilgileri & E-posta" description="Marka bilgileri ve sipariş bildirimlerinin gönderileceği adres.">
              <FieldRow label="Şirket Adı" hint="PDF başlığında ve e-postalarda görünür">
                <Input value={form.company_name}
                  onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </FieldRow>
              <FieldRow label="Bildirim Alıcısı (Email)" hint="Müşteriler tasarımlarını gönderdiğinde PDF bu adrese gelir.">
                <Input type="email" placeholder="alıcı@eposta.com" value={form.company_email}
                  onChange={(e) => setForm(f => ({ ...f, company_email: e.target.value }))} />
              </FieldRow>

            </SettingGroup>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isUpdating} size="lg" className="gap-2 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </form>
  );
}
