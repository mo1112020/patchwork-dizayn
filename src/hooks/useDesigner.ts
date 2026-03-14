import { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Patch, RugDesign, ToolMode, DesignerState, DesignConstraints, DesignMetadata, DesignSettings } from '@/types/design';
import {
  PRICE_PER_SQM,
  DEFAULT_RUG_WIDTH,
  DEFAULT_RUG_HEIGHT,
  GRID_UNIT_SIZE,
  CANVAS_GRID_SIZE,
  DEFAULT_WASTE_ALLOWANCE,
  DEFAULT_PRECISION_TOLERANCE
} from '@/constants/designer-defaults';
import { useTextures } from '@/hooks/useTextures';
import { useDesignerSettings } from '@/hooks/useDesignerSettings';
import { useLanguage } from '@/context/LanguageContext';

/** Axis-aligned bounding box of a rect in grid coords with rotation (degrees) around top-left. */
function getPatchAABB(
  x: number,
  y: number,
  w: number,
  h: number,
  rotationDeg: number
): { minX: number; minY: number; maxX: number; maxY: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const ax = 0,
    ay = 0;
  const bx = w * c,
    by = w * s;
  const cx = w * c - h * s,
    cy = w * s + h * c;
  const dx = -h * s,
    dy = h * c;
  return {
    minX: x + Math.min(ax, bx, cx, dx),
    maxX: x + Math.max(ax, bx, cx, dx),
    minY: y + Math.min(ay, by, cy, dy),
    maxY: y + Math.max(ay, by, cy, dy),
  };
}

const aabbOverlap = (
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number }
): boolean =>
  !(a.maxX <= b.minX || b.maxX <= a.minX || a.maxY <= b.minY || b.maxY <= a.minY);

/** Collision using rotated AABBs so rotated patches cannot overlap. */
const checkCollision = (p1: Partial<Patch>, p2: Patch): boolean => {
  const rot1 = p1.rotation ?? 0;
  const rot2 = p2.rotation ?? 0;
  const aabb1 = getPatchAABB(p1.x!, p1.y!, p1.width!, p1.height!, rot1);
  const aabb2 = getPatchAABB(p2.x, p2.y, p2.width, p2.height, rot2);
  return aabbOverlap(aabb1, aabb2);
};

/** Find nearest grid position where a patch of size (w, h) and optional rotation does not overlap any of `patches` (excluding `excludeId`). */
function findNearestFreePosition(
  patches: Patch[],
  excludeId: string | null,
  preferredX: number,
  preferredY: number,
  w: number,
  h: number,
  gridWidth: number,
  gridHeight: number,
  rotationDeg = 0
): { x: number; y: number } | null {
  const others = patches.filter(p => p.id !== excludeId);

  const aabbAtOrigin = getPatchAABB(0, 0, w, h, rotationDeg);
  const minNx = -aabbAtOrigin.minX;
  const maxNx = gridWidth - aabbAtOrigin.maxX;
  const minNy = -aabbAtOrigin.minY;
  const maxNy = gridHeight - aabbAtOrigin.maxY;
  if (minNx > maxNx || minNy > maxNy) return null;

  const tryAt = (x: number, y: number) => {
    const nx = Math.max(minNx, Math.min(x, maxNx));
    const ny = Math.max(minNy, Math.min(y, maxNy));
    const candidateAABB = getPatchAABB(nx, ny, w, h, rotationDeg);
    const collides = others.some(p => {
      const otherAABB = getPatchAABB(p.x, p.y, p.width, p.height, p.rotation ?? 0);
      return aabbOverlap(candidateAABB, otherAABB);
    });
    return !collides ? { x: nx, y: ny } : null;
  };

  const r = tryAt(preferredX, preferredY);
  if (r) return r;

  const maxRadius = Math.max(gridWidth, gridHeight);
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const r2 = tryAt(preferredX + dx, preferredY + dy);
        if (r2) return r2;
      }
    }
  }
  return null;
}

