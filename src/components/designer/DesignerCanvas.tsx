import React, { useCallback, useMemo, useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Line, Text, Transformer, Image } from 'react-konva';
import { useLanguage } from '@/context/LanguageContext';
import { KonvaEventObject } from 'konva/lib/Node';
import { Patch, ToolMode, DesignConstraints, DesignMetadata } from '@/types/design';
import { CANVAS_GRID_SIZE, GRID_UNIT_SIZE } from '@/constants/designer-defaults';
import type { RugTexture } from '@/types/design';
import { textureImageGlobalCache, warmRugTextureThumbnail } from '@/hooks/useTextures';

const DEFAULT_CANVAS_GRID = CANVAS_GRID_SIZE;
const DEFAULT_GRID_UNIT = GRID_UNIT_SIZE;

/** 1D overlap: [a1, a2] and [b1, b2] overlap iff a1 < b2 && b1 < a2 */
function rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  return a1 < b2 && b1 < a2;
}

/** Build zigzag stitch points along a segment (blanket-stitch style). */
function zigzagPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stepPx: number,
  amplitudePx: number
): number[] {
  const isVertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const flat: number[] = [];
  if (isVertical) {
    const x = x1;
    const yStart = Math.min(y1, y2);
    const yEnd = Math.max(y1, y2);
    flat.push(x, yStart);
    let y = yStart + stepPx;
    let side = 1;
    while (y < yEnd) {
      flat.push(x + side * amplitudePx, y);
      y += stepPx;
      side *= -1;
    }
    flat.push(x, yEnd);
  } else {
    const y = y1;
    const xStart = Math.min(x1, x2);
    const xEnd = Math.max(x1, x2);
    flat.push(xStart, y);
    let x = xStart + stepPx;
    let side = 1;
    while (x < xEnd) {
      flat.push(x, y + side * amplitudePx);
      x += stepPx;
      side *= -1;
    }
    flat.push(xEnd, y);
  }
  return flat;
}

const ADJACENT_EPS = 0.01; // patches count as adjacent if edges are this close (grid units)

/** Shared edge in grid coords: vertical or horizontal segment between two adjacent patches. */
function getSharedEdges(patches: Patch[]): Array<{ gx1: number; gy1: number; gx2: number; gy2: number; vertical: boolean }> {
  const edges: Array<{ gx1: number; gy1: number; gx2: number; gy2: number; vertical: boolean }> = [];
  for (let i = 0; i < patches.length; i++) {
    const a = patches[i];
    const ax = a.x, ay = a.y, aw = a.width, ah = a.height;
    const aRight = ax + aw, aBottom = ay + ah;
    // Right edge of A: B's left edge touches A's right
    for (let j = 0; j < patches.length; j++) {
      if (i === j) continue;
      const b = patches[j];
      const bx = b.x, by = b.y, bw = b.width, bh = b.height;
      if (Math.abs(bx - aRight) <= ADJACENT_EPS && rangesOverlap(ay, ay + ah, by, by + bh)) {
        const gy1 = Math.max(ay, by);
        const gy2 = Math.min(ay + ah, by + bh);
        edges.push({ gx1: aRight, gy1, gx2: aRight, gy2, vertical: true });
      }
    }
    // Bottom edge of A: B's top edge touches A's bottom
    for (let j = 0; j < patches.length; j++) {
      if (i === j) continue;
      const b = patches[j];
      const bx = b.x, by = b.y, bw = b.width, bh = b.height;
      if (Math.abs(by - aBottom) <= ADJACENT_EPS && rangesOverlap(ax, ax + aw, bx, bx + bw)) {
        const gx1 = Math.max(ax, bx);
        const gx2 = Math.min(ax + aw, bx + bw);
        edges.push({ gx1, gy1: aBottom, gx2, gy2: aBottom, vertical: false });
      }
    }
  }
  return edges;
}

/** Axis-aligned bounding box of a rect at (x,y) with size (w,h) rotated around top-left by rotationDeg (degrees). */
function getRotatedAABB(
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
  const minX = x + Math.min(ax, bx, cx, dx);
  const maxX = x + Math.max(ax, bx, cx, dx);
  const minY = y + Math.min(ay, by, cy, dy);
  const maxY = y + Math.max(ay, by, cy, dy);
  return { minX, minY, maxX, maxY };
}

export interface DesignerCanvasRef {
  getDataURL: () => string;
}

