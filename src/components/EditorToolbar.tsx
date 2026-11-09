import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  Save,
  Download,
  Eye,
  Check,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { BannerElement, ViewMode } from '../types/banner';

interface EditorToolbarProps {
  bannerName: string;
  onRenameBanner: (newName: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedElement: BannerElement | null;
  onDuplicateElement: () => void;
  onDeleteElement: () => void;
  onToggleLockElement: () => void;
  onAlignElement: (
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'center-both'
  ) => void;
  viewMode: ViewMode;
  onTogglePreview: () => void;
  onSaveDesign: () => void;
  isSavedJustNow: boolean;
  onExportSvg: () => void;
  onExportJpg: () => void;
  onOpenBatchExport: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  bannerName,
  onRenameBanner,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedElement,
  onDuplicateElement,
  onDeleteElement,
  onToggleLockElement,
  onAlignElement,
  viewMode,
  onTogglePreview,
  onSaveDesign,
  isSavedJustNow,
  onExportSvg,
  onExportJpg,
  onOpenBatchExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(bannerName);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onRenameBanner(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="h-12 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
      {/* Left: Design Title & History (Undo/Redo) */}
      <div className="flex items-center gap-3">
        {/* Editable Title */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-neutral-800 text-white font-medium px-2 py-1 rounded border border-indigo-500 text-xs w-48 outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(bannerName);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-800 text-neutral-200 font-semibold group transition-colors"
              title="Click to rename design"
            >
              <span className="truncate max-w-[160px] md:max-w-[220px]">
                {bannerName}
              </span>
              <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-neutral-800" />

        {/* Undo & Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle: Selection Operations (Duplicate, Delete, Lock, Align) */}
      <div className="flex items-center gap-1">
        {selectedElement ? (
          <>
            <span className="hidden lg:inline text-neutral-400 text-[11px] mr-1">
              Selected: <strong className="text-neutral-200">{selectedElement.name}</strong>
            </span>

            <button
              onClick={onDuplicateElement}
              title="Duplicate Element (Ctrl+D)"
              className="p-1.5 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleLockElement}
              title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.locked
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {selectedElement.locked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onDeleteElement}
              title="Delete Element (Delete)"
              className="p-1.5 rounded text-neutral-300 hover:bg-rose-950/80 hover:text-rose-400 hover:border hover:border-rose-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-neutral-800 mx-1" />

            {/* Align Menu */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onAlignElement('left')}
                title="Align Left in Banner"
                className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignElement('center')}
                title="Center Horizontally in Banner"
                className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignElement('right')}
                title="Align Right in Banner"
                className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAlignElement('center-both')}
                title="Center Both Dimensions in Banner"
                className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                <AlignVerticalJustifyCenter className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <span className="text-neutral-500 text-[11px] italic">
            Click any text or shape on the canvas to inspect & edit
          </span>
        )}
      </div>

      {/* Right: Preview, Save & Export */}
      <div className="flex items-center gap-2">
        {/* Preview Button */}
        <button
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            viewMode === 'preview'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
          }`}
          title="Toggle preview without handles"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Save Design */}
        <button
          onClick={onSaveDesign}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            isSavedJustNow
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white'
          }`}
          title="Save to My Designs (localStorage)"
        >
          {isSavedJustNow ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          )}
        </button>

        {/* Export SVG */}
        <button
          onClick={onExportSvg}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900 transition-colors font-medium"
          title="Export vector SVG (1584x396)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>SVG</span>
        </button>

        {/* Export JPG */}
        <button
          onClick={onExportJpg}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm"
          title="Export 300 DPI high-quality JPG (1584x396)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JPG</span>
        </button>

        {/* Batch Export All 10 Designs */}
        <button
          onClick={onOpenBatchExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/70 hover:bg-emerald-900/80 text-emerald-300 font-bold transition-colors shadow-sm"
          title="Download all 10 templates at once with full artboard in ZIP"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>All 10 (ZIP)</span>
        </button>
      </div>
    </div>
  );
};