const createInitialDesign = (
  name = 'İsimsiz Halı',
  width = DEFAULT_RUG_WIDTH,
  height = DEFAULT_RUG_HEIGHT,
  pricePerSqm = PRICE_PER_SQM,
  wasteAllowance = DEFAULT_WASTE_ALLOWANCE,
  precisionTolerance = DEFAULT_PRECISION_TOLERANCE
): RugDesign => ({
  name,
  width,
  height,
  patches: [],
  totalArea: width * height,
  totalPrice: (width * height) * pricePerSqm,
  constraints: {
    lockRotation: false,
    lockAspectRatio: false,
    lockPosition: false,
    lockWholeDesign: false,
  },
  metadata: {
    clientName: '',
    referenceNumber: '',
    manufacturerNotes: '',
    orientationMarker: 'North',
    threadColor: '#E8E4DC',
  },
  settings: {
    wasteAllowance,
    precisionTolerance,
  },
});

export const useDesigner = () => {
  const { textures } = useTextures();
  const { settings: designerSettings } = useDesignerSettings();
  const { t } = useLanguage();
  const defaultDesignName = t('designerSetup.unnamedRug');
  const [design, setDesign] = useState<RugDesign>(() => createInitialDesign(
    defaultDesignName,
    designerSettings.default_rug_width,
    designerSettings.default_rug_height,
    designerSettings.price_per_sqm,
    designerSettings.waste_allowance,
    designerSettings.precision_tolerance
  ));
  const [history, setHistory] = useState<RugDesign[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);
  const [selectedTextureId, setSelectedTextureId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [isModified, setIsModified] = useState(false);

  const gridUnitSize = designerSettings.grid_unit_size;
  const canvasGridSize = designerSettings.canvas_grid_size;

  // Push to history when design changes
  const pushToHistory = useCallback((newDesign: RugDesign) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newDesign].slice(-50); // Keep last 50
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setDesign(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setDesign(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Initial history push
  useEffect(() => {
    if (history.length === 0) {
      setHistory([design]);
      setHistoryIndex(0);
    }
  }, []);

  // Grid dimensions in grid units
  const gridWidth = useMemo(() => Math.floor(design.width / gridUnitSize), [design.width, gridUnitSize]);
  const gridHeight = useMemo(() => Math.floor(design.height / gridUnitSize), [design.height, gridUnitSize]);

  // Canvas dimensions in pixels
  const canvasWidth = useMemo(() => gridWidth * canvasGridSize, [gridWidth, canvasGridSize]);
  const canvasHeight = useMemo(() => gridHeight * canvasGridSize, [gridHeight, canvasGridSize]);

  // Calculate total area and price
  const calculateTotals = useCallback((width: number, height: number) => {
    const areaInSqM = width * height;
    return {
      totalArea: areaInSqM,
      totalPrice: areaInSqM * designerSettings.price_per_sqm,
    };
  }, [designerSettings.price_per_sqm]);

  const updateDesign = useCallback((updates: Partial<RugDesign>) => {
    setDesign(prev => {
      const newDesign = { ...prev, ...updates };
      if (updates.width !== undefined || updates.height !== undefined) {
        const w = newDesign.width;
        const h = newDesign.height;
        newDesign.totalArea = w * h;
        newDesign.totalPrice = (w * h) * designerSettings.price_per_sqm;
      }
      pushToHistory(newDesign);
      return newDesign;
    });
    setIsModified(true);
  }, [pushToHistory, designerSettings.price_per_sqm]);

  const updateConstraints = useCallback((constraints: Partial<DesignConstraints>) => {
    updateDesign({ constraints: { ...design.constraints, ...constraints } });
  }, [design.constraints, updateDesign]);

  const updateMetadata = useCallback((metadata: Partial<DesignMetadata>) => {
    updateDesign({ metadata: { ...design.metadata, ...metadata } });
  }, [design.metadata, updateDesign]);

  const updateSettings = useCallback((settings: Partial<DesignSettings>) => {
    updateDesign({ settings: { ...design.settings, ...settings } });
  }, [design.settings, updateDesign]);

  const addPatch = useCallback((gridX: number, gridY: number, width = 2, height = 6, textureId?: string) => {
    if (design.constraints.lockWholeDesign) return;

    const tid = textureId ?? selectedTextureId ?? textures[0]?.id;
    const texture = textures.find(t => t.id === tid);
    const shapeType: Patch['shapeType'] = width === height ? 'square' : 'rectangle';
    const newPatch: Patch = {
      id: uuidv4(),
      x: gridX,
      y: gridY,
      width,
      height,
      color: texture?.hex ?? '#E5E5E5',
      textureId: tid ?? undefined,
      shapeType,
      rotation: 0,
      isLocked: false,
    };

    let placeX = gridX;
    let placeY = gridY;
    const collides = design.patches.some(p => checkCollision(newPatch, p));
    if (collides) {
      const free = findNearestFreePosition(design.patches, null, gridX, gridY, width, height, gridWidth, gridHeight);
      if (!free) return; // no space anywhere
      placeX = free.x;
      placeY = free.y;
    }

    const patchToAdd: Patch = { ...newPatch, x: placeX, y: placeY };
    updateDesign({ patches: [...design.patches, patchToAdd] });
    setSelectedPatchId(patchToAdd.id);
    setToolMode('select');
    return patchToAdd;
  }, [design.patches, design.constraints.lockWholeDesign, selectedTextureId, textures, updateDesign, gridWidth, gridHeight]);

  const updatePatch = useCallback((patchId: string, updates: Partial<Patch>): Patch | null => {
    if (design.constraints.lockWholeDesign) return null;

    const patch = design.patches.find(p => p.id === patchId);
    if (!patch) return null;

    if (patch.isLocked) {
      const allowed: Partial<Patch> = {};
      if (updates.textureId !== undefined) allowed.textureId = updates.textureId;
      if (updates.color !== undefined) allowed.color = updates.color;
      if (Object.keys(allowed).length === 0) return null;
      const updatedPatches = design.patches.map(p =>
        p.id !== patchId ? p : { ...p, ...allowed }
      );
      updateDesign({ patches: updatedPatches });
      return { ...patch, ...allowed };
    }

    // Apply constraints
    if (design.constraints.lockRotation && updates.rotation !== undefined) {
      updates.rotation = Math.round(updates.rotation / 90) * 90;
    }

    if (design.constraints.lockAspectRatio && (updates.width !== undefined || updates.height !== undefined)) {
      const ratio = patch.width / patch.height;
      if (updates.width !== undefined) updates.height = Math.round(updates.width / ratio);
      else if (updates.height !== undefined) updates.width = Math.round(updates.height * ratio);
    }

    if (design.constraints.lockPosition) {
      delete updates.x;
      delete updates.y;
    }

    let appliedPatch: Patch | null = null;
    const updatedPatches = design.patches.map(p => {
      if (p.id !== patchId) return p;

      const updated = { ...p, ...updates };

      // Strict boundary clamping: clamp position first, then size so patch never leaves the grid
      const finalX = Math.max(0, Math.min(updated.x, gridWidth - 1));
      const finalY = Math.max(0, Math.min(updated.y, gridHeight - 1));
      const finalWidth = Math.max(1, Math.min(updated.width, gridWidth - finalX));
      const finalHeight = Math.max(1, Math.min(updated.height, gridHeight - finalY));

      const finalPatch = {
        ...updated,
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight
      };

      // Patches never overlap: if move would collide, place at nearest free position
      const isColliding = design.patches.some(other =>
        other.id !== patchId && checkCollision(finalPatch, other)
      );

      if (!isColliding) {
        appliedPatch = finalPatch;
        return finalPatch;
      }
      const rotation = updated.rotation ?? patch.rotation ?? 0;
      const free = findNearestFreePosition(
        design.patches, patchId, finalX, finalY, finalWidth, finalHeight, gridWidth, gridHeight,
        rotation
      );
      if (free) {
        appliedPatch = { ...finalPatch, x: free.x, y: free.y };
        return appliedPatch;
      }
      return p; // no free position: keep current
    });

    updateDesign({ patches: updatedPatches });
    return appliedPatch;
  }, [design.patches, design.constraints, updateDesign, gridWidth, gridHeight]);

  const movePatch = useCallback((patchId: string, newX: number, newY: number) => {
    updatePatch(patchId, { x: newX, y: newY });
    return true;
  }, [updatePatch]);

  const resizePatch = useCallback((patchId: string, newWidth: number, newHeight: number) => {
    updatePatch(patchId, { width: newWidth, height: newHeight });
    return true;
  }, [updatePatch]);

  const deletePatch = useCallback((patchId: string) => {
    if (design.constraints.lockWholeDesign) return;
    const patch = design.patches.find(p => p.id === patchId);
    if (patch?.isLocked) return;

    updateDesign({ patches: design.patches.filter(p => p.id !== patchId) });
    if (selectedPatchId === patchId) setSelectedPatchId(null);
  }, [design.patches, design.constraints.lockWholeDesign, selectedPatchId, updateDesign]);

  const clearPatches = useCallback(() => {
    if (design.constraints.lockWholeDesign) return;
    updateDesign({ patches: [] });
    setSelectedPatchId(null);
  }, [design.constraints.lockWholeDesign, updateDesign]);

  /** Clear rug pictures from all patches; keeps the template layout, only removes texture assignment. */
  const clearPatchTextures = useCallback(() => {
    if (design.constraints.lockWholeDesign) return;
    const EMPTY_COLOR = '#E8E6E3';
    const cleared = design.patches.map((p) => ({
      ...p,
      textureId: undefined,
      color: EMPTY_COLOR,
    }));
    updateDesign({ patches: cleared });
  }, [design.patches, design.constraints.lockWholeDesign, updateDesign]);

  /**
   * Column count by total rug width (cm):
   * - 80–110 → 3 columns
   * - 120–200 → 4 columns  
   * - 210–250 → 5 columns
   * - 260–300 → 6 columns
   * Pattern: starts at 3 columns for 80cm, +1 column per ~50cm increase.
   *
   * Patch heights: 30–70cm range, scaled by rug height.
   * Smaller rugs → smaller patches; larger rugs → mix of big and small.
   */
  const getColumnCount = useCallback((widthCm: number): number => {
    if (widthCm < 80) return Math.max(2, Math.round(widthCm / 30));
    if (widthCm <= 110) return 3;
    if (widthCm <= 200) return 4;
    if (widthCm <= 250) return 5;
    if (widthCm <= 300) return 6;
    // Beyond 300cm: continue the pattern (+1 col per 50cm)
    return 6 + Math.floor((widthCm - 300) / 50);
  }, []);

  const getStripTemplatePatches = useCallback((widthM: number, heightM: number): { patches: Patch[]; effectiveWidthM: number } => {
    const widthCm = Math.round(widthM * 100);
    const heightCm = Math.round(heightM * 100);
    const gh = Math.floor(heightM / gridUnitSize);
    const cmToGrid = (cm: number) => Math.max(1, Math.round(cm / (gridUnitSize * 100)));

    /** No patch height may be below 30 cm (user requirement: never 10 or 20 cm heights). */
    const MIN_PATCH_HEIGHT_CM = 30;
    const minGridH = cmToGrid(MIN_PATCH_HEIGHT_CM);

    const numColumns = getColumnCount(widthCm);
    const colWidthCm = Math.floor(widthCm / numColumns);
    const effectiveWidthCm = colWidthCm * numColumns;
    const effectiveWidthM = effectiveWidthCm / 100;
    const colWidthGrid = cmToGrid(colWidthCm);

    // Patch height range: min is always 30 cm; max scales linearly with rug height.
    // Reference: a 300 cm rug gets max 80 cm patches. Below 300 cm the max shrinks
    // proportionally down to 40 cm floor, so short rugs never get oversized pieces.
    // Range: 30–40 cm for ~100 cm rugs, 30–80 cm for 300+ cm rugs.
    const effectiveMinCm = MIN_PATCH_HEIGHT_CM; // always 30 cm
    const effectiveMaxCm = Math.round(Math.min(80, Math.max(40, (80 * heightCm) / 300)));

    const minH = Math.max(minGridH, cmToGrid(effectiveMinCm));
    const maxH = Math.max(minH + 1, cmToGrid(effectiveMaxCm));

    const EMPTY_COLOR = '#E8E6E3';
    const patches: Patch[] = [];

    /**
     * Generate a column of patch heights that fills `gh` grid units,
     * where NO internal seam position overlaps with `forbiddenSeams`.
     * Retries up to 100 times with random variations; falls back to offset strategy.
     */
    const generateColumn = (forbiddenSeams: Set<number>): number[] => {
      const randIn = (lo: number, hi: number) => Math.floor(lo + Math.random() * (hi - lo + 1));

      // Try random generation up to 100 times
      for (let attempt = 0; attempt < 100; attempt++) {
        const heights: number[] = [];
        let y = 0;
        let valid = true;

        while (y < gh) {
          const remaining = gh - y;
          if (remaining <= 0) break;

          // If remaining fits in one patch, use it only if it's at least minGridH (30 cm)
          if (remaining <= maxH) {
            if (remaining >= minGridH) {
              heights.push(remaining);
              y += remaining;
              break;
            }
            // Remainder smaller than 30 cm: merge into previous patch (no 10/20 cm pieces)
            if (heights.length > 0) {
              heights[heights.length - 1] += remaining;
              y += remaining;
              break;
            }
            heights.push(remaining);
            y += remaining;
            break;
          }

          let h = randIn(minH, maxH);
          h = Math.min(h, remaining);

          // If this is the first item in the column and it's less than minGridH
          if (heights.length === 0 && h < minGridH) {
            h = Math.min(minGridH, remaining);
          } else if (h < minGridH && heights.length > 0) {
            // Merge into previous instead of creating a tiny 10/20cm piece
            heights[heights.length - 1] += h;
            y += h;
            continue;
          }

          // Check if this seam is forbidden
          if (forbiddenSeams.has(y + h)) {
            // Try all possible heights to find one that doesn't conflict
            let found = false;
            const candidates = [];
            for (let ch = minH; ch <= Math.min(maxH, remaining); ch++) {
              if (!forbiddenSeams.has(y + ch) || y + ch === gh) {
                candidates.push(ch);
              }
            }
            if (candidates.length > 0) {
              h = candidates[Math.floor(Math.random() * candidates.length)];
              found = true;
            }
            if (!found) {
              valid = false;
              break;
            }
          }

          heights.push(h);
          y += h;
        }

        if (valid && y === gh) {
          // Verify ALL internal seams are clear
          let allClear = true;
          let checkY = 0;
          for (let i = 0; i < heights.length - 1; i++) {
            checkY += heights[i];
            if (forbiddenSeams.has(checkY)) {
              allClear = false;
              break;
            }
          }
          if (allClear) return heights;
        }
      }

      // Fallback: deterministic offset approach – shift all seams by 1 grid unit from forbidden
      const heights: number[] = [];
      let y = 0;
      while (y < gh) {
        const remaining = gh - y;
        if (remaining <= maxH) {
          if (remaining >= minGridH) {
            heights.push(remaining);
          } else if (heights.length > 0) {
            heights[heights.length - 1] += remaining;
          } else {
            heights.push(remaining);
          }
          break;
        }
        // Pick a height, starting from midpoint of range
        let bestH = Math.floor((minH + maxH) / 2);
        for (let offset = 0; offset <= maxH - minH; offset++) {
          const tryH = bestH + offset;
          if (tryH >= minH && tryH <= Math.min(maxH, remaining) && !forbiddenSeams.has(y + tryH)) {
            bestH = tryH;
            break;
          }
          const tryH2 = bestH - offset;
          if (tryH2 >= minH && tryH2 <= Math.min(maxH, remaining) && !forbiddenSeams.has(y + tryH2)) {
            bestH = tryH2;
            break;
          }
        }
        const nextH = Math.min(bestH, remaining);
        let added: number;
        if (nextH < minGridH && heights.length > 0) {
          heights[heights.length - 1] += nextH;
          added = nextH;
        } else {
          added = nextH >= minGridH ? nextH : Math.min(minGridH, remaining);
          heights.push(added);
        }
        y += added;
      }
      return heights;
    };

    // Build columns left to right; each column avoids seams of BOTH adjacent columns
    const allColumnSeams: Set<number>[] = [];
    const allColumnHeights: number[][] = [];

    for (let col = 0; col < numColumns; col++) {
      // Forbidden = seams from the immediately previous column (adjacent)
      const forbidden = new Set<number>();
      if (col > 0) {
        allColumnSeams[col - 1].forEach(s => forbidden.add(s));
      }

      const heights = generateColumn(forbidden);
      allColumnHeights.push(heights);

      // Record this column's internal seams (not top=0 or bottom=gh)
      const seamSet = new Set<number>();
      let y = 0;
      for (let i = 0; i < heights.length - 1; i++) {
        y += heights[i];
        seamSet.add(y);
      }
      allColumnSeams.push(seamSet);
    }

    // Convert to patches
    let xGrid = 0;
    for (let col = 0; col < numColumns; col++) {
      const w = colWidthGrid;
      let y = 0;
      for (const h of allColumnHeights[col]) {
        patches.push({
          id: uuidv4(),
          x: xGrid,
          y,
          width: w,
          height: h,
          color: EMPTY_COLOR,
          textureId: undefined,
          shapeType: w === h ? 'square' : 'rectangle',
          rotation: 0,
          isLocked: true,
        });
        y += h;
      }
      xGrid += w;
    }
    return { patches, effectiveWidthM };
  }, [gridUnitSize, getColumnCount]);

  /** Apply the strip template. Column widths: 2 cols under 120 cm (split in half to 5 cm), else 40 cm each. */
  const applyStripTemplate = useCallback(() => {
    if (design.constraints.lockWholeDesign) return;
    const { patches, effectiveWidthM } = getStripTemplatePatches(design.width, design.height);
    updateDesign({ patches, width: effectiveWidthM });
    setSelectedPatchId(null);
  }, [design.constraints.lockWholeDesign, design.width, design.height, getStripTemplatePatches, updateDesign]);

  const resetDesign = useCallback((name?: string, width?: number, height?: number) => {
    const w = width ?? designerSettings.default_rug_width;
    const h = height ?? designerSettings.default_rug_height;
    const initial = createInitialDesign(
      name ?? defaultDesignName,
      w,
      h,
      designerSettings.price_per_sqm,
      designerSettings.waste_allowance,
      designerSettings.precision_tolerance
    );
    setDesign(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    setSelectedPatchId(null);
    setIsModified(false);
  }, [designerSettings, defaultDesignName]);

  const selectedPatch = useMemo(() => {
    return design.patches.find(p => p.id === selectedPatchId) || null;
  }, [design.patches, selectedPatchId]);

  const textureStats = useMemo(() => {
    const stats = new Map<string, { count: number; area: number }>();
    design.patches.forEach(patch => {
      const key = patch.textureId ?? patch.color;
      const patchArea = (patch.width * gridUnitSize) * (patch.height * gridUnitSize);
      const existing = stats.get(key) ?? { count: 0, area: 0 };
      stats.set(key, {
        count: existing.count + 1,
        area: existing.area + patchArea,
      });
    });
    return stats;
  }, [design.patches, gridUnitSize]);

  const textureStatsWithDetails = useMemo(() => {
    const stats = new Map<string, { count: number; area: number; code: string; name: string; hex: string }>();
    design.patches.forEach(patch => {
      const tex = patch.textureId ? textures.find(t => t.id === patch.textureId) : null;
      const name = tex?.name ?? 'Custom';
      const code = tex?.code ?? 'N/A';
      const hex = tex?.hex ?? patch.color;
      const key = patch.textureId ?? patch.color;
      const existing = stats.get(key) ?? { count: 0, area: 0, code, name, hex };
      const patchArea = (patch.width * gridUnitSize) * (patch.height * gridUnitSize);
      stats.set(key, {
        count: existing.count + 1,
        area: existing.area + patchArea,
        code: existing.code,
        name: existing.name,
        hex: existing.hex,
      });
    });
    return stats;
  }, [design.patches, textures, gridUnitSize]);

  return {
    design,
    selectedPatchId,
    selectedPatch,
    selectedTextureId,
    selectedColor: textures.find(t => t.id === selectedTextureId)?.hex ?? '#E5E5E5',
    toolMode,
    isModified,
    gridWidth,
    gridHeight,
    canvasWidth,
    canvasHeight,
    gridUnitSize,
    canvasGridSize,
    textureStatsWithDetails,
    textureStats,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    setSelectedPatchId,
    setSelectedTextureId,
    setToolMode,
    updateDesign,
    updateConstraints,
    updateMetadata,
    updateSettings,
    addPatch,
    updatePatch,
    movePatch,
    resizePatch,
    deletePatch,
    clearPatches,
    clearPatchTextures,
    resetDesign,
    applyStripTemplate,
    getStripTemplatePatches,
    setDesign,
    undo,
    redo,
  };
};
