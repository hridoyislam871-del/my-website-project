import React from 'react';
import {
  Layers,
  LayoutTemplate,
  FolderHeart,
  HelpCircle,
  Sparkles,
  Download,
  Plus,
  Home,
  Sliders,
} from 'lucide-react';

export type MainNavTab = 'home' | 'templates' | 'editor' | 'saved' | 'help';

interface TopNavProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  bannerName: string;
  onExportSvg: () => void;
  onExportJpg: () => void;
  onNewDesign: () => void;
  onOpenBatchExport: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  bannerName,
  onExportSvg,
  onExportJpg,
  onNewDesign,
  onOpenBatchExport,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900 px-4 md:px-6 flex items-center justify-between gap-4 z-30 shrink-0">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Abstract Banner Studio
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800 text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'home'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab('templates')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'templates'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => onSelectTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => onSelectTab('saved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'saved'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>My Designs</span>
        </button>

        <button
          onClick={() => onSelectTab('help')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentTab === 'help'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help</span>
        </button>
      </nav>

      {/* Zone 3: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Batch Export All 10 Designs (Prominent CTA requested by user) */}
        <button
          onClick={onOpenBatchExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-300 bg-emerald-950/80 border border-emerald-600/70 hover:bg-emerald-900/80 transition-all shadow-sm hover:scale-[1.02] active:scale-95"
          title="Download all 10 templates at once with full artboard in ZIP"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download All 10 (ZIP)</span>
        </button>

        {/* Quick SVG Download */}
        <button
          onClick={onExportSvg}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 hover:bg-indigo-900/80 transition-colors shadow-sm"
          title="Download 1584x396 vector SVG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>SVG</span>
        </button>

        {/* Quick JPG Download */}
        <button
          onClick={onExportJpg}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
          title="Download 1584x396 high-res 300 DPI JPG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JPG (300 DPI)</span>
        </button>
      </div>
    </header>
  );
};
