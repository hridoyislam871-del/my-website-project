import React, { useState } from 'react';
import { BannerDocument } from '../types/banner';
import { downloadBannerSvg, downloadBannerJpg } from '../utils/exportUtils';
import { BannerSvgRenderer } from './BannerSvgRenderer';
import {
  X,
  Download,
  CheckCircle2,
  FileCode,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerDocument;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  banner,
}) => {
  const [format, setFormat] = useState<'svg' | 'jpg'>('svg');
  const [scope, setScope] = useState<'banner' | 'artboard'>('banner');
  const [quality, setQuality] = useState<number>(0.98);
  const [filename, setFilename] = useState<string>(
    `${banner.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetWidth = scope === 'artboard' ? 2000 : 1584;
  const targetHeight = scope === 'artboard' ? 2000 : 396;

  const handleDownload = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      if (format === 'svg') {
        await downloadBannerSvg(
          banner,
          scope,
          `${filename}_${scope === 'artboard' ? 'artboard_2000x2000' : 'banner_1584x396'}.svg`
        );
      } else {
        await downloadBannerJpg(
          banner,
          scope,
          `${filename}_${scope === 'artboard' ? 'artboard_2000x2000' : 'banner_1584x396'}_300dpi.jpg`,
          quality
        );
      }
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Export Banner Design
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Live Preview Frame */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Export Preview
            </label>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 overflow-hidden shadow-inner flex items-center justify-center">
              <div
                style={{
                  width: scope === 'artboard' ? '65%' : '100%',
                }}
              >
                <BannerSvgRenderer banner={banner} scope={scope} />
              </div>
            </div>
          </div>

          {/* Scope Selector: Inner Banner vs Artboard */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Export Dimensions & Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScope('banner')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  scope === 'banner'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Inner Banner (Recommended)
                </div>
                <div className="text-[11px] text-indigo-400 font-mono mt-0.5">
                  1584 × 396 px · 4:1 Ratio
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Crop exactly to the customized banner artwork
                </div>
              </button>

              <button
                onClick={() => setScope('artboard')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  scope === 'artboard'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  Full Artboard
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  2000 × 2000 px · 1:1 Square
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Complete artboard with centered banner and margin guides
                </div>
              </button>
            </div>
          </div>

          {/* Format Selector: SVG vs JPG */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('svg')}
                className={`p-3 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  format === 'svg'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <FileCode className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">SVG Vector</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    100% scalable vector. Editable in Illustrator, Inkscape & Figma.
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFormat('jpg')}
                className={`p-3 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  format === 'jpg'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">
                    JPG (300 DPI)
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    High-resolution image with embedded 300 DPI JFIF metadata.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 300 DPI Assurance Box for JPG */}
          {format === 'jpg' && (
            <div className="p-3 bg-neutral-800/70 border border-neutral-700/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>300 DPI Density Injection Active</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                The exported JPEG file is patched with verified JFIF 1.02 density tags (Xdensity: 300, Ydensity: 300, Units: dots per inch). It will open in Photoshop, Illustrator, and print utilities configured at 300 DPI.
              </p>
            </div>
          )}

          {/* Filename Customization */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              File Name
            </label>
            <div className="flex items-center bg-neutral-800 rounded-lg px-3 py-1.5 border border-neutral-700 text-xs font-mono">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-transparent text-white flex-1 outline-none"
              />
              <span className="text-neutral-500">.{format}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 font-mono">
            Output: {targetWidth} × {targetHeight} px · {format.toUpperCase()}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Downloaded Successfully!</span>
                </>
              ) : isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
