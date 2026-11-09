export interface ColorPalette {
  id: string;
  name: string;
  category: 'vibrant' | 'luxury' | 'minimal' | 'dark' | 'pastel';
  colors: string[]; // 4-5 hex colors
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'deep-space-blue',
    name: 'Deep Navy & Cyan',
    category: 'dark',
    colors: ['#03071e', '#0a1931', '#1d4ed8', '#38bdf8', '#ffffff'],
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    category: 'luxury',
    colors: ['#130224', '#3b0764', '#7e22ce', '#c084fc', '#f3e8ff'],
  },
  {
    id: 'sunset-amber',
    name: 'Sunset & Gold',
    category: 'vibrant',
    colors: ['#450a0a', '#991b1b', '#ea580c', '#f59e0b', '#fef08a'],
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald & Gold',
    category: 'luxury',
    colors: ['#052e16', '#14532d', '#15803d', '#ca8a04', '#fef08a'],
  },
  {
    id: 'magenta-dream',
    name: 'Neon Magenta',
    category: 'vibrant',
    colors: ['#2e0854', '#831843', '#db2777', '#f43f5e', '#fed7aa'],
  },
  {
    id: 'cyber-matrix',
    name: 'Cyberpunk Matrix',
    category: 'dark',
    colors: ['#020617', '#0f172a', '#0284c7', '#06b6d4', '#67e8f9'],
  },
  {
    id: 'pastel-serenity',
    name: 'Pastel Serenity',
    category: 'pastel',
    colors: ['#ffffff', '#f1f5f9', '#e0e7ff', '#ddd6fe', '#fce7f3'],
  },
  {
    id: 'monochrome-minimal',
    name: 'Monochrome Minimal',
    category: 'minimal',
    colors: ['#09090b', '#27272a', '#52525b', '#e4e4e7', '#ffffff'],
  },
  {
    id: 'aurora-borealis',
    name: 'Nordic Aurora',
    category: 'vibrant',
    colors: ['#042f2e', '#0d9488', '#10b981', '#34d399', '#a7f3d0'],
  },
];