interface DesignerCanvasProps {
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  patches: Patch[];
  selectedPatchId: string | null;
  selectedColor: string;
  selectedTextureId?: string | null;
  textures: RugTexture[];
  canvasGridSize?: number;
  gridUnitSize?: number;
  toolMode: ToolMode;
  constraints: DesignConstraints;
  metadata: DesignMetadata;
  threadColor?: string;
  showGrid?: boolean;
  showRulers?: boolean;
  isDraggingTexture?: boolean;
  onTextureDragEnd?: () => void;
  onPatchSelect: (id: string | null) => void;
  onPatchAdd: (x: number, y: number, width?: number, height?: number, textureId?: string) => void;
  onPatchMove: (id: string, x: number, y: number) => boolean;
  onPatchResize: (id: string, width: number, height: number) => boolean;
  onPatchRotate: (id: string, rotation: number) => void;
  onPatchDelete: (id: string) => void;
  updatePatch: (id: string, updates: Partial<Patch>) => Patch | null;
}

export const DesignerCanvas = forwardRef(function DesignerCanvas({
  width,
  height,
  gridWidth,
  gridHeight,
  patches,
  selectedPatchId,
  selectedColor,
  selectedTextureId,
  textures,
  canvasGridSize = DEFAULT_CANVAS_GRID,
  gridUnitSize = DEFAULT_GRID_UNIT,
  toolMode,
  constraints,
  metadata,
  threadColor = '#E8E4DC',
  showGrid = true,
  showRulers = true,
  isDraggingTexture = false,
  onTextureDragEnd,
  onPatchSelect,
  onPatchAdd,
  onPatchMove,
  onPatchResize,
  onPatchRotate,
  onPatchDelete,
  updatePatch,
}: DesignerCanvasProps, ref: React.Ref<DesignerCanvasRef>) {
  const { t } = useLanguage();
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoveredPatchId, setHoveredPatchId] = useState<string | null>(null);
  const [textureImageCache, setTextureImageCache] = useState<Record<string, HTMLImageElement>>({});
  const loadingThumbRef = useRef<Set<string>>(new Set());
  const loadingFullRef = useRef<Set<string>>(new Set());

  const neededTextureIds = useMemo(
    () => [...new Set(patches.map((p) => p.textureId).filter(Boolean))] as string[],
    [patches]
  );

  const textureById = useMemo(() => {
    const m = new Map<string, RugTexture>();
    textures.forEach((t) => m.set(t.id, t));
    return m;
  }, [textures]);

  /** Thumbnails from storage are 200×200; above this we treat the bitmap as already sharp enough. */
  const THUMB_MAX_NATURAL = 320;

  // Only load textures that appear on patches: small preview first, then full image in the background.
  useEffect(() => {
    if (!neededTextureIds.length) return;
    let cancelled = false;

    for (const id of loadingThumbRef.current) {
      if (!neededTextureIds.includes(id)) loadingThumbRef.current.delete(id);
    }
    for (const id of loadingFullRef.current) {
      if (!neededTextureIds.includes(id)) loadingFullRef.current.delete(id);
    }

    const mergeFromGlobal = () => {
      setTextureImageCache((prev) => {
        let next = prev;
        let changed = false;
        for (const tid of neededTextureIds) {
          const g = textureImageGlobalCache.get(tid);
          if (g && prev[tid] !== g) {
            if (!changed) {
              next = { ...prev };
              changed = true;
            }
            next[tid] = g;
          }
        }
        return changed ? next : prev;
      });
    };

    const startFullIfPreview = (tex: RugTexture, previewImg: HTMLImageElement) => {
      if (!tex.imageUrl || tex.thumbnailUrl === tex.imageUrl) return;
      if (previewImg.naturalWidth > THUMB_MAX_NATURAL && previewImg.naturalHeight > THUMB_MAX_NATURAL) return;
      if (loadingFullRef.current.has(tex.id)) return;
      loadingFullRef.current.add(tex.id);
      const full = new window.Image();
      full.crossOrigin = 'anonymous';
      full.onload = () => {
        loadingFullRef.current.delete(tex.id);
        if (cancelled) return;
        textureImageGlobalCache.set(tex.id, full);
        setTextureImageCache((p) => ({ ...p, [tex.id]: full }));
      };
      full.onerror = () => {
        loadingFullRef.current.delete(tex.id);
      };
      full.src = tex.imageUrl;
    };

    mergeFromGlobal();

    for (const id of neededTextureIds) {
      const tex = textureById.get(id);
      if (!tex?.imageUrl) continue;

      const cached = textureImageGlobalCache.get(id);
      if (cached) {
        startFullIfPreview(tex, cached);
        continue;
      }
      if (loadingThumbRef.current.has(id)) continue;

      const useThumbFirst = Boolean(tex.thumbnailUrl && tex.thumbnailUrl !== tex.imageUrl);
      const firstUrl = useThumbFirst ? tex.thumbnailUrl! : tex.imageUrl;

      loadingThumbRef.current.add(id);
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadingThumbRef.current.delete(id);
        if (cancelled) return;
        textureImageGlobalCache.set(id, img);
        setTextureImageCache((p) => ({ ...p, [id]: img }));
        startFullIfPreview(tex, img);
      };
      img.onerror = () => {
        loadingThumbRef.current.delete(id);
        if (useThumbFirst && tex.imageUrl) {
          loadingThumbRef.current.add(id);
          const fallback = new window.Image();
          fallback.crossOrigin = 'anonymous';
          fallback.onload = () => {
            loadingThumbRef.current.delete(id);
            if (cancelled) return;
            textureImageGlobalCache.set(id, fallback);
            setTextureImageCache((p) => ({ ...p, [id]: fallback }));
          };
          fallback.onerror = () => loadingThumbRef.current.delete(id);
          fallback.src = tex.imageUrl;
        }
      };
      img.src = firstUrl;
    }

    const interval = setInterval(() => {
      if (cancelled) return;
      mergeFromGlobal();
      for (const tid of neededTextureIds) {
        const tex = textureById.get(tid);
        const g = tex && textureImageGlobalCache.get(tid);
        if (tex && g) startFullIfPreview(tex, g);
      }
    }, 200);
    const stopInterval = setTimeout(() => clearInterval(interval), 12_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(stopInterval);
    };
  }, [neededTextureIds, textureById]);

  // When user drops a texture elsewhere or cancels drag, clear overlay
  useEffect(() => {
    if (!onTextureDragEnd) return;
    const handleDragEnd = () => onTextureDragEnd();
    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, [onTextureDragEnd]);

  // Stitch (ip) between adjacent pieces. Skip only horizontal stitches that form one continuous line across the design.
  const stitchData = useMemo(() => {
    const shared = getSharedEdges(patches);
    const fullWidthEps = 0.5;
    const yTol = 0.2;
    const horizontal = shared.filter((e) => !e.vertical);
    const vertical = shared.filter((e) => e.vertical);
    const byY = new Map<number, Array<{ gx1: number; gx2: number }>>();
    for (const { gx1, gy1, gx2 } of horizontal) {
      const yKey = Math.round(gy1 / yTol) * yTol;
      if (!byY.has(yKey)) byY.set(yKey, []);
      byY.get(yKey)!.push({ gx1, gx2 });
    }
    const skipY = new Set<number>();
    for (const [yKey, ranges] of byY) {
      const sorted = [...ranges].sort((a, b) => a.gx1 - b.gx1);
      let span = 0;
      let maxEnd = -Infinity;
      for (const { gx1, gx2 } of sorted) {
        const start = Math.max(maxEnd, gx1);
        const end = Math.max(maxEnd, gx2);
        if (end > maxEnd) span += end - start;
        maxEnd = Math.max(maxEnd, gx2);
      }
      if (span >= gridWidth - fullWidthEps) skipY.add(yKey);
    }
    const kept = [
      ...vertical,
      ...horizontal.filter((h) => !skipY.has(Math.round(h.gy1 / yTol) * yTol)),
    ];
    const stepPx = Math.max(5, Math.round(canvasGridSize * 0.18));
    const amplitudePx = Math.max(2, Math.round(canvasGridSize * 0.1));
    const bandHalfPx = Math.max(2, Math.round(canvasGridSize * 0.06));
    const ox = 50, oy = 50;
    return kept.map(({ gx1, gy1, gx2, gy2, vertical }) => {
      const px1 = ox + gx1 * canvasGridSize;
      const py1 = oy + gy1 * canvasGridSize;
      const px2 = ox + gx2 * canvasGridSize;
      const py2 = oy + gy2 * canvasGridSize;
      const zigzag = zigzagPoints(px1, py1, px2, py2, stepPx, amplitudePx);
      const band =
        vertical
          ? { x: px1 - bandHalfPx, y: py1, width: bandHalfPx * 2, height: py2 - py1 }
          : { x: px1, y: py1 - bandHalfPx, width: px2 - px1, height: bandHalfPx * 2 };
      return { zigzag, band };
    });
  }, [patches, canvasGridSize, gridWidth]);

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (stageRef.current) {
        const oldSelected = selectedPatchId;
        onPatchSelect(null);

        if (patches.length === 0) return '';

        const minX_grid = Math.min(...patches.map(p => p.x));
        const minY_grid = Math.min(...patches.map(p => p.y));
        const maxX_grid = Math.max(...patches.map(p => p.x + p.width));
        const maxY_grid = Math.max(...patches.map(p => p.y + p.height));

        const pixelX = minX_grid * canvasGridSize + 50;
        const pixelY = minY_grid * canvasGridSize + 50;
        const pixelW = (maxX_grid - minX_grid) * canvasGridSize;
        const pixelH = (maxY_grid - minY_grid) * canvasGridSize;

        const gridGroup = stageRef.current.findOne('.grid-ui');
        if (gridGroup) gridGroup.visible(false);

        const stage = stageRef.current;
        const allGroups = stage.find('Group');
        allGroups.forEach((group: any) => {
          const children = group.getChildren();
          children.forEach((child: any) => {
            if (child.className === 'Text' || child.className === 'Group') {
              child.visible(false);
            }
          });
        });

        const data = stageRef.current.toDataURL({
          pixelRatio: 3,
          x: (pixelX * scale) + offsetX,
          y: (pixelY * scale) + offsetY,
          width: pixelW * scale,
          height: pixelH * scale
        });

        if (gridGroup) gridGroup.visible(true);
        allGroups.forEach((group: any) => {
          const children = group.getChildren();
          children.forEach((child: any) => {
            child.visible(true);
          });
        });

        onPatchSelect(oldSelected);
        return data;
      }
      return '';
    },
  }));

  const selectedPatch = patches.find((p) => p.id === selectedPatchId);
  const canTransformPatch = selectedPatchId && selectedPatch && !selectedPatch.isLocked && !constraints.lockWholeDesign;

  useEffect(() => {
    if (transformerRef.current && canTransformPatch) {
      const stage = stageRef.current;
      const selectedNode = stage?.findOne('#group-' + selectedPatchId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedPatchId, patches, canTransformPatch]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dynamic Padding based on screen size: smaller padding on mobile to maximize canvas space
  const padding = window.innerWidth < 768 ? 16 : 40;

  // Rendered canvas inner bounding box (50 offset + width + 50 offset) for symmetric centering
  // We want the DESIGN AREA (width, height) to be centered.
  const designPixelWidth = width + 100;
  const designPixelHeight = height + 100;

  // Compute how scaling fits into the flex container area
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (containerSize.width > 0 && containerSize.height > 0) {
    const scaleX = (containerSize.width - padding * 2) / designPixelWidth;
    const scaleY = (containerSize.height - padding * 2) / designPixelHeight;
    scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

    // Center the designPixelWidth box inside container
    offsetX = (containerSize.width - designPixelWidth * scale) / 2;
    offsetY = (containerSize.height - designPixelHeight * scale) / 2;
  }

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);

  // Major line every 50 cm (e.g. 10 cells at 5 cm grid, 5 cells at 10 cm grid)
  const majorStep = Math.max(1, Math.round(0.5 / (gridUnitSize ?? 0.1)));
  const renderGrid = () => {
    if (!showGrid) return [];
    const lines = [];
    for (let i = 0; i <= gridWidth; i++) {
      lines.push(<Line key={`v-${i}`} points={[i * canvasGridSize, 0, i * canvasGridSize, height]} stroke="#DADADA" strokeWidth={i % majorStep === 0 ? 1 : 0.5} opacity={i % majorStep === 0 ? 0.3 : 0.1} listening={false} />);
    }
    for (let i = 0; i <= gridHeight; i++) {
      lines.push(<Line key={`h-${i}`} points={[0, i * canvasGridSize, width, i * canvasGridSize]} stroke="#DADADA" strokeWidth={i % majorStep === 0 ? 1 : 0.5} opacity={i % majorStep === 0 ? 0.3 : 0.1} listening={false} />);
    }
    return lines;
  };

  const renderRulers = () => {
    if (!showRulers) return [];
    const rulers = [];
    for (let i = 0; i <= gridWidth; i += 1) {
      const isMajor = i % majorStep === 0;
      rulers.push(
        <Line key={`rx-${i}`} points={[i * canvasGridSize, isMajor ? -15 : -8, i * canvasGridSize, 0]} stroke="#8E8A84" strokeWidth={1} opacity={0.5} />
      );
      if (i % majorStep === 0) {
        rulers.push(
          <Text key={`rtx-${i}`} x={i * canvasGridSize - 10} y={-28} text={`${Math.round(i * (gridUnitSize ?? 0.1) * 100)}cm`} fontSize={9} fill="#8E8A84" fontFamily="JetBrains Mono" />
        );
      }
    }
    for (let i = 0; i <= gridHeight; i += 1) {
      const isMajor = i % majorStep === 0;
      rulers.push(
        <Line key={`ry-${i}`} points={[isMajor ? -15 : -8, i * canvasGridSize, 0, i * canvasGridSize]} stroke="#8E8A84" strokeWidth={1} opacity={0.5} />
      );
      if (i % majorStep === 0) {
        rulers.push(
          <Text key={`rty-${i}`} x={-45} y={i * canvasGridSize - 5} text={`${Math.round(i * (gridUnitSize ?? 0.1) * 100)}cm`} fontSize={9} fill="#8E8A84" fontFamily="JetBrains Mono" />
        );
      }
    }
    return rulers;
  };

  const getGridPos = (stage: any) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const x = (pointer.x - offsetX) / scale - 50;
    const y = (pointer.y - offsetY) / scale - 50;
    return { x: x / canvasGridSize, y: y / canvasGridSize };
  };

  const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const isBackground = e.target === stage || e.target.name() === 'grid-background' || e.target.name() === 'main-area';

    if (isBackground && toolMode === 'add' && !constraints.lockWholeDesign) {
      const pos = getGridPos(stage);
      if (pos && pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y < gridHeight) {
        setIsDrawing(true);
        const snappedPos = { x: Math.floor(pos.x), y: Math.floor(pos.y) };
        setDrawingStart(snappedPos);
        setDrawingCurrent(snappedPos);
      }
    } else if (isBackground) {
      onPatchSelect(null);
    }
  }, [toolMode, onPatchSelect, offsetX, offsetY, scale, gridWidth, gridHeight, constraints.lockWholeDesign]);

  const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pos = getGridPos(stage);
    if (pos) {
      setDrawingCurrent({
        x: Math.max(0, Math.min(pos.x, gridWidth - 1)),
        y: Math.max(0, Math.min(pos.y, gridHeight - 1))
      });
    }
  }, [isDrawing, offsetX, offsetY, scale, gridWidth, gridHeight]);

  const handleStageMouseUp = useCallback(() => {
    if (isDrawing && drawingStart && drawingCurrent) {
      const x1 = Math.floor(drawingStart.x);
      const y1 = Math.floor(drawingStart.y);
      const x2 = Math.floor(drawingCurrent.x);
      const y2 = Math.floor(drawingCurrent.y);

      const minX = Math.max(0, Math.min(x1, x2));
      const minY = Math.max(0, Math.min(y1, y2));
      const maxX = Math.max(0, Math.min(Math.max(x1, x2), gridWidth - 1));
      const maxY = Math.max(0, Math.min(Math.max(y1, y2), gridHeight - 1));

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      onPatchAdd(minX, minY, w, h);
    }
    setIsDrawing(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
  }, [isDrawing, drawingStart, drawingCurrent, onPatchAdd, gridWidth, gridHeight]);

  const renderPatches = () => {
    // Render the selected patch last so its blue border and info labels always
    // paint on top of every other patch (Konva draws in array order).
    const sorted = selectedPatchId
      ? [...patches].sort((a, b) => a.id === selectedPatchId ? 1 : b.id === selectedPatchId ? -1 : 0)
      : patches;
    return sorted.map(patch => {
      const isSelected = patch.id === selectedPatchId;
      const isHovered = patch.id === hoveredPatchId;

      const px = patch.x * canvasGridSize + 50;
      const py = patch.y * canvasGridSize + 50;
      const pw = patch.width * canvasGridSize;
      const ph = patch.height * canvasGridSize;
      const designLeft = 50;
      const designTop = 50;
      const designRight = 50 + gridWidth * canvasGridSize;
      const designBottom = 50 + gridHeight * canvasGridSize;

      const realW = patch.width * gridUnitSize;
      const realH = patch.height * gridUnitSize;
      const area = realW * realH;

      const dragBoundFunc = (pos: { x: number; y: number }) => {
        const rot = patch.rotation || 0;
        let x = pos.x;
        let y = pos.y;
        if (rot === 0) {
          x = Math.max(designLeft, Math.min(x, designRight - pw));
          y = Math.max(designTop, Math.min(y, designBottom - ph));
          return { x, y };
        }
        const aabb = getRotatedAABB(x, y, pw, ph, rot);
        if (aabb.minX < designLeft) x += designLeft - aabb.minX;
        if (aabb.maxX > designRight) x += designRight - aabb.maxX;
        if (aabb.minY < designTop) y += designTop - aabb.minY;
        if (aabb.maxY > designBottom) y += designBottom - aabb.maxY;
        return { x, y };
      };

      return (
        <Group
          key={patch.id}
          id={'group-' + patch.id}
          x={px}
          y={py}
          width={pw}
          height={ph}
          rotation={patch.rotation || 0}
          draggable={!patch.isLocked && !constraints.lockPosition && !constraints.lockWholeDesign}
          dragBoundFunc={dragBoundFunc}
          onMouseEnter={() => setHoveredPatchId(patch.id)}
          onMouseLeave={() => setHoveredPatchId(null)}
          onDragStart={(e: any) => {
            onPatchSelect(patch.id);
            e.target.moveToTop();
          }}
          onDragMove={() => { }}
          onDragEnd={(e: any) => {
            const node = e.target;
            let gx = Math.floor((node.x() - 50) / canvasGridSize);
            let gy = Math.floor((node.y() - 50) / canvasGridSize);
            gx = Math.max(0, Math.min(gx, gridWidth - patch.width));
            gy = Math.max(0, Math.min(gy, gridHeight - patch.height));

            const result = updatePatch(patch.id, { x: gx, y: gy });
            // Sync node to actual position: nearest-free if moved, or snap back if rejected
            if (result) {
              node.position({ x: result.x * canvasGridSize + 50, y: result.y * canvasGridSize + 50 });
            } else {
              node.position({ x: patch.x * canvasGridSize + 50, y: patch.y * canvasGridSize + 50 });
            }
          }}
          onTransformEnd={(e: any) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            const newW = Math.round((node.width() * scaleX) / canvasGridSize);
            const newH = Math.round((node.height() * scaleY) / canvasGridSize);
            const newX = Math.floor((node.x() - 50) / canvasGridSize);
            const newY = Math.floor((node.y() - 50) / canvasGridSize);

            const clampedW = Math.max(1, Math.min(newW, gridWidth - newX));
            const clampedH = Math.max(1, Math.min(newH, gridHeight - newY));
            const clampedX = Math.max(0, Math.min(newX, gridWidth - clampedW));
            const clampedY = Math.max(0, Math.min(newY, gridHeight - clampedH));

            let result = updatePatch(patch.id, {
              x: clampedX,
              y: clampedY,
              width: clampedW,
              height: clampedH,
              rotation: node.rotation(),
            });

            // Reject if rotated patch would draw outside the design field
            if (result) {
              const rx = result.x * canvasGridSize + 50;
              const ry = result.y * canvasGridSize + 50;
              const rw = result.width * canvasGridSize;
              const rh = result.height * canvasGridSize;
              const aabb = getRotatedAABB(rx, ry, rw, rh, result.rotation ?? 0);
              const designLeft = 50;
              const designTop = 50;
              const designRight = 50 + gridWidth * canvasGridSize;
              const designBottom = 50 + gridHeight * canvasGridSize;
              if (
                aabb.minX < designLeft ||
                aabb.minY < designTop ||
                aabb.maxX > designRight ||
                aabb.maxY > designBottom
              ) {
                result = null;
                updatePatch(patch.id, {
                  x: patch.x,
                  y: patch.y,
                  width: patch.width,
                  height: patch.height,
                  rotation: patch.rotation ?? 0,
                });
              }
            }

            if (result) {
              node.position({ x: result.x * canvasGridSize + 50, y: result.y * canvasGridSize + 50 });
              node.width(result.width * canvasGridSize);
              node.height(result.height * canvasGridSize);
            } else {
              node.position({ x: patch.x * canvasGridSize + 50, y: patch.y * canvasGridSize + 50 });
              node.width(patch.width * canvasGridSize);
              node.height(patch.height * canvasGridSize);
              node.rotation(patch.rotation || 0);
            }
            node.scaleX(1);
            node.scaleY(1);
          }}
          onClick={(e: any) => {
            e.cancelBubble = true;
            if (toolMode === 'delete' && !patch.isLocked) onPatchDelete(patch.id);
            else onPatchSelect(patch.id);
          }}
          onTap={(e: any) => {
            e.cancelBubble = true;
            if (toolMode === 'delete' && !patch.isLocked) onPatchDelete(patch.id);
            else onPatchSelect(patch.id);
          }}
          onTouchStart={(e: any) => {
            // This ensures touch selection is prioritized over stage-level deselection
            e.cancelBubble = true;
          }}
        >
          {patch.textureId && textureImageCache[patch.textureId] ? (
            <Image
              image={textureImageCache[patch.textureId]}
              width={pw}
              height={ph}
              listening={false}
              cornerRadius={patch.shapeType === 'square' ? 2 : 0}
            />
          ) : (
            <Rect
              width={pw}
              height={ph}
              fill={patch.color}
              stroke="#D0CCC7"
              strokeWidth={1}
              listening={false}
              cornerRadius={patch.shapeType === 'square' ? 2 : 0}
            />
          )}
          <Rect
            width={pw}
            height={ph}
            fill="transparent"
            stroke={isSelected ? '#2563EB' : (isHovered ? '#D87C5A' : '#6B6762')}
            strokeWidth={isSelected ? 4 : 1.5}
            shadowColor={isSelected ? '#2563EB' : 'black'}
            shadowBlur={isSelected ? 12 : 2}
            shadowOpacity={isSelected ? 0.35 : 0.1}
            cornerRadius={patch.shapeType === 'square' ? 2 : 0}
            listening={true}
            onClick={(e: any) => {
              e.cancelBubble = true;
              if (toolMode === 'delete' && !patch.isLocked) onPatchDelete(patch.id);
              else onPatchSelect(patch.id);
            }}
            onTap={(e: any) => {
              e.cancelBubble = true;
              if (toolMode === 'delete' && !patch.isLocked) onPatchDelete(patch.id);
              else onPatchSelect(patch.id);
            }}
            onTouchStart={(e: any) => {
              e.cancelBubble = true;
            }}
          />
          {isSelected && (
            <>
              <Group x={pw / 2 - 32} y={8}>
                <Rect width={64} height={22} fill="#2563EB" cornerRadius={4} />
                <Text x={6} y={5} text={t('designer.selected')} fill="white" fontSize={11} fontFamily="sans-serif" fontWeight="bold" />
              </Group>
              <Group y={ph + 6}>
                <Rect width={90} height={36} fill="#2563EB" opacity={0.95} cornerRadius={4} />
                <Text x={6} y={6} text={`${Math.round(realW * 100)}×${Math.round(realH * 100)} cm`} fill="white" fontSize={9} fontFamily="JetBrains Mono" />
                <Text x={6} y={18} text={`${area.toFixed(2)} m² · ${t('designer.selectRugHint')}`} fill="rgba(255,255,255,0.9)" fontSize={8} fontFamily="sans-serif" />
              </Group>
            </>
          )}
          {(isHovered && !isSelected) && (
            <Group y={ph + 5}>
              <Rect
                width={70}
                height={30}
                fill="#1C1C1A"
                opacity={0.8}
                cornerRadius={4}
              />
              <Text x={5} y={5} text={`${Math.round(realW * 100)}×${Math.round(realH * 100)}cm`} fill="white" fontSize={8} fontFamily="JetBrains Mono" />
              <Text x={5} y={15} text={`${area.toFixed(2)} m²`} fill="#F2B84B" fontSize={8} fontFamily="JetBrains Mono" />
            </Group>
          )}
        </Group>
      );
    });
  };

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    let data: { id: string; hex?: string } | null = null;
    try {
      const raw = e.dataTransfer.getData('application/x-patchwork-texture');
      if (raw) data = JSON.parse(raw) as { id: string; hex?: string };
    } catch (_err) {
      const id = e.dataTransfer.getData('text/plain');
      if (id) data = { id };
    }
    if (!data?.id || !containerRef.current) {
      onTextureDragEnd?.();
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;
    const stageX = (dropX - offsetX) / scale - 50;
    const stageY = (dropY - offsetY) / scale - 50;
    const gridX = Math.floor(stageX / canvasGridSize);
    const gridY = Math.floor(stageY / canvasGridSize);

    const patchAt = patches.find(
      (p) =>
        gridX >= p.x &&
        gridX < p.x + p.width &&
        gridY >= p.y &&
        gridY < p.y + p.height
    );
    if (patchAt) {
      const tex = textures.find((t) => t.id === data!.id);
      if (tex) warmRugTextureThumbnail(tex);
      updatePatch(patchAt.id, { textureId: data.id, color: tex?.hex ?? data.hex ?? patchAt.color });
      onPatchSelect(patchAt.id);
    }
    onTextureDragEnd?.();
  }, [offsetX, offsetY, scale, patches, textures, updatePatch, onPatchSelect, onTextureDragEnd]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative bg-muted/5 md:rounded-2xl border-0 md:border border-border shadow-inner overflow-hidden"
      onDragOver={!isDraggingTexture ? handleContainerDragOver : undefined}
      onDrop={!isDraggingTexture ? handleContainerDrop : undefined}
    >
      {/* Drop overlay: when dragging a texture from the panel, this captures the drop anywhere on the design field */}
      {isDraggingTexture && (
        <div
          className="absolute inset-0 z-20 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center pointer-events-auto"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
        >
          <p className="text-sm font-medium text-muted-foreground bg-card/90 px-4 py-2 rounded-lg border border-border shadow-sm">
            Buraya bırakın – doku tasarım alanına eklenecek
          </p>
        </div>
      )}
      {/* Design Orientation Indicator */}
      {patches.length > 0 && metadata.orientationMarker && (
        <div className="absolute top-3 left-3 z-10 bg-card/80 backdrop-blur-md border border-border rounded-lg px-2 py-1 text-[10px] font-mono text-muted-foreground pointer-events-none select-none">
          ↑ {metadata.orientationMarker}
        </div>
      )}

      {containerSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={scale}
          scaleY={scale}
          x={offsetX}
          y={offsetY}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onTouchStart={handleStageMouseDown}
          onTouchMove={handleStageMouseMove}
          onTouchEnd={handleStageMouseUp}
          style={{ cursor: toolMode === 'add' ? 'crosshair' : toolMode === 'delete' ? 'not-allowed' : 'default' }}
        >
          <Layer>
            {/* Grid UI Group */}
            <Group name="grid-ui">
              {/* Background */}
              <Rect x={0} y={0} width={designPixelWidth} height={designPixelHeight} fill="transparent" name="grid-background" />

              {/* Design Area Background */}
              <Rect x={50} y={50} width={width} height={height} fill="white" name="main-area" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />

              {/* Grid */}
              <Group x={50} y={50}>
                {renderGrid()}
              </Group>

              {/* Rulers */}
              <Group x={50} y={50}>
                {renderRulers()}
              </Group>
            </Group>

            {/* Patches */}
            {renderPatches()}

            {/* Drawing Preview */}
            {isDrawing && drawingStart && drawingCurrent && (
              <Rect
                x={Math.min(drawingStart.x, drawingCurrent.x) * canvasGridSize + 50}
                y={Math.min(drawingStart.y, drawingCurrent.y) * canvasGridSize + 50}
                width={(Math.abs(drawingCurrent.x - drawingStart.x) + 1) * canvasGridSize}
                height={(Math.abs(drawingCurrent.y - drawingStart.y) + 1) * canvasGridSize}
                fill="rgba(212, 175, 55, 0.15)"
                stroke="#D4AF37"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}

            {/* Transformer: only for unlocked patches (template pieces are replace-only, no resize/move) */}
            {canTransformPatch && (
              <Transformer
                ref={transformerRef}
                rotateEnabled={!constraints.lockRotation}
                resizeEnabled={true}
                keepRatio={constraints.lockAspectRatio || false}
                enabledAnchors={constraints.lockAspectRatio ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : undefined}
                boundBoxFunc={(oldBox, newBox) => {
                  const designLeft = 50;
                  const designTop = 50;
                  const designRight = 50 + gridWidth * canvasGridSize;
                  const designBottom = 50 + gridHeight * canvasGridSize;
                  const minSize = canvasGridSize;
                  let w = Math.max(minSize, Math.min(newBox.width, designRight - designLeft));
                  let h = Math.max(minSize, Math.min(newBox.height, designBottom - designTop));
                  let x = Math.max(designLeft, Math.min(newBox.x, designRight - w));
                  let y = Math.max(designTop, Math.min(newBox.y, designBottom - h));
                  return { ...newBox, x, y, width: w, height: h };
                }}
              />
            )}
          </Layer>

          {/* Stitches on a separate layer so they always draw on top of rugs */}
          <Layer listening={false}>
            <Group name="stitches">
              {stitchData.map(({ zigzag, band }, idx) => {
                const strokeW = Math.max(1.5, Math.round(canvasGridSize * 0.05));
                if (zigzag.length < 4) return null;
                return (
                  <React.Fragment key={`stitch-${idx}`}>
                    <Rect x={band.x} y={band.y} width={band.width} height={band.height} fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                    <Rect x={band.x} y={band.y} width={band.width} height={band.height} fill={threadColor} />
                    <Line points={zigzag} stroke="rgba(0,0,0,0.35)" strokeWidth={strokeW + 1} lineCap="round" lineJoin="round" />
                    <Line points={zigzag} stroke={threadColor} strokeWidth={strokeW} lineCap="round" lineJoin="round" />
                  </React.Fragment>
                );
              })}
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
});
