import { RugDesign } from '@/types/design';

const PENDING_DESIGN_KEY = 'patchwork_dizayn_pending_design';

export const savePendingDesign = (design: RugDesign): void => {
  try {
    localStorage.setItem(PENDING_DESIGN_KEY, JSON.stringify(design));
  } catch (error) {
    console.error('Failed to save pending design:', error);
  }
};

export const getPendingDesign = (): RugDesign | null => {
  try {
    const stored = localStorage.getItem(PENDING_DESIGN_KEY);
    if (stored) {
      return JSON.parse(stored) as RugDesign;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve pending design:', error);
    return null;
  }
};

export const clearPendingDesign = (): void => {
  try {
    localStorage.removeItem(PENDING_DESIGN_KEY);
  } catch (error) {
    console.error('Failed to clear pending design:', error);
  }
};

export const hasPendingDesign = (): boolean => {
  return localStorage.getItem(PENDING_DESIGN_KEY) !== null;
};
