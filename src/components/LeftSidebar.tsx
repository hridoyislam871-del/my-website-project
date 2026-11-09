import React, { useState } from 'react';
import {
  LayoutTemplate,
  Paintbrush,
  Type,
  Shapes,
  Palette,
  Layers,
  FolderHeart,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Search,
  Check,
  Circle,
  Square,
  Star,
  Hexagon,
  Minus,
  Sliders,
} from 'lucide-react';
import {
  BannerDocument,
  BannerElement,
  ActiveTab,
  PatternType,
  ShapeType,
} from '../types/banner';
import { PRESET_TEMPLATES } from '../templates/presetTemplates';
import { PRESET_PALETTES, ColorPalette } from '../palettes/colorPalettes';
import { BannerSvgRenderer } from './BannerSvgRenderer';

interface LeftSidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  banner: BannerDocument;
  templates?: BannerDocument[];
  onUpdateBanner: (updates: Partial<BannerDocument>) => void;
  onLoadTemplate: (template: BannerDocument) => void;
  onResetTemplate?: (templateId: string) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: BannerElement) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (fromIndex: number, toIndex: number) => void;
  onApplyPalette: (palette: ColorPalette) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onChangeTab,
  banner,
  templates = PRESET_TEMPLATES,
  onUpdateBanner,
  onLoadTemplate,
  onResetTemplate,
  selectedElementId,
  onSelectElement,
  onAddElement,
  onDeleteElement,
  onReorderElements,
  onApplyPalette,
  favorites,
  onToggleFavorite,
}) => {
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#ffffff',
    '#0f172a',
    '#3b82f6',
    '#e11d48',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
  ]);

  // Track color changes
  const addRecentColor = (color: string) => {
    if (!recentColors.includes(color)) {
      setRecentColors((prev) => [color, ...prev.slice(0, 9)]);
    }
  };

  // Add new text element
  const handleAddText = (
    presetType: 'heading' | 'subheading' | 'body' | 'kicker'
  ) => {
    const id = `text_${Date.now()}`;
    let newElement: BannerElement;

    if (presetType === 'heading') {
      newElement = {
        id,
        name: 'Heading Text',
        type: 'text',
        x: 792,
        y: 198,
        width: 800,
        height: 60,
        rotation: 0,
        opacity: 1,
        text: 'YOUR HEADLINE HERE',
        fontFamily: 'Outfit',
        fontSize: 48,
        fontWeight: 700,
        fill: '#ffffff',
        textAlign: 'center',
        letterSpacing: 4,
        lineHeight: 1.1,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      };
    } else if (presetType === 'subheading') {
      newElement = {
        id,
        name: 'Subheading Text',
        type: 'text',
        x: 792,
        y: 240,
        width: 600,
        height: 30,
        rotation: 0,
        opacity: 0.9,
        text: 'Secondary Subtitle or Callout Description',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16,
        fontWeight: 500,
        fill: '#94a3b8',
        textAlign: 'center',
        letterSpacing: 2,
        lineHeight: 1.2,
      };
    } else if (presetType === 'kicker') {
      newElement = {
        id,
        name: 'Badge Tag',
        type: 'badge',
        x: 792,
        y: 130,
        width: 200,
        height: 30,
        rotation: 0,
        opacity: 0.95,
        text: 'NEW EDITION 2026',
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        textColor: '#818cf8',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
        fontSize: 12,
      };
    } else {
      newElement = {
        id,
        name: 'Body Text',
        type: 'text',
        x: 792,
        y: 220,
        width: 500,
        height: 50,
        rotation: 0,
        opacity: 0.8,
        text: 'Crafting sophisticated vector abstractions for digital applications and print banners.',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 13,
        fontWeight: 400,
        fill: '#cbd5e1',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 1.5,
      };
    }

    onAddElement(newElement);
    onSelectElement(id);
  };

  // Add new shape element
  const handleAddShape = (shapeType: ShapeType) => {
    const id = `shape_${Date.now()}`;
    const newElement: BannerElement = {
      id,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      type: 'shape',
      shapeType,
      x: 792,
      y: 198,
      width: shapeType === 'line' ? 400 : 180,
      height: shapeType === 'line' ? 2 : 180,
      rotation: 0,
      opacity: 0.85,
      fill: shapeType === 'ring' ? 'transparent' : '#6366f1',
      stroke: shapeType === 'ring' ? '#818cf8' : 'none',
      strokeWidth: shapeType === 'ring' ? 12 : 0,
      blendMode: shapeType === 'glow-orb' ? 'screen' : 'normal',
    };
    onAddElement(newElement);
    onSelectElement(id);
  };

  // Add abstract element
  const handleAddAbstract = (
    abstractType:
      | 'wave-ribbon'
      | 'glowing-orb'
      | 'particle-cluster'
      | 'molecular-node'
      | 'mesh-facet'
      | 'glass-card'
  ) => {
    const id = `abstract_${Date.now()}`;
    const newElement: BannerElement = {
      id,
      name: `${abstractType.replace('-', ' ')}`,
      type: 'abstract',
      abstractType,
      x: 792,
      y: 198,
      width: abstractType === 'glass-card' ? 600 : abstractType === 'wave-ribbon' ? 1200 : 380,
      height: abstractType === 'wave-ribbon' ? 200 : 200,
      rotation: 0,
      opacity: 0.7,
      primaryColor: '#38bdf8',
      secondaryColor: '#818cf8',
      blendMode: 'screen',
    };
    onAddElement(newElement);
    onSelectElement(id);
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory =
      templateCategory === 'all' ||
      t.category.toLowerCase() === templateCategory.toLowerCase() ||
      (templateCategory === 'favorites' && favorites.includes(t.id));
    return matchesSearch && matchesCategory;
  });

  return (
    <aside className="w-80 h-full border-r border-neutral-800 bg-neutral-900 flex flex-col shrink-0 select-none z-20">
      {/* Sidebar Tool Navigation Tabs */}
      <div className="grid grid-cols-6 border-b border-neutral-800 bg-neutral-950/80 p-1 gap-0.5 text-xs">
        {[
          { id: 'templates', label: 'Presets', icon: LayoutTemplate },
          { id: 'background', label: 'Backdrop', icon: Paintbrush },
          { id: 'text', label: 'Type', icon: Type },
          { id: 'elements', label: 'Shapes', icon: Shapes },
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'layers', label: 'Layers', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as ActiveTab)}
              title={tab.label}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-indigo-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Content Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                10+ Vector Templates
              </h3>
              <span className="text-xs text-neutral-500 font-mono">
                {filteredTemplates.length} styles
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search styles (Navy, Pink, Gold...)"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full bg-neutral-800 text-neutral-200 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-neutral-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {['all', 'Gradient', 'Luxury', 'Minimal', 'Technology', 'Creative'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    templateCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* Template List */}
            <div className="space-y-3">
              {filteredTemplates.map((tmpl) => {
                const isCurrent = banner.id === tmpl.id;
                const isFav = favorites.includes(tmpl.id);
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => onLoadTemplate(tmpl)}
                    className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-md ring-1 ring-indigo-500'
                        : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 hover:bg-neutral-800/40'
                    }`}
                  >
                    {/* Live SVG Preview thumbnail */}
                    <div className="w-full rounded-lg overflow-hidden border border-neutral-800 mb-2 shadow-inner">
                      <BannerSvgRenderer banner={tmpl} scope="banner" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300 transition-colors">
                          {tmpl.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                          {tmpl.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(tmpl.id);
                        }}
                        className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                          isFav ? 'text-rose-500' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <FolderHeart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BACKGROUND */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-3">
                Background Type
              </h3>
              <div className="grid grid-cols-3 gap-1 bg-neutral-800 p-1 rounded-lg">
                {(['linear-gradient', 'radial-gradient', 'solid'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      onUpdateBanner({
                        background: { ...banner.background, type },
                      })
                    }
                    className={`py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                      banner.background.type === type
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {type.replace('-gradient', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Angle Slider */}
            {banner.background.type === 'linear-gradient' && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-400">Gradient Angle</span>
                  <span className="text-neutral-200 font-mono">
                    {banner.background.gradientAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={banner.background.gradientAngle}
                  onChange={(e) =>
                    onUpdateBanner({
                      background: {
                        ...banner.background,
                        gradientAngle: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            )}

            {/* Gradient Color Stops */}
            {banner.background.type !== 'solid' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Color Stops</span>
                  <button
                    onClick={() => {
                      const newStops = [
                        ...banner.background.gradientStops,
                        { offset: 0.5, color: '#38bdf8' },
                      ].sort((a, b) => a.offset - b.offset);
                      onUpdateBanner({
                        background: {
                          ...banner.background,
                          gradientStops: newStops,
                        },
                      });
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="space-y-1.5">
                  {banner.background.gradientStops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-neutral-800/80 p-2 rounded-lg border border-neutral-700/60"
                    >
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          addRecentColor(newColor);
                          const updated = [...banner.background.gradientStops];
                          updated[idx] = { ...updated[idx], color: newColor };
                          onUpdateBanner({
                            background: {
                              ...banner.background,
                              gradientStops: updated,
                            },
                          });
                        }}
                        className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => {
                          const updated = [...banner.background.gradientStops];
                          updated[idx] = { ...updated[idx], color: e.target.value };
                          onUpdateBanner({
                            background: {
                              ...banner.background,
                              gradientStops: updated,
                            },
                          });
                        }}
                        className="w-20 bg-neutral-900 text-neutral-200 px-2 py-1 rounded text-xs font-mono border border-neutral-700"
                      />
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {Math.round(stop.offset * 100)}%
                      </span>

                      {banner.background.gradientStops.length > 2 && (
                        <button
                          onClick={() => {
                            const updated = banner.background.gradientStops.filter(
                              (_, i) => i !== idx
                            );
                            onUpdateBanner({
                              background: {
                                ...banner.background,
                                gradientStops: updated,
                              },
                            });
                          }}
                          className="ml-auto text-neutral-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solid Color Picker */}
            {banner.background.type === 'solid' && (
              <div className="space-y-2">
                <span className="text-xs text-neutral-400">Solid Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={banner.background.color}
                    onChange={(e) => {
                      const color = e.target.value;
                      addRecentColor(color);
                      onUpdateBanner({
                        background: { ...banner.background, color },
                      });
                    }}
                    className="w-10 h-10 rounded border-none cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={banner.background.color}
                    onChange={(e) =>
                      onUpdateBanner({
                        background: {
                          ...banner.background,
                          color: e.target.value,
                        },
                      })
                    }
                    className="flex-1 bg-neutral-800 text-neutral-200 px-3 py-2 rounded-lg text-xs font-mono border border-neutral-700"
                  />
                </div>
              </div>
            )}

            {/* Pattern & Texture Overlays */}
            <div className="border-t border-neutral-800 pt-4 space-y-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                Texture & Pattern Overlay
              </h3>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'lowpoly', label: '3D Low-Poly Facets' },
                  { id: 'dots', label: 'Dotted Grid' },
                  { id: 'hexgrid', label: 'Hexagon Matrix' },
                  { id: 'stars', label: 'Starlight Dust' },
                  { id: 'diagonal-stripes', label: 'Diagonal Lines' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() =>
                      onUpdateBanner({
                        background: {
                          ...banner.background,
                          pattern: pat.id as PatternType,
                          patternOpacity:
                            pat.id === 'none'
                              ? 0
                              : banner.background.patternOpacity || 0.25,
                        },
                      })
                    }
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium text-left border transition-colors ${
                      banner.background.pattern === pat.id
                        ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>

              {banner.background.pattern !== 'none' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400">Texture Opacity</span>
                      <span className="text-neutral-200 font-mono">
                        {Math.round(banner.background.patternOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={banner.background.patternOpacity}
                      onChange={(e) =>
                        onUpdateBanner({
                          background: {
                            ...banner.background,
                            patternOpacity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400">Texture Color</span>
                      <span className="text-neutral-200 font-mono text-[11px]">
                        {banner.background.patternColor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={banner.background.patternColor}
                        onChange={(e) =>
                          onUpdateBanner({
                            background: {
                              ...banner.background,
                              patternColor: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={banner.background.patternColor}
                        onChange={(e) =>
                          onUpdateBanner({
                            background: {
                              ...banner.background,
                              patternColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Lighting & Glow */}
            <div className="border-t border-neutral-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                  Ambient Radial Glow
                </h3>
                <input
                  type="checkbox"
                  checked={banner.background.glowEffect}
                  onChange={(e) =>
                    onUpdateBanner({
                      background: {
                        ...banner.background,
                        glowEffect: e.target.checked,
                      },
                    })
                  }
                  className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {banner.background.glowEffect && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400">Glow Intensity</span>
                      <span className="text-neutral-200 font-mono">
                        {Math.round(banner.background.glowIntensity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={banner.background.glowIntensity}
                      onChange={(e) =>
                        onUpdateBanner({
                          background: {
                            ...banner.background,
                            glowIntensity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={banner.background.glowColor}
                      onChange={(e) =>
                        onUpdateBanner({
                          background: {
                            ...banner.background,
                            glowColor: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={banner.background.glowColor}
                      onChange={(e) =>
                        onUpdateBanner({
                          background: {
                            ...banner.background,
                            glowColor: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEXT */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Add Text Elements
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => handleAddText('heading')}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl border border-neutral-700/60 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-display font-bold text-base group-hover:text-indigo-300">
                    Add Main Headline
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Large bold display font (Outfit 48px)
                  </div>
                </div>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => handleAddText('subheading')}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl border border-neutral-700/60 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-sans font-semibold text-sm group-hover:text-indigo-300">
                    Add Subtitle Text
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Medium tracking subhead (16px)
                  </div>
                </div>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => handleAddText('kicker')}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl border border-neutral-700/60 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-bold">
                    [ Add Pill Tag / Badge ]
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Category tag or badge with background
                  </div>
                </div>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => handleAddText('body')}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl border border-neutral-700/60 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs text-neutral-300 group-hover:text-white">
                    Add Paragraph Body
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Compact 13px editorial prose
                  </div>
                </div>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SHAPES & ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-3">
                Geometric Shapes
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'rectangle', label: 'Rectangle', icon: Square },
                  { type: 'circle', label: 'Circle', icon: Circle },
                  { type: 'ring', label: 'Ring', icon: Circle },
                  { type: 'star', label: 'Star', icon: Star },
                  { type: 'hexagon', label: 'Hexagon', icon: Hexagon },
                  { type: 'line', label: 'Line', icon: Minus },
                  { type: 'sparkle', label: 'Sparkle', icon: Sparkles },
                  { type: 'glow-orb', label: 'Glow Orb', icon: Circle },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.type}
                      onClick={() => handleAddShape(s.type as ShapeType)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all group"
                    >
                      <Icon className="w-5 h-5 mb-1 group-hover:text-indigo-400" />
                      <span className="text-[10px]">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-3">
                Abstract Design Components
              </h3>
              <div className="space-y-2">
                {[
                  {
                    type: 'wave-ribbon',
                    title: 'Dynamic Wave Ribbon',
                    desc: 'Smooth curved bezier wave ribbon with gradient glow',
                  },
                  {
                    type: 'particle-cluster',
                    title: 'Dotted Particle Wave',
                    desc: 'Mathematical matrix wave lattice (Reference #3)',
                  },
                  {
                    type: 'molecular-node',
                    title: 'Molecular Tech Network',
                    desc: 'Cybernetic connected hexagons and node vectors',
                  },
                  {
                    type: 'mesh-facet',
                    title: 'Crystal Facet Mesh',
                    desc: 'Low-poly geometric crystal triangles (Reference #1)',
                  },
                  {
                    type: 'glass-card',
                    title: 'Frosted Glass Plate',
                    desc: 'Modern glassmorphic container with soft border',
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() =>
                      handleAddAbstract(
                        item.type as
                          | 'wave-ribbon'
                          | 'particle-cluster'
                          | 'molecular-node'
                          | 'mesh-facet'
                          | 'glass-card'
                      )
                    }
                    className="w-full p-2.5 bg-neutral-800/80 hover:bg-neutral-700 rounded-xl border border-neutral-700/60 text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {item.desc}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COLORS & PALETTES */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
                Preset Designer Palettes
              </h3>
              <p className="text-[11px] text-neutral-400 mb-3">
                Click any palette to instantly harmonize your banner colors.
              </p>

              <div className="space-y-2.5">
                {PRESET_PALETTES.map((pal) => (
                  <div
                    key={pal.id}
                    onClick={() => onApplyPalette(pal)}
                    className="p-2.5 bg-neutral-800/70 hover:bg-neutral-750 border border-neutral-700/60 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300">
                        {pal.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase">
                        {pal.category}
                      </span>
                    </div>

                    {/* Palette Swatches */}
                    <div className="flex h-5 rounded-md overflow-hidden shadow-inner">
                      {pal.colors.map((c, i) => (
                        <div
                          key={i}
                          style={{ backgroundColor: c }}
                          className="flex-1 h-full"
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Used Swatches */}
            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
                Recently Used Colors
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {recentColors.map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      // Apply to background color
                      onUpdateBanner({
                        background: {
                          ...banner.background,
                          color: c,
                        },
                      });
                    }}
                    className="w-6 h-6 rounded-md cursor-pointer border border-neutral-700 hover:scale-110 transition-transform shadow-sm"
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LAYERS */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                Layer Hierarchy
              </h3>
              <span className="text-xs text-neutral-500 font-mono">
                {banner.elements.length} elements
              </span>
            </div>

            <div className="space-y-1">
              {banner.elements.length === 0 ? (
                <div className="text-xs text-neutral-500 italic p-4 text-center">
                  No elements added yet. Add text or shapes from the sidebar!
                </div>
              ) : (
                banner.elements.map((el, idx) => {
                  const isSelected = el.id === selectedElementId;
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white font-medium'
                          : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-neutral-500 font-mono text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="truncate max-w-[140px]">{el.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Move Up */}
                        <button
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderElements(idx, idx - 1);
                          }}
                          className={`p-1 rounded ${
                            idx === 0
                              ? 'text-neutral-600'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                          title="Bring backward"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          disabled={idx === banner.elements.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderElements(idx, idx + 1);
                          }}
                          className={`p-1 rounded ${
                            idx === banner.elements.length - 1
                              ? 'text-neutral-600'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                          title="Bring forward"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Element */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteElement(el.id);
                          }}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400"
                          title="Delete element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
