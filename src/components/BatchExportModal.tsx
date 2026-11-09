import React, { useState } from 'react';
import { PRESET_TEMPLATES } from '../templates/presetTemplates';
import { downloadAllTemplatesZip } from '../utils/exportUtils';
import { BannerSvgRenderer } from './BannerSvgRenderer';
import {
  X,
  Download,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
  FolderArchive,
} from 'lucide-react';
import { BannerDocument } from '../types/banner';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates?: BannerDocument[];
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  templates,
}) => {
  const [scope, setScope] = useState<'both' | 'artboard' | 'banner'>('both');
  const [format, setFormat] = useState<'both' | 'svg' | 'jpg'>('both');
  const [useCustomized, setUseCustomized] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeTemplatesToExport =
    useCustomized && templates && templates.length > 0 ? templates : PRESET_TEMPLATES;

  const handleStartBatchDownload = async () => {
    setIsExporting(true);
    setIsSuccess(false);
    setExportProgress(0);
    setProgressStatus('Starting batch export...');

    try {
      await downloadAllTemplatesZip(
        {
          scope,
          format,
          templates: activeTemplatesToExport,
          quality: 0.98,
        },
        (status, percentage) => {
          setProgressStatus(status);
          setExportProgress(percentage);
        }
      );
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Batch export failed', err);
      setProgressStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Download All 10 Designs (Full Artboard & Banner Pack)
              </h2>
              <p className="text-[11px] text-neutral-400">
                1-click download of all 10 templates in full 2000 × 2000 artboards and 1584 × 396 banners.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Templates Showcase Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Included Designs ({activeTemplatesToExport.length} Unique Templates)
              </span>
              <div className="flex items-center gap-1.5 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseCustomized(true)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    useCustomized
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  My Customized ({templates?.length || 10})
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomized(false)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    !useCustomized
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Original Presets
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-950 rounded-xl border border-neutral-800">
              {activeTemplatesToExport.map((tmpl, idx) => (
                <div
                  key={tmpl.id}
                  className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 p-1 flex flex-col justify-between"
                  title={tmpl.name}
                >
                  <div className="w-full rounded overflow-hidden">
                    <BannerSvgRenderer banner={tmpl} scope="banner" />
                  </div>
                  <div className="text-[9px] text-neutral-300 font-semibold truncate mt-1 text-center">
                    #{idx + 1} {tmpl.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
              Select Artboard Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('both')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'both'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Both Formats (Best)
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                  2000×2000 + 1584×396
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Full artboards + inner banners in organized subfolders
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('artboard')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'artboard'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Full Artboard Only
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                  2000 × 2000 px (1:1)
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Square artboards with centered 1584×396 designs
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('banner')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'banner'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Inner Banners Only
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                  1584 × 396 px (4:1)
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Cropped exactly to the 4:1 banner artwork
                </div>
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
              Select Output Formats
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('both')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  format === 'both'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  SVG + 300 DPI JPG
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  All Vector & High-Res
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Both editable vectors and print-ready 300 DPI images
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  format === 'svg'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Vector SVG Only
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                  Illustrator & Figma
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Scalable vector files for graphic editing
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpg')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  format === 'jpg'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  300 DPI JPG Only
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                  Maximum Quality
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Embedded JFIF 300 DPI resolution tags
                </div>
              </button>
            </div>
          </div>

          {/* 300 DPI & Production Quality Assurance Banner */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-neutral-300 leading-relaxed">
              <strong className="text-white">Professional Production Guarantee:</strong> All 10 banner designs are rendered with clean vector geometry, zero broken elements, zero overflowing text, and real 300 DPI density tags. Packaged inside a clean, organized ZIP archive.
            </div>
          </div>

          {/* Export Progress Bar */}
          {isExporting && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-700/60 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-300">{progressStatus}</span>
                <span className="text-white font-mono">{exportProgress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="text-xs text-neutral-400 font-mono">
            Package: 10 Templates · {scope === 'both' ? '20 Files' : '10 Files'} per format
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleStartBatchDownload}
              disabled={isExporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ZIP Downloaded!</span>
                </>
              ) : isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Packaging All 10 Designs...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download All 10 Designs (ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
