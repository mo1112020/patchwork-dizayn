import { useState, useCallback } from 'react';

const STORAGE_KEY = 'patchwork-recent-textures';
const MAX_RECENT = 10;

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function useRecentTextures() {
  const [recentIds, setRecentIds] = useState<string[]>(readFromStorage);

  const addRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      writeToStorage(next);
      return next;
    });
  }, []);

  return { recentIds, addRecent };
}
