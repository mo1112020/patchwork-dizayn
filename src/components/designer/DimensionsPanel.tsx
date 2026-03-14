import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GRID_UNIT_SIZE } from '@/constants/designer-defaults';

interface DimensionsPanelProps {
  width: number; // meters
  height: number; // meters
  totalArea: number;
  onDimensionsChange: (width: number, height: number) => void;
}

export const DimensionsPanel: React.FC<DimensionsPanelProps> = ({
  width,
  height,
  totalArea,
  onDimensionsChange,
}) => {
  // Display in cm
  const [localWidth, setLocalWidth] = useState(Math.round(width * 100).toString());
  const [localHeight, setLocalHeight] = useState(Math.round(height * 100).toString());

  useEffect(() => {
    setLocalWidth(Math.round(width * 100).toString());
    setLocalHeight(Math.round(height * 100).toString());
  }, [width, height]);

  const handleBlur = () => {
    let newWidthCm = parseInt(localWidth) || 50;
    let newHeightCm = parseInt(localHeight) || 50;

    // Constrain 50cm to 500cm
    newWidthCm = Math.max(50, Math.min(500, newWidthCm));
    newHeightCm = Math.max(50, Math.min(500, newHeightCm));

    // Round to nearest 5 cm (grid unit)
    newWidthCm = Math.round(newWidthCm / 5) * 5;
    newHeightCm = Math.round(newHeightCm / 5) * 5;

    setLocalWidth(newWidthCm.toString());
    setLocalHeight(newHeightCm.toString());

    const newWidthM = newWidthCm / 100;
    const newHeightM = newHeightCm / 100;

    if (newWidthM !== width || newHeightM !== height) {
      onDimensionsChange(newWidthM, newHeightM);
    }
  };

  const presetSizes = [
    { label: '120×170', width: 1.2, height: 1.7 },
    { label: '160×230', width: 1.6, height: 2.3 },
    { label: '200×300', width: 2, height: 3 },
    { label: '250×350', width: 2.5, height: 3.5 },
  ];

  return (
    <div className="panel">
      <div className="panel-header">Dimensions</div>
      <div className="panel-content space-y-4">
        <div className="space-y-2">
          <Label htmlFor="width" className="text-xs text-muted-foreground">
            Width (cm)
          </Label>
          <Input
            id="width"
            type="number"
            value={localWidth}
            onChange={(e) => setLocalWidth(e.target.value)}
            onBlur={handleBlur}
            className="input-precision"
            min={50}
            max={500}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-xs text-muted-foreground">
            Height (cm)
          </Label>
          <Input
            id="height"
            type="number"
            value={localHeight}
            onChange={(e) => setLocalHeight(e.target.value)}
            onBlur={handleBlur}
            className="input-precision"
            min={50}
            max={500}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Presets (cm)</p>
          <div className="grid grid-cols-2 gap-2">
            {presetSizes.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onDimensionsChange(preset.width, preset.height)}
                className="px-3 py-2 text-xs font-mono bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Total Area</span>
            <span className="font-mono text-lg font-semibold">
              {totalArea.toFixed(2)} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
