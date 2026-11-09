import React from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  Maximize2,
  FileCode,
  Sparkles,
  Check,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Studio Guide & Shortcuts
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {/* Section 1: Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Maximize2 className="w-4 h-4 text-indigo-400" />
              <span>Canvas & Banner Geometry</span>
            </div>
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Main Artboard:</span>
                <span className="text-white font-mono font-medium">2000 × 2000 px (1:1 Square)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Inner Banner Design:</span>
                <span className="text-indigo-400 font-mono font-semibold">1584 × 396 px (4:1 Aspect Ratio)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Centering Margins:</span>
                <span className="text-neutral-300 font-mono">X: 208 px · Y: 802 px</span>
              </div>
              <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80 leading-relaxed">
                The inner banner is the active design canvas. All templates and exports maintain exact pixel precision without distortion.
              </p>
            </div>
          </div>

          {/* Section 2: Keyboard Shortcuts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'Ctrl / Cmd + Z', label: 'Undo change' },
                { key: 'Ctrl / Cmd + Y', label: 'Redo change' },
                { key: 'Ctrl / Cmd + D', label: 'Duplicate selected element' },
                { key: 'Delete / Backspace', label: 'Delete selected element' },
                { key: 'Arrow Keys', label: 'Nudge element by 1 px' },
                { key: 'Shift + Arrow Keys', label: 'Nudge element by 10 px' },
                { key: 'Shift + Mouse Drag', label: 'Pan across canvas' },
                { key: 'Escape', label: 'Deselect all elements' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between"
                >
                  <span className="text-neutral-400 text-[11px]">{s.label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-neutral-200">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Professional Exports */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Export Standards</span>
            </div>
            <div className="space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">SVG Vector Export:</strong> Valid, clean, self-contained SVG XML format. Retains all gradients, paths, drop shadows, and text coordinates for Adobe Illustrator & Figma.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">JPG 300 DPI Export:</strong> Rendered directly onto an HTML5 Canvas at exact 1584 × 396 pixels with authentic JFIF 300 DPI metadata injection. Suitable for high-resolution digital media and professional offset printing.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
