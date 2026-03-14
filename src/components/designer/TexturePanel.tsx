import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RugTexture } from '@/types/design';
import { ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface TexturePanelProps {
  textures: RugTexture[];
  selectedTextureId: string | null;
  onTextureSelect: (texture: RugTexture) => void;
  onTextureDragStart?: (texture: RugTexture) => void;
  orientation?: 'vertical' | 'horizontal';
}

const VISIBLE_COUNT = 4;

export const TexturePanel: React.FC<TexturePanelProps> = ({
  textures,
  selectedTextureId,
  onTextureSelect,
  onTextureDragStart,
  orientation = 'vertical',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const map = new Map<string, RugTexture[]>();
    textures.forEach((tex) => {
      const cat = tex.category || 'Genel';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(tex);
    });
    return Array.from(map.entries());
  }, [textures]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, texture: RugTexture) => {
    e.dataTransfer.setData('application/x-patchwork-texture', JSON.stringify({ id: texture.id, name: texture.name, code: texture.code, imageUrl: texture.imageUrl, hex: texture.hex }));
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', texture.id);
    onTextureDragStart?.(texture);
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Doku</span>
        <div className="flex gap-2 flex-wrap">
          {textures.slice(0, 8).map((tex) => (
            <button
              key={tex.id}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, tex)}
              onClick={() => onTextureSelect(tex)}
              className={cn(
                'w-10 h-10 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all',
                selectedTextureId === tex.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-primary/50'
              )}
              title={`${tex.name} (${tex.code})`}
            >
              <img src={tex.imageUrl} alt={tex.name} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </button>
          ))}
        </div>
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
        {categories.map(([category, items]) => {
          const isExpanded = expandedCategories.has(category);
          const hasMore = items.length > VISIBLE_COUNT;
          const visibleItems = isExpanded ? items : items.slice(0, VISIBLE_COUNT);
          const remainingCount = items.length - VISIBLE_COUNT;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {category}
                </h4>
                <span className="text-[10px] text-muted-foreground">{items.length} doku</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleItems.map((tex) => {
                  const isSelected = selectedTextureId === tex.id;
                  return (
                    <button
                      key={tex.id}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(e, tex)}
                      onClick={() => onTextureSelect(tex)}
                      className={cn(
                        'relative aspect-square w-16 h-16 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0',
                        isSelected ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border hover:border-primary/50 hover:shadow-sm'
                      )}
                      title={`${tex.name} (${tex.code})`}
                    >
                      <div className="absolute inset-0">
                        <img
                          src={tex.imageUrl}
                          alt={tex.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
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
                })}
                {hasMore && !isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <span className="text-sm font-bold">+{remainingCount}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>
              {hasMore && isExpanded && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-3 h-3" /> Daha az göster
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
