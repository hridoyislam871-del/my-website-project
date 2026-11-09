import React from 'react';
import {
  BannerElement,
  TextElement,
  ShapeElement,
  AbstractElement,
  BadgeElement,
  BannerDocument,
} from '../types/banner';
import {
  Type,
  Square,
  Sparkles,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Palette,
  Eye,
  Shield,
  Layers,
  Trash2,
  Copy,
} from 'lucide-react';

interface RightSidebarProps {
  banner: BannerDocument;
  selectedElement: BannerElement | null;
  onUpdateElement: (id: string, updates: Partial<BannerElement>) => void;
  onUpdateBanner: (updates: Partial<BannerDocument>) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  banner,
  selectedElement,
  onUpdateElement,
  onUpdateBanner,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!selectedElement) {
    // Canvas / Artboard Global Inspector
    return (
      <aside className="w-72 h-full border-l border-neutral-800 bg-neutral-900 p-4 overflow-y-auto text-xs shrink-0 select-none z-20 space-y-6">
        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-3">
            Canvas Specifications
          </h3>

          <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-[11px]">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Main Artboard</span>
              <span className="text-white font-mono font-medium">2000 × 2000 px</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Inner Banner</span>
              <span className="text-indigo-400 font-mono font-semibold">1584 × 396 px</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Aspect Ratio</span>
              <span className="text-neutral-200 font-mono">4:1 Exact</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Artboard Margin X</span>
              <span className="text-neutral-300 font-mono">208 px (Left/Right)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Artboard Margin Y</span>
              <span className="text-neutral-300 font-mono">802 px (Top/Bottom)</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
            Design Metadata
          </h3>
          <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Banner Name</span>
              <span className="text-neutral-200 font-medium truncate max-w-[130px]">
                {banner.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Category</span>
              <span className="text-indigo-400 font-medium">{banner.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Active Layers</span>
              <span className="text-neutral-200 font-mono">{banner.elements.length}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-indigo-300 text-[11px] leading-relaxed">
          💡 Click any element on the canvas to inspect its fonts, geometry, colors, and effects here.
        </div>
      </aside>
    );
  }

  // ELEMENT-SPECIFIC PROPERTY INSPECTOR
  return (
    <aside className="w-72 h-full border-l border-neutral-800 bg-neutral-900 p-4 overflow-y-auto text-xs shrink-0 select-none z-20 space-y-5">
      {/* Element Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="font-semibold text-neutral-200 truncate max-w-[150px]">
            {selectedElement.name}
          </h3>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            {selectedElement.type} element
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDuplicateElement && (
            <button
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onDeleteElement && (
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors"
              title="Delete Element (Backspace / Delete)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. TEXT PROPERTIES */}
      {selectedElement.type === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Text Content
            </label>
            <textarea
              value={(selectedElement as TextElement).text}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { text: e.target.value })
              }
              rows={2}
              className="w-full bg-neutral-800 text-white p-2 rounded-lg text-xs border border-neutral-700 focus:border-indigo-500 outline-none resize-none font-medium"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Font Family
            </label>
            <select
              value={(selectedElement as TextElement).fontFamily}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { fontFamily: e.target.value })
              }
              className="w-full bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs border border-neutral-700 outline-none"
            >
              <option value="Outfit">Outfit (Display Sans)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
              <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
              <option value="Cinzel">Cinzel (Classical Serif)</option>
              <option value="Manrope">Manrope (Clean Grotesque)</option>
              <option value="JetBrains Mono">JetBrains Mono (Tech Monospace)</option>
            </select>
          </div>

          {/* Font Size & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">
                Size ({(selectedElement as TextElement).fontSize}px)
              </label>
              <input
                type="range"
                min="10"
                max="120"
                value={(selectedElement as TextElement).fontSize}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    fontSize: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">
                Weight
              </label>
              <select
                value={(selectedElement as TextElement).fontWeight}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    fontWeight: Number(e.target.value),
                  })
                }
                className="w-full bg-neutral-800 text-neutral-200 px-2 py-1.5 rounded-lg text-xs border border-neutral-700 outline-none"
              >
                <option value={300}>Light 300</option>
                <option value={400}>Regular 400</option>
                <option value={500}>Medium 500</option>
                <option value={600}>SemiBold 600</option>
                <option value={700}>Bold 700</option>
                <option value={800}>ExtraBold 800</option>
              </select>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Alignment
            </label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-800 p-1 rounded-lg">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() =>
                    onUpdateElement(selectedElement.id, { textAlign: align })
                  }
                  className={`py-1 rounded flex items-center justify-center transition-colors ${
                    (selectedElement as TextElement).textAlign === align
                      ? 'bg-neutral-700 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Spacing (Tracking) */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span>Letter Spacing</span>
              <span className="font-mono text-neutral-200">
                {(selectedElement as TextElement).letterSpacing || 0}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={(selectedElement as TextElement).letterSpacing || 0}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, {
                  letterSpacing: Number(e.target.value),
                })
              }
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Text Color */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(selectedElement as TextElement).fill}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { fill: e.target.value })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as TextElement).fill}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { fill: e.target.value })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SHAPE PROPERTIES */}
      {selectedElement.type === 'shape' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  (selectedElement as ShapeElement).fill === 'transparent'
                    ? '#ffffff'
                    : (selectedElement as ShapeElement).fill
                }
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { fill: e.target.value })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as ShapeElement).fill}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { fill: e.target.value })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>

          {/* Stroke */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Stroke Outline ({(selectedElement as ShapeElement).strokeWidth || 0}px)
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={(selectedElement as ShapeElement).strokeWidth || 0}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, {
                  strokeWidth: Number(e.target.value),
                  stroke:
                    (selectedElement as ShapeElement).stroke === 'none'
                      ? '#ffffff'
                      : (selectedElement as ShapeElement).stroke,
                })
              }
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Stroke Color */}
          {((selectedElement as ShapeElement).strokeWidth || 0) > 0 && (
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">
                Stroke Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(selectedElement as ShapeElement).stroke || '#ffffff'}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      stroke: e.target.value,
                    })
                  }
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={(selectedElement as ShapeElement).stroke || '#ffffff'}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      stroke: e.target.value,
                    })
                  }
                  className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
                />
              </div>
            </div>
          )}

          {/* Corner Radius if rectangle */}
          {(selectedElement as ShapeElement).shapeType === 'rectangle' && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span>Corner Radius</span>
                <span className="font-mono text-neutral-200">
                  {(selectedElement as ShapeElement).cornerRadius || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={(selectedElement as ShapeElement).cornerRadius || 0}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    cornerRadius: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 3. ABSTRACT PROPERTIES */}
      {selectedElement.type === 'abstract' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Primary Vector Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(selectedElement as AbstractElement).primaryColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    primaryColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as AbstractElement).primaryColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    primaryColor: e.target.value,
                  })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Secondary Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(selectedElement as AbstractElement).secondaryColor || '#ffffff'}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    secondaryColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as AbstractElement).secondaryColor || '#ffffff'}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    secondaryColor: e.target.value,
                  })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. BADGE PROPERTIES */}
      {selectedElement.type === 'badge' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Badge Label
            </label>
            <input
              type="text"
              value={(selectedElement as BadgeElement).text}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { text: e.target.value })
              }
              className="w-full bg-neutral-800 text-white px-2.5 py-1.5 rounded-lg text-xs border border-neutral-700 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(selectedElement as BadgeElement).backgroundColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    backgroundColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as BadgeElement).backgroundColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    backgroundColor: e.target.value,
                  })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(selectedElement as BadgeElement).textColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    textColor: e.target.value,
                  })
                }
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={(selectedElement as BadgeElement).textColor}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    textColor: e.target.value,
                  })
                }
                className="flex-1 bg-neutral-800 text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-neutral-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* COMMON TRANSFORM & GEOMETRY CONTROLS */}
      <div className="border-t border-neutral-800 pt-4 space-y-3">
        <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Geometry & Transform
        </h4>

        {/* Position X / Y */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-500 block mb-0.5">X Position</label>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { x: Number(e.target.value) })
              }
              className="w-full bg-neutral-800 text-neutral-200 px-2 py-1 rounded text-xs font-mono border border-neutral-700"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 block mb-0.5">Y Position</label>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { y: Number(e.target.value) })
              }
              className="w-full bg-neutral-800 text-neutral-200 px-2 py-1 rounded text-xs font-mono border border-neutral-700"
            />
          </div>
        </div>

        {/* Width / Height */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-500 block mb-0.5">Width (px)</label>
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, {
                  width: Math.max(10, Number(e.target.value)),
                })
              }
              className="w-full bg-neutral-800 text-neutral-200 px-2 py-1 rounded text-xs font-mono border border-neutral-700"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 block mb-0.5">Height (px)</label>
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, {
                  height: Math.max(2, Number(e.target.value)),
                })
              }
              className="w-full bg-neutral-800 text-neutral-200 px-2 py-1 rounded text-xs font-mono border border-neutral-700"
            />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span>Rotation</span>
            <span className="font-mono text-neutral-200">
              {selectedElement.rotation || 0}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedElement.rotation || 0}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                rotation: Number(e.target.value),
              })
            }
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Opacity */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span>Opacity</span>
            <span className="font-mono text-neutral-200">
              {Math.round((selectedElement.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={selectedElement.opacity ?? 1}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                opacity: Number(e.target.value),
              })
            }
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Quick Element Actions (Delete / Duplicate) */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          {onDeleteElement && (
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {selectedElement.type === 'text' ? 'Text' : 'Element'}</span>
            </button>
          )}

          {onDuplicateElement && (
            <button
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate Element</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
