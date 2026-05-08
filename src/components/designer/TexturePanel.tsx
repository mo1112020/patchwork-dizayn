import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { RugTexture } from '@/types/design';
import { ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecentTextures } from '@/hooks/useRecentTextures';

interface TexturePanelProps {
  textures: RugTexture[];
  selectedTextureId: string | null;
  onTextureSelect: (texture: RugTexture) => void;
  onTextureDragStart?: (texture: RugTexture) => void;
  orientation?: 'vertical' | 'horizontal';
}

const VISIBLE_COUNT = 4;

interface PreviewState {
  tex: RugTexture;
  x: number;
  y: number;
}

function TextureThumb({
  tex,
  isSelected,
  eager,
  onSelect,
  onDragStart,
  onHover,
  onHoverEnd,
  size = 'lg',
}: {
  tex: RugTexture;
  isSelected: boolean;
  eager: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onHover?: (tex: RugTexture, e: React.MouseEvent<HTMLButtonElement>) => void;
  onHoverEnd?: () => void;
  size?: 'sm' | 'lg';
}) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      onMouseEnter={(e) => onHover?.(tex, e)}
      onMouseLeave={onHoverEnd}
      className={cn(
        `relative aspect-square ${dim} rounded-xl border-2 overflow-hidden transition-all flex-shrink-0`,
        isSelected
          ? 'border-primary ring-2 ring-primary/30 shadow-md'
          : 'border-border hover:border-primary/50 hover:shadow-sm'
      )}
      title={`${tex.name} (${tex.code})`}
    >
      <div className="absolute inset-0">
        <img
          src={tex.thumbnailUrl}
          alt={tex.name}
          className="w-full h-full object-cover"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            const fallback = el.parentElement?.querySelector('.texture-fallback');
            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
          }}
        />
        <div
          className="texture-fallback hidden absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: tex.hex || '#E5E5E5' }}
        >
          <ImageIcon className="w-6 h-6 text-white/60" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-medium px-1 py-0.5 truncate text-center">
        {tex.name}
      </div>
    </button>
  );
}

function TexturePreviewPopup({ preview }: { preview: PreviewState }) {
  const POPUP_W = 176;
  const POPUP_H = 220;
  const GAP = 12;

  const x = Math.min(preview.x + GAP, window.innerWidth - POPUP_W - 8);
  const y = Math.max(8, Math.min(preview.y - POPUP_H / 2, window.innerHeight - POPUP_H - 8));

  return createPortal(
    <div
      style={{ position: 'fixed', left: x, top: y, width: POPUP_W, zIndex: 9999 }}
      className="pointer-events-none bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-100"
    >
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-muted">
        <img
          src={preview.tex.thumbnailUrl}
          alt={preview.tex.name}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
      <p className="text-xs font-semibold text-center truncate px-1">{preview.tex.name}</p>
      <p className="text-[10px] text-muted-foreground text-center font-mono">{preview.tex.code}</p>
    </div>,
    document.body
  );
}

export const TexturePanel: React.FC<TexturePanelProps> = ({
  textures,
  selectedTextureId,
  onTextureSelect,
  onTextureDragStart,
  orientation = 'vertical',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const { recentIds, addRecent } = useRecentTextures();

  const categories = useMemo(() => {
    const map = new Map<string, RugTexture[]>();
    textures.forEach((tex) => {
      const cat = tex.category || 'Genel';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(tex);
    });
    return Array.from(map.entries());
  }, [textures]);

  const textureMap = useMemo(() => {
    const m = new Map<string, RugTexture>();
    textures.forEach((t) => m.set(t.id, t));
    return m;
  }, [textures]);

  const recentTextures = useMemo(
    () => recentIds.map((id) => textureMap.get(id)).filter(Boolean) as RugTexture[],
    [recentIds, textureMap]
  );

  const handleSelect = (tex: RugTexture) => {
    addRecent(tex.id);
    onTextureSelect(tex);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, texture: RugTexture) => {
    e.dataTransfer.setData(
      'application/x-patchwork-texture',
      JSON.stringify({ id: texture.id, name: texture.name, code: texture.code, imageUrl: texture.imageUrl, hex: texture.hex })
    );
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', texture.id);
    onTextureDragStart?.(texture);
  };

  const handleHover = (tex: RugTexture, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPreview({ tex, x: rect.right, y: rect.top + rect.height / 2 });
  };

  const handleHoverEnd = () => setPreview(null);

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Doku</span>
        <div className="flex gap-2 flex-wrap">
          {textures.slice(0, 8).map((tex, i) => (
            <button
              key={tex.id}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, tex)}
              onClick={() => handleSelect(tex)}
              onMouseEnter={(e) => handleHover(tex, e)}
              onMouseLeave={handleHoverEnd}
              className={cn(
                'w-10 h-10 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all',
                selectedTextureId === tex.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-primary/50'
              )}
              title={`${tex.name} (${tex.code})`}
            >
              <img
                src={tex.thumbnailUrl}
                alt={tex.name}
                className="w-full h-full object-cover"
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </button>
          ))}
        </div>
        {preview && <TexturePreviewPopup preview={preview} />}
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Halı dokuları</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Bir parça seçin, sonra buradan halı seçin.
      </p>

      <div className="panel-content space-y-4">
        {/* Recently used */}
        {recentTextures.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Son Kullanılanlar
              </h4>
              <span className="text-[10px] text-muted-foreground">{recentTextures.length} doku</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentTextures.map((tex) => (
                <TextureThumb
                  key={tex.id}
                  tex={tex}
                  isSelected={selectedTextureId === tex.id}
                  eager
                  onSelect={() => handleSelect(tex)}
                  onDragStart={(e) => handleDragStart(e, tex)}
                  onHover={handleHover}
                  onHoverEnd={handleHoverEnd}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.map(([category, items]) => {
          const isExpanded = expandedCategories.has(category);
          const hasMore = items.length > VISIBLE_COUNT;
          const visibleItems = isExpanded ? items : items.slice(0, VISIBLE_COUNT);
          const remainingCount = items.length - VISIBLE_COUNT;

          return (
            <div key={category}>
              {/* Sticky header — stays pinned while user scrolls through expanded textures */}
              <div className="flex items-center justify-between mb-2 sticky top-0 z-10 bg-card/95 backdrop-blur-sm -mx-1 px-1 py-1 rounded-lg">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {category}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{items.length} doku</span>
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary transition-colors touch-manipulation min-h-[28px] px-1.5 rounded-md hover:bg-muted/60"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span className="hidden sm:inline">Gizle</span>
                        </>
                      ) : (
                        <>
                          <span>+{remainingCount}</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {visibleItems.map((tex, idx) => (
                  <TextureThumb
                    key={tex.id}
                    tex={tex}
                    isSelected={selectedTextureId === tex.id}
                    eager={idx < VISIBLE_COUNT}
                    onSelect={() => handleSelect(tex)}
                    onDragStart={(e) => handleDragStart(e, tex)}
                    onHover={handleHover}
                    onHoverEnd={handleHoverEnd}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {preview && <TexturePreviewPopup preview={preview} />}
    </div>
  );
};
