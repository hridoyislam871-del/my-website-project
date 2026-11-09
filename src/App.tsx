import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BannerDocument,
  BannerElement,
  ActiveTab,
  ViewMode,
} from './types/banner';
import { PRESET_TEMPLATES } from './templates/presetTemplates';
import { ColorPalette } from './palettes/colorPalettes';
import {
  loadSavedDesigns,
  saveDesignToStorage,
  deleteDesignFromStorage,
  loadFavorites,
  toggleFavoriteInStorage,
} from './utils/storageUtils';
import { downloadBannerSvg, downloadBannerJpg } from './utils/exportUtils';
import { TopNav, MainNavTab } from './components/TopNav';
import { EditorToolbar } from './components/EditorToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { TemplatesGallery } from './components/TemplatesGallery';
import { HomeView } from './components/HomeView';
import { SavedDesignsView } from './components/SavedDesignsView';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { BatchExportModal } from './components/BatchExportModal';

export default function App() {
  // Navigation
  const [currentNavTab, setCurrentNavTab] = useState<MainNavTab>('editor');

  // All 10 Templates (Supports user edits, text deletions, additions per template)
  const [customizedTemplates, setCustomizedTemplates] = useState<BannerDocument[]>(() => {
    try {
      const stored = localStorage.getItem('studio_customized_templates_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return JSON.parse(JSON.stringify(PRESET_TEMPLATES));
  });

  // Track ID of currently active template
  const [activeTemplateId, setActiveTemplateId] = useState<string>(PRESET_TEMPLATES[0].id);

  // Active Banner Document (initialized from first customized template)
  const [banner, setBanner] = useState<BannerDocument>(() => {
    try {
      const stored = localStorage.getItem('studio_customized_templates_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          return JSON.parse(JSON.stringify(parsed[0]));
        }
      }
    } catch (e) {
      // ignore
    }
    return JSON.parse(JSON.stringify(PRESET_TEMPLATES[0]));
  });

  // Undo / Redo History Stack
  const [history, setHistory] = useState<BannerDocument[]>([
    JSON.parse(JSON.stringify(PRESET_TEMPLATES[0])),
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Editor Sub-tabs & Tools
  const [activeSidebarTab, setActiveSidebarTab] = useState<ActiveTab>('templates');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('artboard');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);

  // Storage State
  const [savedDesigns, setSavedDesigns] = useState<BannerDocument[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSavedJustNow, setIsSavedJustNow] = useState<boolean>(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isBatchExportModalOpen, setIsBatchExportModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Initialize storage
  useEffect(() => {
    setSavedDesigns(loadSavedDesigns());
    setFavorites(loadFavorites());
  }, []);

  // Keep active template synchronized in customizedTemplates
  const syncToCustomizedTemplates = useCallback(
    (currentBanner: BannerDocument) => {
      setCustomizedTemplates((prev) => {
        const idx = prev.findIndex(
          (t) => t.id === currentBanner.id || t.name === currentBanner.name
        );
        let next: BannerDocument[];
        if (idx >= 0) {
          next = [...prev];
          next[idx] = JSON.parse(JSON.stringify(currentBanner));
        } else {
          const matchActive = prev.findIndex((t) => t.id === activeTemplateId);
          if (matchActive >= 0) {
            next = [...prev];
            next[matchActive] = JSON.parse(JSON.stringify(currentBanner));
          } else {
            next = prev;
          }
        }
        try {
          localStorage.setItem('studio_customized_templates_v2', JSON.stringify(next));
        } catch (err) {
          // ignore
        }
        return next;
      });
    },
    [activeTemplateId]
  );

  // Record history snapshot helper
  const recordHistory = useCallback(
    (newBanner: BannerDocument) => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, JSON.parse(JSON.stringify(newBanner))];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Update banner state with history & template sync
  const handleUpdateBanner = useCallback(
    (updates: Partial<BannerDocument>, pushToHistory: boolean = true) => {
      setBanner((prev) => {
        const next = { ...prev, ...updates, updatedAt: Date.now() };
        if (pushToHistory) {
          recordHistory(next);
        }
        syncToCustomizedTemplates(next);
        return next;
      });
    },
    [recordHistory, syncToCustomizedTemplates]
  );

  // Update a single element
  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<BannerElement>) => {
      setBanner((prev) => {
        const nextElements = prev.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as BannerElement) : el
        );
        const next = { ...prev, elements: nextElements, updatedAt: Date.now() };
        syncToCustomizedTemplates(next);
        return next;
      });
    },
    [syncToCustomizedTemplates]
  );

  // Load a template (loads customized version if modified, keeping text & shapes)
  const handleLoadTemplate = useCallback(
    (template: BannerDocument) => {
      const match =
        customizedTemplates.find((t) => t.id === template.id || t.name === template.name) ||
        template;
      const cloned = JSON.parse(JSON.stringify(match));
      setActiveTemplateId(template.id);
      setBanner(cloned);
      setSelectedElementId(null);
      setHistory([JSON.parse(JSON.stringify(cloned))]);
      setHistoryIndex(0);
      setCurrentNavTab('editor');
      showToast(`Loaded "${template.name}" template`);
    },
    [customizedTemplates, showToast]
  );

  // Reset a template to original factory preset
  const handleResetTemplate = useCallback(
    (templateId: string) => {
      const original = PRESET_TEMPLATES.find((t) => t.id === templateId);
      if (!original) return;
      const cleanClone = JSON.parse(JSON.stringify(original));
      setCustomizedTemplates((prev) => {
        const idx = prev.findIndex((t) => t.id === templateId);
        let next = [...prev];
        if (idx >= 0) {
          next[idx] = cleanClone;
        }
        try {
          localStorage.setItem('studio_customized_templates_v2', JSON.stringify(next));
        } catch (e) {
          // ignore
        }
        return next;
      });
      if (banner.id === templateId || activeTemplateId === templateId) {
        setBanner(cleanClone);
        setSelectedElementId(null);
        setHistory([JSON.parse(JSON.stringify(cleanClone))]);
        setHistoryIndex(0);
      }
      showToast(`Reset "${original.name}" to default preset`);
    },
    [banner.id, activeTemplateId, showToast]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const snapshot = JSON.parse(JSON.stringify(history[prevIndex]));
      setBanner(snapshot);
      setHistoryIndex(prevIndex);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const snapshot = JSON.parse(JSON.stringify(history[nextIndex]));
      setBanner(snapshot);
      setHistoryIndex(nextIndex);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  // Add Element
  const handleAddElement = useCallback(
    (element: BannerElement) => {
      setBanner((prev) => {
        const next = {
          ...prev,
          elements: [...prev.elements, element],
          updatedAt: Date.now(),
        };
        recordHistory(next);
        syncToCustomizedTemplates(next);
        return next;
      });
      setSelectedElementId(element.id);
      showToast(`Added ${element.name}`);
    },
    [recordHistory, syncToCustomizedTemplates, showToast]
  );

  // Delete Element
  const handleDeleteElement = useCallback(
    (id: string) => {
      setBanner((prev) => {
        const next = {
          ...prev,
          elements: prev.elements.filter((el) => el.id !== id),
          updatedAt: Date.now(),
        };
        recordHistory(next);
        syncToCustomizedTemplates(next);
        return next;
      });
      setSelectedElementId(null);
      showToast('Element deleted');
    },
    [recordHistory, syncToCustomizedTemplates, showToast]
  );

  // Duplicate Element
  const handleDuplicateElement = useCallback((targetId?: string) => {
    const idToDuplicate = targetId || selectedElementId;
    if (!idToDuplicate) return;
    const target = banner.elements.find((el) => el.id === idToDuplicate);
    if (!target) return;

    const cloned: BannerElement = JSON.parse(JSON.stringify(target));
    cloned.id = `${cloned.type}_${Date.now()}`;
    cloned.name = `${cloned.name} (Copy)`;
    cloned.x = Math.min(banner.bannerWidth - 100, cloned.x + 30);
    cloned.y = Math.min(banner.bannerHeight - 40, cloned.y + 20);

    setBanner((prev) => {
      const next = {
        ...prev,
        elements: [...prev.elements, cloned],
        updatedAt: Date.now(),
      };
      recordHistory(next);
      syncToCustomizedTemplates(next);
      return next;
    });
    setSelectedElementId(cloned.id);
    showToast('Element duplicated');
  }, [selectedElementId, banner, recordHistory, syncToCustomizedTemplates, showToast]);

  // Lock / Unlock
  const handleToggleLockElement = useCallback(() => {
    if (!selectedElementId) return;
    const target = banner.elements.find((el) => el.id === selectedElementId);
    if (!target) return;
    handleUpdateElement(selectedElementId, { locked: !target.locked });
    showToast(target.locked ? 'Element unlocked' : 'Element locked');
  }, [selectedElementId, banner.elements, handleUpdateElement, showToast]);

  // Reorder Elements (Layers)
  const handleReorderElements = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= banner.elements.length) return;
      const nextElements = [...banner.elements];
      const [moved] = nextElements.splice(fromIndex, 1);
      nextElements.splice(toIndex, 0, moved);

      setBanner((prev) => {
        const next = { ...prev, elements: nextElements, updatedAt: Date.now() };
        recordHistory(next);
        syncToCustomizedTemplates(next);
        return next;
      });
    },
    [banner.elements, recordHistory, syncToCustomizedTemplates]
  );

  // Alignment
  const handleAlignElement = useCallback(
    (
      alignment:
        | 'left'
        | 'center'
        | 'right'
        | 'top'
        | 'middle'
        | 'bottom'
        | 'center-both'
    ) => {
      if (!selectedElementId) return;
      const target = banner.elements.find((el) => el.id === selectedElementId);
      if (!target) return;

      const updates: Partial<BannerElement> = {};
      if (alignment === 'left') updates.x = target.width / 2 + 30;
      if (alignment === 'center') updates.x = banner.bannerWidth / 2;
      if (alignment === 'right') updates.x = banner.bannerWidth - target.width / 2 - 30;
      if (alignment === 'top') updates.y = target.height / 2 + 20;
      if (alignment === 'middle') updates.y = banner.bannerHeight / 2;
      if (alignment === 'bottom') updates.y = banner.bannerHeight - target.height / 2 - 20;
      if (alignment === 'center-both') {
        updates.x = banner.bannerWidth / 2;
        updates.y = banner.bannerHeight / 2;
      }

      handleUpdateElement(selectedElementId, updates);
    },
    [selectedElementId, banner, handleUpdateElement]
  );

  // Apply Designer Palette
  const handleApplyPalette = useCallback(
    (palette: ColorPalette) => {
      const colors = palette.colors;
      if (colors.length < 3) return;

      const newBgStops = [
        { offset: 0, color: colors[0] },
        { offset: 0.5, color: colors[1] },
        { offset: 1, color: colors[2] },
      ];

      // Update background and recolor shapes
      const nextElements = banner.elements.map((el, i) => {
        if (el.type === 'text') {
          // If dark background, use light colors; if light background, use dark colors
          const isDarkTheme = palette.category === 'dark' || palette.category === 'luxury';
          return {
            ...el,
            fill: isDarkTheme ? (i === 0 ? '#ffffff' : colors[3] || '#e2e8f0') : colors[0],
          };
        }
        if (el.type === 'shape') {
          return {
            ...el,
            fill: el.shapeType === 'ring' ? 'transparent' : colors[2] || colors[1],
            stroke: el.shapeType === 'ring' ? colors[3] || colors[2] : el.stroke,
          };
        }
        if (el.type === 'abstract') {
          return {
            ...el,
            primaryColor: colors[2] || colors[1],
            secondaryColor: colors[3] || colors[0],
          };
        }
        return el;
      });

      const nextBanner: BannerDocument = {
        ...banner,
        background: {
          ...banner.background,
          color: colors[0],
          gradientStops: newBgStops,
          patternColor: colors[3] || '#ffffff',
          glowColor: colors[2] || colors[1],
        },
        elements: nextElements,
        updatedAt: Date.now(),
      };

      setBanner(nextBanner);
      recordHistory(nextBanner);
      showToast(`Applied "${palette.name}" palette`);
    },
    [banner, recordHistory, showToast]
  );

  // Save design to localStorage
  const handleSaveDesign = useCallback(() => {
    saveDesignToStorage(banner);
    setSavedDesigns(loadSavedDesigns());
    setIsSavedJustNow(true);
    showToast(`Saved "${banner.name}" to My Designs`);
    setTimeout(() => {
      setIsSavedJustNow(false);
    }, 2500);
  }, [banner, showToast]);

  // Favorites toggle
  const handleToggleFavorite = useCallback(
    (id: string) => {
      const isNowFav = toggleFavoriteInStorage(id);
      setFavorites(loadFavorites());
      showToast(isNowFav ? 'Added to favorites' : 'Removed from favorites');
    },
    [showToast]
  );

  // Quick SVG Export
  const handleQuickExportSvg = useCallback(
    async (targetBanner: BannerDocument) => {
      try {
        await downloadBannerSvg(targetBanner, 'banner');
        showToast(`Downloaded ${targetBanner.name} (SVG Vector 1584×396)`);
      } catch (err) {
        showToast('SVG download error');
      }
    },
    [showToast]
  );

  // Quick JPG Export
  const handleQuickExportJpg = useCallback(
    async (targetBanner: BannerDocument) => {
      try {
        await downloadBannerJpg(targetBanner, 'banner');
        showToast(`Downloaded ${targetBanner.name} (JPG 1584×396 @ 300 DPI)`);
      } catch (err) {
        showToast('JPG download error');
      }
    },
    [showToast]
  );

  // Start new blank design
  const handleCreateNew = useCallback(() => {
    const blank: BannerDocument = {
      id: `custom_${Date.now()}`,
      name: 'Untitled Abstract Banner',
      category: 'Custom',
      description: 'Custom abstract banner design created from scratch',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artboardWidth: 2000,
      artboardHeight: 2000,
      bannerWidth: 1584,
      bannerHeight: 396,
      background: {
        type: 'linear-gradient',
        color: '#0a0f1d',
        gradientAngle: 120,
        gradientStops: [
          { offset: 0, color: '#030712' },
          { offset: 0.5, color: '#1e1b4b' },
          { offset: 1, color: '#312e81' },
        ],
        pattern: 'dots',
        patternOpacity: 0.2,
        patternColor: '#818cf8',
        patternScale: 1,
        glowEffect: true,
        glowColor: '#6366f1',
        glowIntensity: 0.5,
        blur: 0,
      },
      elements: [
        {
          id: `title_${Date.now()}`,
          name: 'Main Title',
          type: 'text',
          x: 792,
          y: 198,
          width: 800,
          height: 60,
          rotation: 0,
          opacity: 1,
          text: 'NEW ABSTRACT BANNER',
          fontFamily: 'Outfit',
          fontSize: 48,
          fontWeight: 700,
          fill: '#ffffff',
          textAlign: 'center',
          letterSpacing: 8,
          lineHeight: 1.1,
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: 14,
        },
      ],
    };

    setBanner(blank);
    setSelectedElementId(blank.elements[0].id);
    setHistory([JSON.parse(JSON.stringify(blank))]);
    setHistoryIndex(0);
    setCurrentNavTab('editor');
    showToast('New banner artboard created');
  }, [showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateElement();
        return;
      }

      // Delete: Backspace or Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        return;
      }

      // Arrow keys to nudge selected element
      if (selectedElementId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const current = banner.elements.find((el) => el.id === selectedElementId);
        if (!current || current.locked) return;

        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;

        handleUpdateElement(selectedElementId, {
          x: current.x + dx,
          y: current.y + dy,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleDuplicateElement,
    handleDeleteElement,
    selectedElementId,
    banner.elements,
    handleUpdateElement,
  ]);

  const selectedElement = banner.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* 1. Universal Top Navigation Bar */}
      <TopNav
        currentTab={currentNavTab}
        onSelectTab={(tab) => {
          if (tab === 'help') {
            setIsHelpModalOpen(true);
          } else {
            setCurrentNavTab(tab);
          }
        }}
        bannerName={banner.name}
        onExportSvg={() => setIsExportModalOpen(true)}
        onExportJpg={() => setIsExportModalOpen(true)}
        onNewDesign={handleCreateNew}
        onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
      />

      {/* 2. Main Content View Router */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: HOME OVERVIEW */}
        {currentNavTab === 'home' && (
          <HomeView
            templates={customizedTemplates}
            onOpenEditor={() => setCurrentNavTab('editor')}
            onBrowseTemplates={() => setCurrentNavTab('templates')}
            onSelectTemplate={handleLoadTemplate}
            onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
          />
        )}

        {/* VIEW 2: TEMPLATES FULL GALLERY */}
        {currentNavTab === 'templates' && (
          <TemplatesGallery
            templates={customizedTemplates}
            onSelectTemplate={handleLoadTemplate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onQuickExportSvg={handleQuickExportSvg}
            onQuickExportJpg={handleQuickExportJpg}
            onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
          />
        )}

        {/* VIEW 3: SAVED PROJECTS */}
        {currentNavTab === 'saved' && (
          <SavedDesignsView
            savedDesigns={savedDesigns}
            onOpenDesign={(design) => {
              setBanner(JSON.parse(JSON.stringify(design)));
              setSelectedElementId(null);
              setHistory([JSON.parse(JSON.stringify(design))]);
              setHistoryIndex(0);
              setCurrentNavTab('editor');
              showToast(`Opened "${design.name}"`);
            }}
            onDeleteDesign={(id) => {
              deleteDesignFromStorage(id);
              setSavedDesigns(loadSavedDesigns());
              showToast('Design deleted');
            }}
            onDuplicateDesign={(design) => {
              const duplicate: BannerDocument = {
                ...JSON.parse(JSON.stringify(design)),
                id: `dup_${Date.now()}`,
                name: `${design.name} (Copy)`,
                updatedAt: Date.now(),
              };
              saveDesignToStorage(duplicate);
              setSavedDesigns(loadSavedDesigns());
              showToast('Design duplicated');
            }}
            onRenameDesign={(id, newName) => {
              const target = savedDesigns.find((d) => d.id === id);
              if (target) {
                const updated = { ...target, name: newName, updatedAt: Date.now() };
                saveDesignToStorage(updated);
                setSavedDesigns(loadSavedDesigns());
                showToast('Design renamed');
              }
            }}
            onCreateNew={handleCreateNew}
            onQuickExportSvg={handleQuickExportSvg}
            onQuickExportJpg={handleQuickExportJpg}
          />
        )}

        {/* VIEW 4: INTERACTIVE EDITOR STUDIO WORKSPACE */}
        {currentNavTab === 'editor' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Editor Sub-Toolbar */}
            <EditorToolbar
              bannerName={banner.name}
              onRenameBanner={(newName) => handleUpdateBanner({ name: newName })}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              selectedElement={selectedElement}
              onDuplicateElement={handleDuplicateElement}
              onDeleteElement={() => selectedElementId && handleDeleteElement(selectedElementId)}
              onToggleLockElement={handleToggleLockElement}
              onAlignElement={handleAlignElement}
              viewMode={viewMode}
              onTogglePreview={() =>
                setViewMode((prev) => (prev === 'preview' ? 'artboard' : 'preview'))
              }
              onSaveDesign={handleSaveDesign}
              isSavedJustNow={isSavedJustNow}
              onExportSvg={() => setIsExportModalOpen(true)}
              onExportJpg={() => setIsExportModalOpen(true)}
              onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
            />

            {/* 3-Column Studio Layout */}
            <div className="flex-1 flex h-full overflow-hidden">
              {/* Left Sidebar (Tools, Presets, Layers, Shapes) */}
              {viewMode !== 'preview' && (
                <LeftSidebar
                  activeTab={activeSidebarTab}
                  onChangeTab={setActiveSidebarTab}
                  banner={banner}
                  templates={customizedTemplates}
                  onUpdateBanner={handleUpdateBanner}
                  onLoadTemplate={handleLoadTemplate}
                  onResetTemplate={handleResetTemplate}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onAddElement={handleAddElement}
                  onDeleteElement={handleDeleteElement}
                  onReorderElements={handleReorderElements}
                  onApplyPalette={handleApplyPalette}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Center Canvas (2000x2000 Artboard + 1584x396 Banner) */}
              <CanvasWorkspace
                banner={banner}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid((p) => !p)}
                showGuides={showGuides}
                onToggleGuides={() => setShowGuides((p) => !p)}
              />

              {/* Right Sidebar (Contextual Inspector) */}
              {viewMode !== 'preview' && (
                <RightSidebar
                  banner={banner}
                  selectedElement={selectedElement}
                  onUpdateElement={handleUpdateElement}
                  onUpdateBanner={handleUpdateBanner}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateElement={handleDuplicateElement}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Single Banner Export Dialog Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        banner={banner}
      />

      {/* Batch Export All 10 Designs Modal */}
      <BatchExportModal
        isOpen={isBatchExportModalOpen}
        onClose={() => setIsBatchExportModalOpen(false)}
        templates={customizedTemplates}
      />

      {/* Help & Guide Dialog Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Floating Status Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700/80 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
