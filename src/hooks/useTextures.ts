import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RugTexture } from '@/types/design';

const TEXTURE_PLACEHOLDER = '/placeholder.svg';
const BUCKET = 'rug-textures';

/**
 * Global image cache shared across all components.
 * Images are preloaded when texture data is fetched,
 * so they are ready before the user even opens the designer.
 */
export const textureImageGlobalCache = new Map<string, HTMLImageElement>();
const preloadingIds = new Set<string>();

function preloadImage(id: string, url: string) {
  if (textureImageGlobalCache.has(id) || preloadingIds.has(id)) return;
  preloadingIds.add(id);

  // 1. Inject <link rel="preload"> into <head> for early browser fetch
  if (typeof document !== 'undefined') {
    const existing = document.querySelector(`link[data-texture-id="${id}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.setAttribute('data-texture-id', id);
      document.head.appendChild(link);
    }
  }

  // 2. Eagerly decode the Image into memory using decode() for non-blocking async decode
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  img.decode().then(() => {
    textureImageGlobalCache.set(id, img);
    preloadingIds.delete(id);
  }).catch(() => {
    // Fallback: store even if decode() fails (image still usable via onload)
    img.onload = () => {
      textureImageGlobalCache.set(id, img);
    };
    preloadingIds.delete(id);
  });
}

function buildTextureFromRow(row: {
  id: string;
  name: string;
  code: string;
  image_path: string | null;
  hex: string | null;
  category: string;
}): RugTexture {
  const imageUrl = row.image_path
    ? supabase.storage.from(BUCKET).getPublicUrl(row.image_path).data.publicUrl
    : TEXTURE_PLACEHOLDER;
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    imageUrl,
    hex: row.hex ?? undefined,
    category: row.category,
  };
}

async function fetchTextures(): Promise<RugTexture[]> {
  const { data, error } = await supabase
    .from('rug_textures')
    .select('id, name, code, image_path, hex, display_order, category')
    .order('display_order', { ascending: true });

  if (error) throw error;
  if (!data?.length) return [];

  const textures = data.map(buildTextureFromRow);

  // Start preloading all images immediately after fetch
  textures.forEach((tex) => {
    if (tex.imageUrl && tex.imageUrl !== TEXTURE_PLACEHOLDER) {
      preloadImage(tex.id, tex.imageUrl);
    }
  });

  return textures;
}

const QUERY_KEY = ['rug-textures'] as const;

export function useTextures() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTextures,
    staleTime: 30 * 60 * 1000,  // 30 min — textures rarely change
    gcTime: 60 * 60 * 1000,     // Keep in memory for 1 hour
  });

  const textures: RugTexture[] = query.data ?? [];

  return {
    textures,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
