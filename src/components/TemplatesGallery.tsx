import React, { useState } from 'react';
import { BannerDocument } from '../types/banner';
import { PRESET_TEMPLATES } from '../templates/presetTemplates';
import { BannerSvgRenderer } from './BannerSvgRenderer';
import {
  Search,
  FolderHeart,
  Sliders,
  Sparkles,
  ArrowRight,
  Check,
  Download,
} from 'lucide-react';

interface TemplatesGalleryProps {
  templates?: BannerDocument[];
  onSelectTemplate: (template: BannerDocument) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onQuickExportSvg: (template: BannerDocument) => void;
  onQuickExportJpg: (template: BannerDocument) => void;
  onOpenBatchExport: () => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  templates = PRESET_TEMPLATES,
  onSelectTemplate,
  favorites,
  onToggleFavorite,
  onQuickExportSvg,
  onQuickExportJpg,
  onOpenBatchExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'Gradient', label: 'Gradients & Mesh' },
    { id: 'Luxury', label: 'Luxury & Crystal' },
    { id: 'Minimal', label: 'Minimal & Particles' },
    { id: 'Technology', label: 'Technology & Cyber' },
    { id: 'Creative', label: 'Creative & Memphis' },
    { id: 'favorites', label: 'My Favorites' },
  ];

  const filtered = templates.filter((tmpl) => {
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tmpl.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? favorites.includes(tmpl.id)
        : tmpl.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-6 md:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vector Banner Library</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Professional Abstract Banner Templates
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Engineered at exact 1584 × 396 px (4:1 aspect ratio). Ready for vector SVG & 300 DPI JPG export.
            </p>
          </div>

          {/* Actions: Batch Download All 10 and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenBatchExport}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-600/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download All 10 (Full Artboards ZIP)</span>
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 text-neutral-200 pl-9 pr-4 py-2 rounded-xl text-xs border border-neutral-800 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isFavTab = cat.id === 'favorites';
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {isFavTab && <FolderHeart className="w-3.5 h-3.5 text-rose-400" />}
                <span>{cat.label}</span>
                {isFavTab && favorites.length > 0 && (
                  <span className="text-[10px] bg-neutral-800 px-1.5 rounded-full font-mono">
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((tmpl) => {
            const isFav = favorites.includes(tmpl.id);
            return (
              <div
                key={tmpl.id}
                className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
              >
                <div>
                  {/* Live SVG Vector Banner Thumbnail */}
                  <div
                    onClick={() => onSelectTemplate(tmpl)}
                    className="w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer shadow-md group-hover:scale-[1.01] transition-transform"
                  >
                    <BannerSvgRenderer banner={tmpl} scope="banner" />
                  </div>

                  {/* Template Meta */}
                  <div className="flex items-start justify-between mt-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                          {tmpl.category}
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          1584 × 396 px
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mt-0.5">
                        {tmpl.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(tmpl.id)}
                      className={`p-2 rounded-lg hover:bg-neutral-800 transition-colors shrink-0 ${
                        isFav ? 'text-rose-500' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <FolderHeart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/80 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => onQuickExportSvg(tmpl)}
                      className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors font-medium flex items-center gap-1"
                      title="Quick download SVG"
                    >
                      <Download className="w-3 h-3" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => onQuickExportJpg(tmpl)}
                      className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors font-medium flex items-center gap-1"
                      title="Quick download 300 DPI JPG"
                    >
                      <Download className="w-3 h-3" />
                      <span>JPG</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectTemplate(tmpl)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm group/btn"
                  >
                    <span>Customize in Editor</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
            <p className="text-neutral-400 text-sm">
              No banner templates found matching "{searchTerm}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
