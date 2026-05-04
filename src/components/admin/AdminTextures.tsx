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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminUpdateTexture, adminDeleteTexture, adminCreateTexture, adminUploadTextureImage } from '@/lib/admin-api';
import { Plus, Pencil, Trash2, Upload, Loader2, ImageIcon, X } from 'lucide-react';

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

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

  const handleAddMultiple = async (category: string, photos: { file: File; name: string }[]) => {
    if (!photos.length) {
      toast({ title: 'En az bir fotoğraf seçin', variant: 'destructive' });
      return;
    }
    setSaving(true);
    let successCount = 0;
    let failCount = 0;
    for (let i = 0; i < photos.length; i++) {
      const { file, name } = photos[i];
      const slug = slugify(name || file.name);
      const finalId = `tex-${slug}-${Date.now()}-${i}`;
      const code = `TX-${(textures.length + i + 1).toString().padStart(3, '0')}`;
      const { error: createError } = await adminCreateTexture({
        id: finalId,
        name: name.trim() || slug,
        code,
        category: category.trim() || 'Genel',
        display_order: textures.length + i,
      });
      if (createError) { failCount++; continue; }
      const compressed = await compressImage(file);
      const { error: uploadError } = await adminUploadTextureImage(finalId, compressed);
      if (uploadError) { failCount++; } else { successCount++; }
    }
    setSaving(false);
    setAddOpen(false);
    if (successCount) toast({ title: `${successCount} doku eklendi` });
    if (failCount) toast({ title: `${failCount} doku eklenemedi`, variant: 'destructive' });
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
              <CardDescription>Fotoğraf yükleyin. Eklenen dokular tasarım sayfasında listelenir.</CardDescription>
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
                        <img src={imageUrl(row.image_path)!} alt={row.name} className="w-full h-full object-cover" />
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
      <AddTexturesDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddMultiple}
        saving={saving}
      />
    </>
  );
}

function EditTextureDialog({
  open, onOpenChange, row, onSave, saving,
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
            <Label>Hex renk</Label>
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

type PhotoItem = { file: File; preview: string; name: string };

function AddTexturesDialog({
  open, onOpenChange, onAdd, saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (category: string, photos: { file: File; name: string }[]) => void;
  saving: boolean;
}) {
  const [category, setCategory] = useState('Genel');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: PhotoItem[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, ''),
    }));
    setPhotos((prev) => [...prev, ...newItems]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateName = (index: number, name: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setCategory('Genel');
    }
    onOpenChange(v);
  };

  const handleSubmit = () => {
    onAdd(category, photos.map((p) => ({ file: p.file, name: p.name })));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni doku ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Örn. Vintage, Modern, Klasik" />
          </div>

          <div className="grid gap-2">
            <Label>Fotoğraflar</Label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-muted-foreground/60 transition-colors bg-muted/30">
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">Fotoğraf seç (birden fazla seçebilirsiniz)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {photos.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                  <img src={p.preview} alt="" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                  <Input
                    value={p.name}
                    onChange={(e) => updateName(i, e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="Doku adı"
                  />
                  <button onClick={() => removePhoto(i)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} disabled={saving || !photos.length}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : `Ekle (${photos.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
