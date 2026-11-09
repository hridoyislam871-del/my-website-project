import React, { useState } from 'react';
import { BannerDocument } from '../types/banner';
import { BannerSvgRenderer } from './BannerSvgRenderer';
import {
  FolderHeart,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Sliders,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

interface SavedDesignsViewProps {
  savedDesigns: BannerDocument[];
  onOpenDesign: (design: BannerDocument) => void;
  onDeleteDesign: (id: string) => void;
  onDuplicateDesign: (design: BannerDocument) => void;
  onRenameDesign: (id: string, newName: string) => void;
  onCreateNew: () => void;
  onQuickExportSvg: (banner: BannerDocument) => void;
  onQuickExportJpg: (banner: BannerDocument) => void;
}

export const SavedDesignsView: React.FC<SavedDesignsViewProps> = ({
  savedDesigns,
  onOpenDesign,
  onDeleteDesign,
  onDuplicateDesign,
  onRenameDesign,
  onCreateNew,
  onQuickExportSvg,
  onQuickExportJpg,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartRename = (design: BannerDocument) => {
    setEditingId(design.id);
    setEditName(design.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameDesign(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-6 md:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Project Storage</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              My Saved Banner Designs
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Persistent local storage designs. Reopen, edit, duplicate, and export anytime.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Banner</span>
          </button>
        </div>

        {savedDesigns.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <FolderHeart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">
                No saved designs yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Customize any template in the editor and click "Save" on the top toolbar to store your projects here.
              </p>
            </div>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium"
            >
              Start New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedDesigns.map((design) => (
              <div
                key={design.id}
                className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Live SVG Vector Thumbnail */}
                  <div
                    onClick={() => onOpenDesign(design)}
                    className="w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer shadow-md group-hover:scale-[1.01] transition-transform"
                  >
                    <BannerSvgRenderer banner={design} scope="banner" />
                  </div>

                  {/* Design Title and Meta */}
                  <div className="mt-3">
                    {editingId === design.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleSaveRename(design.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSaveRename(design.id)
                          }
                          autoFocus
                          className="bg-neutral-800 text-white px-2 py-1 rounded text-sm font-semibold border border-indigo-500 w-full outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3
                          onClick={() => onOpenDesign(design)}
                          className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer truncate max-w-[280px]"
                        >
                          {design.name}
                        </h3>
                        <button
                          onClick={() => handleStartRename(design)}
                          className="p-1 text-neutral-500 hover:text-neutral-300 rounded"
                          title="Rename design"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono mt-1">
                      <span>{design.category}</span>
                      <span>·</span>
                      <span>{design.elements.length} layers</span>
                      <span>·</span>
                      <span>
                        {new Date(design.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/80 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onQuickExportSvg(design)}
                      className="px-2 py-1 text-xs text-neutral-400 hover:text-white rounded hover:bg-neutral-800 flex items-center gap-1"
                      title="Download SVG"
                    >
                      <Download className="w-3 h-3" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => onQuickExportJpg(design)}
                      className="px-2 py-1 text-xs text-neutral-400 hover:text-white rounded hover:bg-neutral-800 flex items-center gap-1"
                      title="Download 300 DPI JPG"
                    >
                      <Download className="w-3 h-3" />
                      <span>JPG</span>
                    </button>
                    <button
                      onClick={() => onDuplicateDesign(design)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                      title="Duplicate design"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDesign(design.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800"
                      title="Delete design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenDesign(design)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Open Editor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
