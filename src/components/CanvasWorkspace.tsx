import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BannerDocument, BannerElement, ViewMode } from '../types/banner';
import { generateBannerSvgString } from '../utils/svgGenerator';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  Move,
  RotateCw,
  Eye,
  EyeOff,
  Crosshair,
} from 'lucide-react';

interface CanvasWorkspaceProps {
  banner: BannerDocument;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<BannerElement>) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
}

type DragHandleType =
  | 'move'
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate';

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  banner,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  viewMode,
  onChangeViewMode,
  showGrid,
  onToggleGrid,
  showGuides,
  onToggleGuides,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.35);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging & Resizing State
  const [activeHandle, setActiveHandle] = useState<DragHandleType | null>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
    elemRot: number;
  } | null>(null);

  // Exact artboard & banner dimensions
  const artboardW = banner.artboardWidth; // 2000
  const artboardH = banner.artboardHeight; // 2000
  const bannerW = banner.bannerWidth; // 1584
  const bannerH = banner.bannerHeight; // 396

  // Banner offset inside artboard
  const bannerOffsetX = (artboardW - bannerW) / 2; // 208
  const bannerOffsetY = (artboardH - bannerH) / 2; // 802

  // Selected element
  const selectedElement = banner.elements.find((el) => el.id === selectedElementId);

  // Auto-fit function
  const handleFitScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (viewMode === 'banner') {
      const scaleX = (clientWidth - 80) / bannerW;
      const scaleY = (clientHeight - 80) / bannerH;
      const newScale = Math.min(scaleX, scaleY, 0.95);
      setScale(Math.max(0.15, Number(newScale.toFixed(2))));
      setPan({ x: 0, y: 0 });
    } else {
      // Artboard 2000x2000
      const scaleX = (clientWidth - 80) / artboardW;
      const scaleY = (clientHeight - 80) / artboardH;
      const newScale = Math.min(scaleX, scaleY, 0.9);
      setScale(Math.max(0.15, Number(newScale.toFixed(2))));
      setPan({ x: 0, y: 0 });
    }
  }, [viewMode, bannerW, bannerH, artboardW, artboardH]);

  useEffect(() => {
    handleFitScreen();
  }, [viewMode, handleFitScreen]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(1.5, Math.max(0.15, Number(next.toFixed(2))));
    });
  };

  // Convert mouse client coordinates to inner banner coordinate system (0..1584, 0..396)
  const getBannerCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 + pan.x;
    const centerY = rect.height / 2 + pan.y;

    if (viewMode === 'banner') {
      const bannerLeft = centerX - (bannerW * scale) / 2;
      const bannerTop = centerY - (bannerH * scale) / 2;
      const x = (clientX - rect.left - bannerLeft) / scale;
      const y = (clientY - rect.top - bannerTop) / scale;
      return { x, y };
    } else {
      // In Artboard mode, the artboard center is at (centerX, centerY)
      const artboardLeft = centerX - (artboardW * scale) / 2;
      const artboardTop = centerY - (artboardH * scale) / 2;
      const bannerLeft = artboardLeft + bannerOffsetX * scale;
      const bannerTop = artboardTop + bannerOffsetY * scale;
      const x = (clientX - rect.left - bannerLeft) / scale;
      const y = (clientY - rect.top - bannerTop) / scale;
      return { x, y };
    }
  };

  // Mouse handlers for dragging & transforming elements
  const handleMouseDownOnElement = (
    e: React.MouseEvent,
    element: BannerElement,
    handle: DragHandleType = 'move'
  ) => {
    e.stopPropagation();
    if (viewMode === 'preview' || element.locked) return;

    onSelectElement(element.id);
    setActiveHandle(handle);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: element.x,
      elemY: element.y,
      elemW: element.width,
      elemH: element.height,
      elemRot: element.rotation || 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning workspace
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // 2. Dragging/Resizing active element
    if (!activeHandle || !dragStart || !selectedElement || selectedElement.locked) return;

    const dx = (e.clientX - dragStart.mouseX) / scale;
    const dy = (e.clientY - dragStart.mouseY) / scale;

    if (activeHandle === 'move') {
      const newX = Math.round(dragStart.elemX + dx);
      const newY = Math.round(dragStart.elemY + dy);
      onUpdateElement(selectedElement.id, { x: newX, y: newY });
      return;
    }

    if (activeHandle === 'rotate') {
      // Calculate angle from center of element
      const coords = getBannerCoords(e.clientX, e.clientY);
      const angleRad = Math.atan2(coords.y - selectedElement.y, coords.x - selectedElement.x);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      if (angleDeg < 0) angleDeg += 360;
      onUpdateElement(selectedElement.id, { rotation: angleDeg });
      return;
    }

    // Bounding handles resize
    let newW = dragStart.elemW;
    let newH = dragStart.elemH;
    let newX = dragStart.elemX;
    let newY = dragStart.elemY;

    if (activeHandle.includes('e')) {
      newW = Math.max(20, Math.round(dragStart.elemW + dx));
      newX = Math.round(dragStart.elemX + dx / 2);
    }
    if (activeHandle.includes('w')) {
      newW = Math.max(20, Math.round(dragStart.elemW - dx));
      newX = Math.round(dragStart.elemX + dx / 2);
    }
    if (activeHandle.includes('s')) {
      newH = Math.max(20, Math.round(dragStart.elemH + dy));
      newY = Math.round(dragStart.elemY + dy / 2);
    }
    if (activeHandle.includes('n')) {
      newH = Math.max(20, Math.round(dragStart.elemH - dy));
      newY = Math.round(dragStart.elemY + dy / 2);
    }

    onUpdateElement(selectedElement.id, {
      width: newW,
      height: newH,
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setDragStart(null);
    setIsPanning(false);
  };

  // Background SVG string for inner banner
  const bannerSvgString = generateBannerSvgString(banner, {
    scope: 'banner',
    uniquePrefix: `canvas_b_`,
  });

  return (
    <div className="relative flex-1 h-full w-full bg-neutral-950 overflow-hidden select-none flex flex-col">
      {/* Workspace Top Control Ribbon */}
      <div className="h-10 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between z-20 text-xs">
        {/* Left: Dimension Badges & Mode Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => onChangeViewMode('artboard')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'artboard'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Artboard (2000 × 2000)
            </button>
            <button
              onClick={() => onChangeViewMode('banner')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'banner'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Banner Focus (1584 × 396)
            </button>
            <button
              onClick={() => onChangeViewMode('preview')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Live Preview
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-neutral-400">
            <span>Banner: 1584 × 396 px (4:1)</span>
            <span>·</span>
            <span>Artboard: 2000 × 2000 px (1:1)</span>
          </div>
        </div>

        {/* Right: Zoom & Grid Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGrid}
            title="Toggle Grid Overlay"
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-neutral-700 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleGuides}
            title="Toggle Alignment Guides"
            className={`p-1.5 rounded transition-colors ${
              showGuides ? 'bg-neutral-700 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Zoom Buttons */}
          <button
            onClick={() => handleZoom(-0.05)}
            title="Zoom Out"
            className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-neutral-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.05)}
            title="Zoom In"
            className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitScreen}
            title="Fit to Screen"
            className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Viewport Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={(e) => {
          if (e.target === containerRef.current) {
            onSelectElement(null);
            // Middle click or space key initiates pan
            if (e.button === 1 || e.shiftKey) {
              setIsPanning(true);
              setPanStart({ x: e.clientX, y: e.clientY });
            }
          }
        }}
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center checkerboard-pattern cursor-default"
      >
        {/* Transform Container with Pan & Scale */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isPanning || activeHandle ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative"
        >
          {/* VIEW MODE 1: Full 2000x2000 Artboard */}
          {viewMode === 'artboard' && (
            <div
              style={{
                width: `${artboardW}px`,
                height: `${artboardH}px`,
              }}
              className="relative bg-neutral-100 dark:bg-neutral-900 border border-neutral-700/60 shadow-2xl artboard-grid overflow-hidden"
              onClick={() => onSelectElement(null)}
            >
              {/* Artboard Corner Registration Markers */}
              <div className="absolute top-4 left-4 text-xs font-mono text-neutral-500 uppercase tracking-widest pointer-events-none">
                Artboard (2000 × 2000 px) · Origin [0, 0]
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-mono text-neutral-500 uppercase tracking-widest pointer-events-none">
                [2000, 2000] · Center Inner Banner 4:1
              </div>

              {/* Center Alignment Guides */}
              {showGuides && (
                <>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-indigo-500/40 pointer-events-none border-dashed border-l border-indigo-400" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-indigo-500/40 pointer-events-none border-dashed border-t border-indigo-400" />
                </>
              )}

              {/* Inner 1584x396 Banner Container placed in exact center */}
              <div
                style={{
                  position: 'absolute',
                  left: `${bannerOffsetX}px`,
                  top: `${bannerOffsetY}px`,
                  width: `${bannerW}px`,
                  height: `${bannerH}px`,
                }}
                className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-neutral-400/40"
              >
                {/* Banner Dimension Label Badge on Top of Banner */}
                <div className="absolute -top-7 left-0 flex items-center gap-2 text-[11px] font-mono text-neutral-600 bg-white/90 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 rounded shadow-sm border border-neutral-300 dark:border-neutral-700 pointer-events-none">
                  <span>Inner Banner: 1584 × 396 px</span>
                  <span className="text-indigo-500 font-semibold">(Target Export Area)</span>
                </div>

                {/* Banner Render Surface */}
                <div
                  className="w-full h-full relative overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: bannerSvgString }}
                />

                {/* Interactive Clickable Overlay Elements (For Selection and Moving) */}
                <div className="absolute inset-0 pointer-events-none">
                    {banner.elements.map((el) => {
                      if (!el.visible) return null;
                      const isSelected = el.id === selectedElementId;
                      return (
                        <div
                          key={el.id}
                          style={{
                            position: 'absolute',
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            width: `${el.width}px`,
                            height: `${el.height}px`,
                            transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                          }}
                          onMouseDown={(e) => handleMouseDownOnElement(e, el, 'move')}
                          className={`pointer-events-auto cursor-move transition-colors rounded ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black/50'
                              : 'hover:ring-1 hover:ring-indigo-400/60'
                          }`}
                        />
                      );
                    })}

                    {/* Active Selected Element Bounding Box with 8 Resize Handles + Rotation Pin */}
                    {selectedElement && !selectedElement.locked && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${selectedElement.x}px`,
                          top: `${selectedElement.y}px`,
                          width: `${selectedElement.width}px`,
                          height: `${selectedElement.height}px`,
                          transform: `translate(-50%, -50%) rotate(${selectedElement.rotation || 0}deg)`,
                        }}
                        className="pointer-events-none border-2 border-indigo-500 z-30"
                      >
                        {/* Rotation Handle on Top */}
                        <div
                          onMouseDown={(e) =>
                            handleMouseDownOnElement(e, selectedElement, 'rotate')
                          }
                          className="pointer-events-auto absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-grab shadow-md hover:scale-110 transition-transform"
                          title="Rotate Element"
                        >
                          <RotateCw className="w-3 h-3" />
                        </div>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-indigo-500" />

                        {/* 8 Bounding Resize Handles */}
                        {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => {
                          const cursorMap: Record<string, string> = {
                            nw: 'nwse-resize',
                            se: 'nwse-resize',
                            ne: 'nesw-resize',
                            sw: 'nesw-resize',
                            n: 'ns-resize',
                            s: 'ns-resize',
                            e: 'ew-resize',
                            w: 'ew-resize',
                          };
                          const posClasses: Record<string, string> = {
                            nw: '-top-1.5 -left-1.5',
                            n: '-top-1.5 left-1/2 -translate-x-1/2',
                            ne: '-top-1.5 -right-1.5',
                            e: 'top-1/2 -right-1.5 -translate-y-1/2',
                            se: '-bottom-1.5 -right-1.5',
                            s: '-bottom-1.5 left-1/2 -translate-x-1/2',
                            sw: '-bottom-1.5 -left-1.5',
                            w: 'top-1/2 -left-1.5 -translate-y-1/2',
                          };
                          return (
                            <div
                              key={h}
                              onMouseDown={(e) =>
                                handleMouseDownOnElement(
                                  e,
                                  selectedElement,
                                  h as DragHandleType
                                )
                              }
                              style={{ cursor: cursorMap[h] }}
                              className={`pointer-events-auto absolute ${posClasses[h]} w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow-sm hover:bg-indigo-100 z-40`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Banner Focus & Live Preview (1584x396 Direct) */}
          {(viewMode === 'banner' || viewMode === 'preview') && (
            <div
              style={{
                width: `${bannerW}px`,
                height: `${bannerH}px`,
              }}
              className="relative shadow-2xl rounded-none border border-neutral-700/60 overflow-hidden"
              onClick={() => onSelectElement(null)}
            >
              {/* Inner Banner SVG Rendering */}
              <div
                className="w-full h-full relative"
                dangerouslySetInnerHTML={{ __html: bannerSvgString }}
              />

              {/* Grid Overlay if enabled */}
              {showGrid && (
                <div className="absolute inset-0 artboard-grid pointer-events-none opacity-40" />
              )}

              {/* Center crosshair guides */}
              {showGuides && (
                <>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-indigo-500/40 pointer-events-none border-dashed border-l border-indigo-400" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-indigo-500/40 pointer-events-none border-dashed border-t border-indigo-400" />
                </>
              )}

              {/* Interactive Elements Overlay */}
              {viewMode !== 'preview' && (
                <div className="absolute inset-0 pointer-events-none">
                  {banner.elements.map((el) => {
                    if (!el.visible) return null;
                    const isSelected = el.id === selectedElementId;
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                        }}
                        onMouseDown={(e) => handleMouseDownOnElement(e, el, 'move')}
                        className={`pointer-events-auto cursor-move transition-colors rounded ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black/50'
                            : 'hover:ring-1 hover:ring-indigo-400/60'
                        }`}
                      />
                    );
                  })}

                  {/* Active Selected Element Handles in Banner Mode */}
                  {selectedElement && !selectedElement.locked && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${selectedElement.x}px`,
                        top: `${selectedElement.y}px`,
                        width: `${selectedElement.width}px`,
                        height: `${selectedElement.height}px`,
                        transform: `translate(-50%, -50%) rotate(${selectedElement.rotation || 0}deg)`,
                      }}
                      className="pointer-events-none border-2 border-indigo-500 z-30"
                    >
                      {/* Rotate Handle */}
                      <div
                        onMouseDown={(e) =>
                          handleMouseDownOnElement(e, selectedElement, 'rotate')
                        }
                        className="pointer-events-auto absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-grab shadow-md hover:scale-110 transition-transform"
                        title="Rotate Element"
                      >
                        <RotateCw className="w-3 h-3" />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-indigo-500" />

                      {/* 8 Resize Handles */}
                      {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => {
                        const posClasses: Record<string, string> = {
                          nw: '-top-1.5 -left-1.5',
                          n: '-top-1.5 left-1/2 -translate-x-1/2',
                          ne: '-top-1.5 -right-1.5',
                          e: 'top-1/2 -right-1.5 -translate-y-1/2',
                          se: '-bottom-1.5 -right-1.5',
                          s: '-bottom-1.5 left-1/2 -translate-x-1/2',
                          sw: '-bottom-1.5 -left-1.5',
                          w: 'top-1/2 -left-1.5 -translate-y-1/2',
                        };
                        return (
                          <div
                            key={h}
                            onMouseDown={(e) =>
                              handleMouseDownOnElement(
                                e,
                                selectedElement,
                                h as DragHandleType
                              )
                            }
                            className={`pointer-events-auto absolute ${posClasses[h]} w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow-sm hover:bg-indigo-100 z-40`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
