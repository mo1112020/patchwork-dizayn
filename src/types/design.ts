export interface Patch {
  id: string;
  x: number; // Grid position X
  y: number; // Grid position Y
  width: number; // Grid units
  height: number; // Grid units
  color: string; // Hex fallback for PDF/legacy
  textureId?: string; // Rug texture/photo id – when set, patch shows texture image
  shapeType: 'square' | 'rectangle';
  rotation: number; // in degrees
  isLocked?: boolean;
}

export interface DesignConstraints {
  lockRotation?: boolean; // 0, 90 only
  lockAspectRatio?: boolean;
  lockPosition?: boolean;
  lockWholeDesign?: boolean;
}

export interface DesignMetadata {
  clientName?: string;
  phoneNumber?: string;
  referenceNumber?: string;
  manufacturerNotes?: string;
  orientationMarker?: 'North' | 'South' | 'East' | 'West';
  /** Hex color for the "thread" / gap between rug patches (e.g. stitching or binding). */
  threadColor?: string;
}

export interface DesignSettings {
  wasteAllowance: number; // percentage (e.g., 5 for 5%)
  precisionTolerance: number; // in mm
}

export interface RugDesign {
  id?: string;
  userId?: string;
  name: string;
  width: number; // in m
  height: number; // in m
  patches: Patch[];
  totalArea: number; // in m²
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
  constraints: DesignConstraints;
  metadata: DesignMetadata;
  settings: DesignSettings;
}

/** Rug texture/photo – user drags these onto the canvas to build the design */
export interface RugTexture {
  id: string;
  name: string;
  code: string; // e.g. TX-001
  imageUrl: string; // path or URL to texture photo
  hex?: string; // for PDF swatch / fallback
  category?: string;
}

export type ToolMode = 'select' | 'add' | 'delete';

export interface DesignerState {
  design: RugDesign;
  selectedPatchId: string | null;
  selectedColor: string;
  toolMode: ToolMode;
  gridSize: number; // pixels per grid unit
  isModified: boolean;
}
