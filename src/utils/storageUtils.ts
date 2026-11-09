import { BannerDocument } from '../types/banner';

const STORAGE_KEY_SAVED_DESIGNS = 'abs_saved_banner_designs_v1';
const STORAGE_KEY_FAVORITES = 'abs_favorite_templates_v1';

export interface SavedProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
  previewSvgSnippet?: string;
}

export function loadSavedDesigns(): BannerDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_DESIGNS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved designs from localStorage', e);
    return [];
  }
}

export function saveDesignToStorage(banner: BannerDocument): void {
  try {
    const existing = loadSavedDesigns();
    const updatedBanner = {
      ...banner,
      updatedAt: Date.now(),
    };
    const index = existing.findIndex((d) => d.id === banner.id);
    if (index >= 0) {
      existing[index] = updatedBanner;
    } else {
      existing.unshift(updatedBanner);
    }
    localStorage.setItem(STORAGE_KEY_SAVED_DESIGNS, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save design to localStorage', e);
  }
}

export function deleteDesignFromStorage(id: string): void {
  try {
    const existing = loadSavedDesigns();
    const filtered = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_DESIGNS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete design from localStorage', e);
  }
}

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleFavoriteInStorage(id: string): boolean {
  try {
    const favs = loadFavorites();
    const isFav = favs.includes(id);
    const updated = isFav ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    return !isFav;
  } catch {
    return false;
  }
}
