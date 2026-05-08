import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'rug-textures';
const HERO_PATH_PREFIX = 'hero/';

export async function adminUpdateSettings(settings: Record<string, unknown>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('designer_settings')
    .update(settings as Record<string, unknown>)
    .eq('id', 'default');
  if (error) return { error: error.message };
  return { error: null };
}

export async function adminGetMaxTextureCodeNum(): Promise<number> {
  const { data } = await supabase
    .from('rug_textures')
    .select('code')
    .like('code', 'TX-%')
    .order('code', { ascending: false })
    .limit(1);
  if (!data?.length) return 0;
  const m = (data[0].code as string).match(/^TX-(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export async function adminCreateTexture(payload: {
  id: string;
  name: string;
  code: string;
  hex?: string;
  category?: string;
  display_order?: number;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('rug_textures').insert({
    id: payload.id,
    name: payload.name,
    code: payload.code,
    hex: payload.hex ?? null,
    category: payload.category ?? 'Genel',
    display_order: payload.display_order ?? 999,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function adminUpdateTexture(payload: {
  id: string;
  name: string;
  code: string;
  hex?: string;
  category?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('rug_textures')
    .update({
      name: payload.name,
      code: payload.code,
      hex: payload.hex ?? null,
      category: payload.category ?? 'Genel',
    })
    .eq('id', payload.id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function adminDeleteTexture(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('rug_textures').delete().eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function adminUploadTextureImage(
  textureId: string,
  file: File
): Promise<{ error: string | null }> {
  const ext = file.type?.includes('png') ? 'png' : 'jpg';
  const path = `${textureId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true });
  if (uploadError) return { error: uploadError.message };
  const { error: updateError } = await supabase
    .from('rug_textures')
    .update({ image_path: path })
    .eq('id', textureId);
  if (updateError) return { error: updateError.message };
  return { error: null };
}

export async function adminUploadHeroImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const ext = file.type?.includes('png') ? 'png' : 'jpg';
  const path = `${HERO_PATH_PREFIX}hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
  if (uploadError) return { url: null, error: uploadError.message };
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
