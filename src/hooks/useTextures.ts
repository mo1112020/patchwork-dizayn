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

function preloadImage(id: string, url: string): Promise<void> {
  if (textureImageGlobalCache.has(id) || preloadingIds.has(id)) return Promise.resolve();
  preloadingIds.add(id);

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

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  return img.decode().then(() => {
    textureImageGlobalCache.set(id, img);
    preloadingIds.delete(id);
  }).catch(() => {
    return new Promise<void>((resolve) => {
      img.onload = () => {
        textureImageGlobalCache.set(id, img);
        preloadingIds.delete(id);
        resolve();
      };
      img.onerror = () => { preloadingIds.delete(id); resolve(); };
    });
  });
}

/** Start thumbnail decode into the global cache (used by list hover + designer). */
export function warmRugTextureThumbnail(tex: RugTexture): void {
  const url = tex.thumbnailUrl && tex.thumbnailUrl !== tex.imageUrl ? tex.thumbnailUrl : tex.imageUrl;
  if (!url) return;
  void preloadImage(tex.id, url);
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
  const thumbnailUrl = row.image_path
    ? supabase.storage.from(BUCKET).getPublicUrl(row.image_path, {
        transform: { width: 200, height: 200, resize: 'cover' },
      }).data.publicUrl
    : TEXTURE_PLACEHOLDER;
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    imageUrl,
    thumbnailUrl,
    hex: row.hex ?? undefined,
    category: row.category,
  };
}

async function fetchTextures(): Promise<RugTexture[]> {
  const all: RugTexture[] = [];
  const BATCH = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('rug_textures')
      .select('id, name, code, image_path, hex, display_order, category')
      .order('display_order', { ascending: true })
      .range(from, from + BATCH - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data.map(buildTextureFromRow));
    if (data.length < BATCH) break;
    from += BATCH;
  }

  const toPreload = all
    .filter((t) => t.thumbnailUrl && t.thumbnailUrl !== TEXTURE_PLACEHOLDER)
    .map((t) => ({ id: t.id, imageUrl: t.thumbnailUrl }));
  void Promise.all(toPreload.map((t) => preloadImage(t.id, t.imageUrl)));

  return all;
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
