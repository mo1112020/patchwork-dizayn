import { supabase } from '@/integrations/supabase/client';

export const RUG_TEXTURES_BUCKET = 'rug-textures';

/**
 * Public URL for a texture image stored in Supabase Storage.
 * Use this when displaying or when the admin uploads a new image (path = file name in bucket).
 */
export function getTextureImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return supabase.storage.from(RUG_TEXTURES_BUCKET).getPublicUrl(imagePath).data.publicUrl;
}

/**
 * Upload a texture image to storage. For use in admin page.
 * Returns the path to store in rug_textures.image_path (e.g. "tex-ivory.jpg").
 */
export async function uploadTextureImage(
  textureId: string,
  file: File
): Promise<{ path: string; error: { message: string } | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${textureId}.${ext}`;
  const { error } = await supabase.storage.from(RUG_TEXTURES_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  return { path, error: error ? { message: error.message } : null };
}
