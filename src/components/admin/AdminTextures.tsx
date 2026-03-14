import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminUpdateTexture, adminDeleteTexture, adminCreateTexture, adminUploadTextureImage } from '@/lib/admin-api';
import { Plus, Pencil, Trash2, Upload, Loader2, ImageIcon } from 'lucide-react';
import type { RugTexture } from '@/types/design';

const QUERY_KEY = ['rug-textures'];

type TextureRow = {
  id: string;
  name: string;
  code: string;
  image_path: string | null;
  hex: string | null;
  display_order: number;
  category: string;
};

export function AdminTextures() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [textures, setTextures] = useState<TextureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<TextureRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTextures = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rug_textures')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      toast({ title: 'Yüklenemedi', description: error.message, variant: 'destructive' });
    } else {
      setTextures(data || []);
    }
    setLoading(false);
  }, [toast]);

  React.useEffect(() => {
    loadTextures();
  }, [loadTextures]);

  const handleEdit = (row: TextureRow) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const handleSaveEdit = async (updates: { name: string; code: string; hex: string; category: string }) => {
    if (!editRow) return;
    setSaving(true);
    const { error } = await adminUpdateTexture({ id: editRow.id, name: updates.name, code: updates.code, hex: updates.hex || undefined, category: updates.category });
    setSaving(false);
    if (error) {
      toast({ title: 'Güncellenemedi', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Güncellendi' });
    setEditOpen(false);
    setEditRow(null);
    loadTextures();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu dokuyu silmek istediğinize emin misiniz?')) return;
    const { error } = await adminDeleteTexture(id);
    if (error) {
      toast({ title: 'Silinemedi', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Silindi' });
    loadTextures();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const handleUpload = async (row: TextureRow, file: File) => {
    setUploadingId(row.id);
    const compressedFile = await compressImage(file);
    const { error } = await adminUploadTextureImage(row.id, compressedFile);
    setUploadingId(null);
    if (error) {
      toast({ title: 'Yüklenemedi', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Fotoğraf yüklendi' });
    loadTextures();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const handleAdd = async (payload: { id: string; name: string; code: string; hex: string; category: string; photo: File | null }) => {
    const { id, name, code, hex, category, photo } = payload;
    const idClean = id.trim().toLowerCase().replace(/\s+/g, '-');
    if (!idClean || !name.trim() || !code.trim()) {
      toast({ title: 'ID, ad ve kod zorunludur', variant: 'destructive' });
      return;
    }
    const finalId = idClean.startsWith('tex-') ? idClean : `tex-${idClean}`;
    setSaving(true);
    const { error } = await adminCreateTexture({
      id: finalId,
      name: name.trim(),
      code: code.trim(),
      hex: hex.trim() || undefined,
      category: category.trim() || 'Genel',
      display_order: textures.length,
    });
    if (error) {
      setSaving(false);
      toast({ title: 'Eklenemedi', description: error, variant: 'destructive' });
      return;
    }
    if (photo) {
      const compressedPhoto = await compressImage(photo);
      const { error: uploadError } = await adminUploadTextureImage(finalId, compressedPhoto);
      if (uploadError) {
        toast({ title: 'Doku eklendi, fotoğraf yüklenemedi', description: uploadError, variant: 'destructive' });
      } else {
        toast({ title: 'Doku ve fotoğraf eklendi' });
      }
    } else {
      toast({ title: 'Doku eklendi' });
    }
    setSaving(false);
    setAddOpen(false);
    loadTextures();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const imageUrl = (path: string | null) =>
    path ? supabase.storage.from('rug-textures').getPublicUrl(path).data.publicUrl : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Halı dokuları</CardTitle>
              <CardDescription>Halı dokularını ekleyin, fotoğraf ve bilgileri girin. Eklenen dokular tasarım sayfasında listelenir.</CardDescription>
            </div>
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Yeni doku
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {textures.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border p-4 bg-card"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {imageUrl(row.image_path) ? (
                        <img
                          src={imageUrl(row.image_path)!}
                          alt={row.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{row.name}</p>
                      <p className="text-sm text-muted-foreground">{row.code}</p>
                      <p className="text-xs text-muted-foreground/70">{row.category}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <label className="cursor-pointer flex-1 sm:flex-none">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(row, f);
                        }}
                        disabled={!!uploadingId}
                      />
                      <Button variant="outline" size="sm" className="w-full gap-1 h-8 text-[10px]" asChild>
                        <span>
                          {uploadingId === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          Foto
                        </span>
                      </Button>
                    </label>
                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 text-[10px] gap-1" onClick={() => handleEdit(row)}>
                      <Pencil className="w-3 h-3" /> Düzenle
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 text-[10px] gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="w-3 h-3" /> Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditTextureDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        row={editRow}
        onSave={handleSaveEdit}
        saving={saving}
      />
      <AddTextureDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} saving={saving} />
    </>
  );
}

function EditTextureDialog({
  open,
  onOpenChange,
  row,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: TextureRow | null;
  onSave: (u: { name: string; code: string; hex: string; category: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hex, setHex] = useState('');
  const [category, setCategory] = useState('');

  React.useEffect(() => {
    if (row) {
      setName(row.name);
      setCode(row.code);
      setHex(row.hex || '');
      setCategory(row.category || 'Genel');
    }
  }, [row]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doku düzenle</DialogTitle>
          <DialogDescription>Ad, kod, renk ve kategori güncelleyin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Ad</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Fildişi" />
          </div>
          <div className="grid gap-2">
            <Label>Kod</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Örn. TX-101" />
          </div>
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Örn. Vintage" />
          </div>
          <div className="grid gap-2">
            <Label>Hex renk (PDF / önizleme)</Label>
            <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#F5F5DC" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={() => onSave({ name, code, hex, category })} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTextureDialog({
  open,
  onOpenChange,
  onAdd,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (payload: { id: string; name: string; code: string; hex: string; category: string; photo: File | null }) => void;
  saving: boolean;
}) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hex, setHex] = useState('');
  const [category, setCategory] = useState('Genel');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    onOpenChange(open);
  };

  const handleSubmit = () => {
    onAdd({ id, name, code, hex, category, photo });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni halı dokusu</DialogTitle>
          <DialogDescription>
            Bilgileri girin ve isteğe bağlı olarak halı fotoğrafı yükleyin. Eklenen dokular tasarımcıda görünür.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>ID (benzersiz)</Label>
            <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="tex-yeni" />
          </div>
          <div className="grid gap-2">
            <Label>Ad</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Yeni doku" />
          </div>
          <div className="grid gap-2">
            <Label>Kod</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TX-601" />
          </div>
          <div className="grid gap-2">
            <Label>Hex renk (PDF / önizleme)</Label>
            <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#E5E5E5" />
          </div>
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Örn. Vintage, Modern, Klasik" />
          </div>
          <div className="grid gap-2">
            <Label>Halı fotoğrafı (isteğe bağlı)</Label>
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-lg border border-dashed border-muted-foreground/30 overflow-hidden bg-muted flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="add-texture-photo"
                  onChange={handlePhotoChange}
                />
                <Label htmlFor="add-texture-photo" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" className="gap-1" asChild>
                    <span>
                      <Upload className="w-3 h-3" />
                      {photo ? 'Değiştir' : 'Fotoğraf seç'}
                    </span>
                  </Button>
                </Label>
                {photo && <p className="text-xs text-muted-foreground mt-1 truncate">{photo.name}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-1">Büyük dosyalar otomatik olarak optimize edilir.</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>İptal</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
