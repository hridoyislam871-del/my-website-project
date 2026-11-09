import React from 'react';
import { BannerDocument } from '../types/banner';
import { PRESET_TEMPLATES } from '../templates/presetTemplates';
import { BannerSvgRenderer } from './BannerSvgRenderer';
import {
  Sparkles,
  ArrowRight,
  Download,
  Layers,
  Palette,
  Type,
  Maximize2,
  Sliders,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface HomeViewProps {
  templates?: BannerDocument[];
  onOpenEditor: () => void;
  onBrowseTemplates: () => void;
  onSelectTemplate: (template: BannerDocument) => void;
  onOpenBatchExport?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  templates = PRESET_TEMPLATES,
  onOpenEditor,
  onBrowseTemplates,
  onSelectTemplate,
  onOpenBatchExport,
}) => {
  const featuredTemplates = templates.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 text-neutral-100 select-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900/80 via-neutral-950 to-neutral-950 px-6 py-16 md:py-24">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exact 1584 × 396 Banner · 2000 × 2000 Artboard · 300 DPI Export</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Professional Abstract Banner Design Studio
          </h1>

          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Create, customize, and export ultra-sharp abstract banners. Featuring
            low-poly crystal meshes, cosmic glows, minimal particle waves, and
            cybernetic tech lattices.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              <Sliders className="w-4 h-4" />
              <span>Launch Design Studio</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {onOpenBatchExport && (
              <button
                onClick={onOpenBatchExport}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/70 font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download All 10 (Full Artboards ZIP)</span>
              </button>
            )}

            <button
              onClick={onBrowseTemplates}
              className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 font-semibold text-sm transition-all active:scale-95"
            >
              Browse 10+ Templates
            </button>
          </div>

          {/* Quick Specifications Pill Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Artboard: 2000 × 2000 px</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Inner Banner: 1584 × 396 px (4:1)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Vector SVG & 300 DPI JPG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Banner Showcase */}
      <section className="px-6 py-16 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Featured Abstract Banner Designs
            </h2>
            <p className="text-neutral-400 text-xs mt-1">
              Click any design to open directly in the canvas editor.
            </p>
          </div>

          <button
            onClick={onBrowseTemplates}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>View All 10+ Designs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl hover:shadow-black/50"
            >
              <div className="w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 group-hover:scale-[1.01] transition-transform">
                <BannerSvgRenderer banner={tmpl} scope="banner" />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {tmpl.category} · 1584 × 396 px
                  </span>
                </div>

                <span className="text-xs font-medium text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Edit</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Studio Capabilities Grid */}
      <section className="px-6 py-16 border-t border-neutral-800 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Built for Professional Production
            </h2>
            <p className="text-neutral-400 text-xs mt-2">
              Every detail engineered to give designers full creative control without compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Exact Geometric Workspace
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Full 2000 × 2000 px artboard with 1584 × 396 px inner banner centered at exact
                208px margins. Visual guides and multi-level zoom.
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950/80 border border-fuchsia-800 text-fuchsia-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Multi-Stop Gradient & Mesh
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Custom angles, multiple color stops, 3D low-poly crystal facets,
                hexagonal tech grids, and luminescent ambient lighting.
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Real Vector SVG & 300 DPI JPG
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Clean, self-contained SVG vectors that open flawlessly in Illustrator & Figma.
                JPGs injected with JFIF 300 DPI metadata for print readiness.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
