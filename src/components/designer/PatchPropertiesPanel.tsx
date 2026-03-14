import React from 'react';
import { Patch } from '@/types/design';
import { GRID_UNIT_SIZE } from '@/constants/designer-defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Move, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PatchPropertiesPanelProps {
  patch: Patch | null;
  onResize: (width: number, height: number) => boolean;
  onDelete: () => void;
}

export const PatchPropertiesPanel: React.FC<PatchPropertiesPanelProps> = ({
  patch,
  onResize,
  onDelete,
}) => {
  if (!patch) {
    return (
      <div className="panel">
        <div className="panel-header">Parça Özellikleri</div>
        <div className="panel-content">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Parça seçilmedi</p>
            <p className="text-xs text-muted-foreground">
              Özelliklerini düzenlemek için alanda bir parça seçin
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleWidthChange = (delta: number) => {
    const newWidth = Math.max(1, patch.width + delta);
    onResize(newWidth, patch.height);
  };

  const handleHeightChange = (delta: number) => {
    const newHeight = Math.max(6, patch.height + delta);
    onResize(patch.width, newHeight);
  };

  const area = (patch.width * GRID_UNIT_SIZE) * (patch.height * GRID_UNIT_SIZE);

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <span>Parça Özellikleri</span>
        <Badge variant="outline" className="text-[10px] font-mono">
          {patch.id.slice(0, 6)}
        </Badge>
      </div>
      <div className="panel-content space-y-5">
        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Move className="w-3 h-3" />
            Konum
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] text-muted-foreground mb-1">X Konumu</p>
              <p className="text-sm font-mono font-semibold text-foreground">
                {(patch.x * GRID_UNIT_SIZE).toFixed(1)} cm
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Y Konumu</p>
              <p className="text-sm font-mono font-semibold text-foreground">
                {(patch.y * GRID_UNIT_SIZE).toFixed(1)} cm
              </p>
            </div>
          </div>
        </div>

        {/* Size controls */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boyutlar</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Genişlik</p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 rounded-lg"
                  onClick={() => handleWidthChange(-2)}
                  disabled={patch.width <= 2}
                >
                  −
                </Button>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    step={0.10}
                    min={0.10}
                    value={(patch.width * GRID_UNIT_SIZE).toFixed(2)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onResize(Math.max(2, Math.round(val / GRID_UNIT_SIZE)), patch.height);
                    }}
                    className="h-9 px-2 text-center font-mono text-sm pr-8 rounded-lg"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">m</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 rounded-lg"
                  onClick={() => handleWidthChange(2)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Yükseklik</p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 rounded-lg"
                  onClick={() => handleHeightChange(-2)}
                  disabled={patch.height <= 6}
                >
                  −
                </Button>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    step={0.10}
                    min={0.30}
                    value={(patch.height * GRID_UNIT_SIZE).toFixed(2)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onResize(patch.width, Math.max(6, Math.round(val / GRID_UNIT_SIZE)));
                    }}
                    className="h-9 px-2 text-center font-mono text-sm pr-8 rounded-lg"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">m</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 rounded-lg"
                  onClick={() => handleHeightChange(2)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground mb-1">Alan</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {area.toFixed(2)} m²
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full h-10 font-semibold"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Parçayı Sil
        </Button>
      </div>
    </div>
  );
};
