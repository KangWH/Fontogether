"use client";

import { act, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { Panel, Group } from "react-resizable-panels";
import { SelectionArea, SelectionEvent } from "@viselect/react";
import { ChevronLeft, Circle, Fullscreen, Hand, MousePointer2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, PenTool, RectangleHorizontal, RulerDimensionLine, Search, SplinePointer, Users, ZoomIn, ZoomOut, Settings, Ligature } from "lucide-react";

import Topbar from "@/components/topbar";
import Spacer from "@/components/spacer";
import TopbarButton, { TopbarButtonGroup, TopbarGroupedButton } from "@/components/topbarButton";
import GlyphPreview from "@/components/glyphPreview";
import GlyphGrid from "@/components/glyphGrid";
import GlyphViewControls from "@/components/glyphViewControls";
import FilterSidebar from "@/components/filterSidebar";
import FontPropertiesPanel from "@/components/fontPropertiesPanel";
import GlyphPropertiesPanel from "@/components/glyphPropertiesPanel";
import PreviewPanel from "@/components/previewPanel";
import OpenTypeFeaturePanel from "@/components/opentypeFeaturePanel";
import CollaboratePanel from "@/components/collaboratorPanel";
import { FontData, GlyphData, SortOption, FilterCategory, ColorTag } from "@/types/font";
import { createMockFontData } from "@/utils/mockData";
import { Plus, Trash2, ChevronDown } from "lucide-react";

const DynamicGlyphCanvas = dynamic(() => import('@/components/glyphEditor'), {
  ssr: false,
  loading: () => <p>캔버스 로드 중...</p>,
});

export default function GlyphsView() {
  const router = useRouter();

  // --- Font Data ---
  const [fontData, setFontData] = useState<FontData>(createMockFontData());
  const [clipboardGlyphs, setClipboardGlyphs] = useState<GlyphData[]>([]);

  // --- Sidebar State ---
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // --- Zoom State ---
  const [zoomAction, setZoomAction] = useState<{ type: 'IN' | 'OUT' | 'RESET'; timestamp: number; } | null>(null);

  // --- Toolbar State ---
  const [selectedTool, setSelectedTool] = useState("pointer");

  // --- Glyph View State ---
  const [glyphSize, setGlyphSize] = useState(120);
  const [sortOption, setSortOption] = useState<SortOption>('index');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('none');
  const [filterValue, setFilterValue] = useState<string>('');

  // --- Right Sidebar Panel State ---
  const [rightPanel, setRightPanel] = useState<'font' | 'glyph' | 'collaborate'>('font');
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // --- Selection Logic ---
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const handleSelectionChange = useCallback((ids: Set<number>) => {
    setSelectedIds(ids);
  }, []);

  // --- Opened tabs ---
  const [openedTabs, setOpenedTabs] = useState<(number | null)[]>([null]) // null for main window
  const [activeTab, setActiveTab] = useState<number | null>(null) // null for main window

  const openTab = (id: number, setActive: boolean = true) => {
    // 이미 열려 있는 탭인지 확인
    if (openedTabs.includes(id)) {
      if (setActive) {
        setActiveTab(id);
      }
      return;
    }
    setOpenedTabs(prev => {
      return [...prev, id]
    })
    if (setActive) {
      setActiveTab(id)
    }
  };
  const closeTab = (id: number) => {
  setOpenedTabs((prevTabs) => {
    const newTabs = prevTabs.filter((tabId) => tabId !== id);

    if (activeTab === id) {
      if (newTabs.length > 0) {
        const currentIndex = prevTabs.indexOf(id);
        const nextTab = newTabs[Math.max(currentIndex - 1, 0)];
        setActiveTab(nextTab);
      } else {
        setActiveTab(null);
      }
    }
    
    return newTabs; // 새로운 주소의 배열을 반환하여 뷰 갱신 트리거
  });
};

  const switchTab = (id: number | null) => {
    setActiveTab(id)
  }

  // --- Available tags and groups ---
  const availableTags = useMemo(() => {
    const tags = new Set<ColorTag>();
    fontData.glyphs.forEach(g => g.tags?.forEach(t => tags.add(t as ColorTag)));
    return Array.from(tags);
  }, [fontData.glyphs]);

  const availableGroups = useMemo(() => {
    return Object.keys(fontData.groups || {});
  }, [fontData.groups]);

  // --- Glyph operations ---
  const handleAddGlyph = useCallback(() => {
    const newId = Math.max(...fontData.glyphs.map(g => g.id), -1) + 1;
    const newGlyph: GlyphData = {
      id: newId,
      name: `glyph${newId}`,
      advanceWidth: 500,
      lsb: 50,
      rsb: 50,
    };
    setFontData(prev => ({
      ...prev,
      glyphs: [...prev.glyphs, newGlyph],
    }));
  }, [fontData.glyphs]);

  const handleDuplicateGlyph = useCallback(() => {
    if (selectedIds.size === 0) return;
    const newGlyphs = Array.from(selectedIds).map(id => {
      const glyph = fontData.glyphs.find(g => g.id === id);
      if (!glyph) return null;
      const newId = Math.max(...fontData.glyphs.map(g => g.id), -1) + 1;
      return { ...glyph, id: newId, name: `${glyph.name}.copy` };
    }).filter((g): g is GlyphData => g !== null);
    setFontData(prev => ({
      ...prev,
      glyphs: [...prev.glyphs, ...newGlyphs],
    }));
  }, [selectedIds, fontData.glyphs]);

  const handleDeleteGlyph = useCallback(() => {
    if (selectedIds.size === 0) return;
    const deletedIds = Array.from(selectedIds);
    setFontData(prev => ({
      ...prev,
      glyphs: prev.glyphs.filter(g => !selectedIds.has(g.id)),
    }));
    setSelectedIds(new Set());
    // 열려 있는 탭 닫기
    deletedIds.forEach(id => {
      if (openedTabs.includes(id)) {
        closeTab(id);
      }
    });
  }, [selectedIds, openedTabs]);

  const handleCutGlyph = useCallback(() => {
    const selectedGlyphs = fontData.glyphs.filter(g => selectedIds.has(g.id));
    setClipboardGlyphs(selectedGlyphs);
    handleDeleteGlyph();
  }, [selectedIds, fontData.glyphs, handleDeleteGlyph]);

  const handleCopyGlyph = useCallback(() => {
    const selectedGlyphs = fontData.glyphs.filter(g => selectedIds.has(g.id));
    setClipboardGlyphs(selectedGlyphs);
  }, [selectedIds, fontData.glyphs]);

  const handlePasteGlyph = useCallback((newSlot: boolean = false) => {
    if (clipboardGlyphs.length === 0) return;
    if (newSlot) {
      const newGlyphs = clipboardGlyphs.map((glyph, idx) => {
        const newId = Math.max(...fontData.glyphs.map(g => g.id), -1) + 1 + idx;
        return { ...glyph, id: newId, name: `${glyph.name}.copy` };
      });
      setFontData(prev => ({
        ...prev,
        glyphs: [...prev.glyphs, ...newGlyphs],
      }));
    } else {
      // 선택된 글리프에 붙여넣기 (첫 번째 글리프만)
      if (selectedIds.size === 0) return;
      const targetId = Array.from(selectedIds)[0];
      const sourceGlyph = clipboardGlyphs[0];
      setFontData(prev => ({
        ...prev,
        glyphs: prev.glyphs.map(g => g.id === targetId ? { ...sourceGlyph, id: targetId, name: g.name } : g),
      }));
    }
  }, [clipboardGlyphs, fontData.glyphs, selectedIds]);

  const handleGlyphReorder = useCallback((newOrder: number[]) => {
    const orderedGlyphs = newOrder.map(id => fontData.glyphs.find(g => g.id === id)).filter((g): g is GlyphData => g !== undefined);
    const remainingGlyphs = fontData.glyphs.filter(g => !newOrder.includes(g.id));
    setFontData(prev => ({
      ...prev,
      glyphs: [...orderedGlyphs, ...remainingGlyphs],
    }));
  }, [fontData.glyphs]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 텍스트 필드에 포커스가 있을 때는 단축키 비활성화
      const activeElement = document.activeElement;
      const isTextInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      const isTextInputFocused = isTextInput && document.activeElement === activeElement;

      // 방향키로 선택 이동 (텍스트 필드가 아닐 때만)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !cmdOrCtrl && !e.shiftKey && activeTab === null && !isTextInputFocused) {
        e.preventDefault();
        // TODO: 선택된 글리프 이동 구현
      }

      // Return: 선택된 글리프 열기
      if (e.key === 'Enter' && activeTab === null && selectedIds.size > 0 && !isTextInputFocused) {
        e.preventDefault();
        if (selectedIds.size >= 10) {
          if (!confirm(`${selectedIds.size}개의 글리프를 열까요?`)) return;
        }
        const firstId = Array.from(selectedIds)[0];
        openTab(firstId);
      }

      // Delete/Backspace: 선택된 글리프 삭제
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeTab === null && selectedIds.size > 0 && !isTextInputFocused) {
        e.preventDefault();
        handleDeleteGlyph();
      }

      // Cmd/Ctrl + A: 전체 선택 (텍스트 필드에서는 기본 동작 허용)
      if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        if (activeTab === null && !isTextInputFocused) {
          e.preventDefault();
          setSelectedIds(new Set(fontData.glyphs.map(g => g.id)));
        }
        // 텍스트 필드에서는 기본 동작(전체 선택) 허용
      }

      // Cmd/Ctrl + E: 현재 위치 뒤에 글리프 추가
      if (cmdOrCtrl && e.key.toLowerCase() === 'e' && activeTab === null && !isTextInputFocused) {
        e.preventDefault();
        handleAddGlyph();
      }

      // Cmd/Ctrl + Option + E: 글리프 추가 다이얼로그
      if (cmdOrCtrl && e.altKey && e.key === 'e' && activeTab === null) {
        e.preventDefault();
        // TODO: 다이얼로그 구현
        handleAddGlyph();
      }

      // Cmd/Ctrl + X: 잘라내기
      if (cmdOrCtrl && e.key.toLowerCase() === 'x') {
        if (activeTab === null && !isTextInputFocused) {
          e.preventDefault();
          handleCutGlyph();
        }
        // 텍스트 필드에서는 기본 동작 허용
      }

      // Cmd/Ctrl + C: 복사
      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (activeTab === null && !isTextInputFocused) {
          e.preventDefault();
          handleCopyGlyph();
        }
        // 텍스트 필드에서는 기본 동작 허용
      }

      // Cmd/Ctrl + V: 붙여넣기
      if (cmdOrCtrl && e.key.toLowerCase() === 'v' && !e.shiftKey) {
        if (activeTab === null && !isTextInputFocused) {
          e.preventDefault();
          handlePasteGlyph(false);
        }
        // 텍스트 필드에서는 기본 동작 허용
      }

      // Cmd/Ctrl + Shift + V: 새 슬롯에 붙여넣기
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'v' && activeTab === null && !isTextInputFocused) {
        e.preventDefault();
        handlePasteGlyph(true);
      }

      // Cmd/Ctrl + Shift + F: 글꼴 기능 편집 모달
      if (cmdOrCtrl && e.shiftKey && e.key === 'F' && activeTab === null) {
        e.preventDefault();
        setShowFeatureModal(true);
      }

      // Z: 글꼴 크기 필드에 포커스
      if (e.key.toLowerCase() === 'z' && activeTab === null && !cmdOrCtrl && !e.shiftKey && !e.altKey) {
        const activeElement = document.activeElement;
        const input = document.getElementById('glyph-size-input') as HTMLInputElement;
        if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) && input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }

      // - 또는 _: 글꼴 표시 크기 감소
      if ((e.key === '-' || e.key === '_') && activeTab === null && !cmdOrCtrl && !e.shiftKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          setGlyphSize(prev => Math.max(4, prev - 10));
        }
      }

      // = 또는 +: 글꼴 표시 크기 증가
      if ((e.key === '=' || e.key === '+') && activeTab === null && !cmdOrCtrl && !e.shiftKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          setGlyphSize(prev => Math.min(512, prev + 10));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedIds, fontData.glyphs, handleAddGlyph, handleDeleteGlyph, handleCutGlyph, handleCopyGlyph, handlePasteGlyph, openTab]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Group direction="horizontal">
        {/* Left Sidebar */}
        {!isLeftCollapsed && activeTab === null && (
          <Panel defaultSize={240} minSize={180} maxSize={360} className="relative bg-gray-50 dark:bg-zinc-900">
            <Topbar>
              <TopbarButton onClick={() => router.back()}>
                <ChevronLeft size={18} strokeWidth={1.5} />
              </TopbarButton>
              <Spacer />
              <TopbarButton onClick={() => setIsLeftCollapsed(true)}>
                <PanelLeftClose size={18} strokeWidth={1.5} />
              </TopbarButton>
            </Topbar>
            <div className="pt-12 h-full flex flex-col">
              {/* 글리프 크기 조절 */}
              <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                <label className="block text-sm font-medium mb-2 select-none">글리프 크기</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="4"
                    max="512"
                    value={glyphSize}
                    onChange={(e) => setGlyphSize(Number(e.target.value))}
                    className="w-20 p-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm"
                    id="glyph-size-input"
                  />
                  <span className="text-xs text-gray-500 select-none">px</span>
                </div>
              </div>
              
              {/* 필터 사이드바 */}
              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  fontData={fontData}
                  filterCategory={filterCategory}
                  filterValue={filterValue}
                  onFilterChange={(cat, val) => {
                    setFilterCategory(cat);
                    setFilterValue(val || '');
                  }}
                />
              </div>
            </div>
          </Panel>
        )}

        {/* Main Panel */}
        <Panel className="relative flex flex-col">
          <Topbar>
            {(isLeftCollapsed || activeTab !== null) && (
              <TopbarButton onClick={() => router.back()}>
                <ChevronLeft size={18} strokeWidth={1.5} />
              </TopbarButton>
            )}
            {(isLeftCollapsed && activeTab === null) && (
              <TopbarButton onClick={() => setIsLeftCollapsed(false)}>
                <PanelLeftOpen size={18} strokeWidth={1.5} />
              </TopbarButton>
            )}
            <p className="p-1 font-bold select-none">Project name</p>

            <Spacer />

            {/* Glyph operations (only in main view) */}
            {activeTab === null && (
              <>
                <TopbarButtonGroup>
                  <TopbarGroupedButton
                    onClick={handleAddGlyph}
                    title="글리프 추가 (Cmd+E)"
                  >
                    <Plus size={18} strokeWidth={1.5} />
                  </TopbarGroupedButton>
                  <TopbarGroupedButton
                    onClick={handleDeleteGlyph}
                    disabled={selectedIds.size === 0}
                    title="글리프 삭제 (Delete)"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </TopbarGroupedButton>
                </TopbarButtonGroup>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="h-9 px-3 pr-8 bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 active:bg-gray-200 dark:active:bg-zinc-800 rounded-full shadow-md dark:shadow-zinc-800 border-0 appearance-none cursor-pointer text-sm select-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    <option value="index">글리프 인덱스</option>
                    <option value="name">글리프 이름</option>
                    <option value="codepoint">코드 포인트</option>
                    <option value="user-friendly">사용자 친화적</option>
                    <option value="script-order">문자 순서</option>
                  </select>
                </div>
              </>
            )}

            {/* Zoom control */}
            <TopbarButtonGroup>
              <TopbarGroupedButton
                disabled={activeTab === null}
                onClick={() => setZoomAction({ type: 'OUT', timestamp: Date.now() })}
              >
                <ZoomOut size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                onClick={() => setZoomAction({ type: 'RESET', timestamp: Date.now() })}
              >
                <Fullscreen size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                onClick={() => setZoomAction({ type: 'IN', timestamp: Date.now() })}
              >
                <ZoomIn size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
            </TopbarButtonGroup>

            {/* Editor toolbar */}
            <TopbarButtonGroup>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "pen"}
                onClick={() => setSelectedTool("pen")}
              >
                <PenTool size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "pointer"}
                onClick={() => setSelectedTool("pointer")}
              >
                <MousePointer2 size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "curve"}
                onClick={() => setSelectedTool("curve")}
              >
                <SplinePointer size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "rectangle"}
                onClick={() => setSelectedTool("rectangle")}
              >
                <RectangleHorizontal size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "circle"}
                onClick={() => setSelectedTool("circle")}
              >
                <Circle size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "hand"}
                onClick={() => setSelectedTool("hand")}
              >
                <Hand size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "zoom"}
                onClick={() => setSelectedTool("zoom")}
              >
                <Search size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
              <TopbarGroupedButton
                disabled={activeTab === null}
                selected={activeTab !== null && selectedTool === "ruler"}
                onClick={() => setSelectedTool("ruler")}
              >
                <RulerDimensionLine size={18} strokeWidth={1.5} />
              </TopbarGroupedButton>
            </TopbarButtonGroup>

            <TopbarButton
              onClick={() => setShowFeatureModal(true)}
            >
              <Ligature size={18} strokeWidth={1.5} />
            </TopbarButton>

            {isRightCollapsed && (
              <TopbarButton onClick={() => setIsRightCollapsed(false)}>
                <PanelRightOpen size={18} strokeWidth={1.5} />
              </TopbarButton>
            )}
          </Topbar>

          {/* Tab bar */}
          {openedTabs.length > 1 ? (
            <div className="mt-13 mx-1 px-1 py-[2px] flex flex-row bg-gray-100 dark:bg-zinc-900 rounded-full text-xs select-none">
              {openedTabs.map((glyphId) => {
                const glyph = fontData.glyphs.find(g => g.id === glyphId);
                const tabName = glyphId === null 
                  ? "Glyphs" 
                  : `${glyph?.name || 'Unknown'} — Glyph ${glyphId}`;
                return (
                  <div key={glyphId} onMouseDown={() => switchTab(glyphId)} className={`relative px-4 py-2 flex flex-row flex-1 rounded-full justify-center ${glyphId === activeTab ? "bg-white dark:bg-zinc-700 shadow" : "hover:bg-gray-200 dark:hover:bg-zinc-800"}`}>
                    {glyphId !== null && glyphId === activeTab && (
                      <button
                        onClick={() => closeTab(glyphId)}
                        className="absolute left-2 w-3 h-3 hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 rounded-full"
                      >×</button>
                    )}
                    <p className="truncate">{tabName}</p>
                  </div>
                );
              })}
            </div>
          ) : <></>}

          {/* Glyphs view / Glyph editor view */}
          {activeTab === null ? (
            <div className={`flex-1 flex flex-col overflow-hidden ${(openedTabs.length <= 1) ? "mt-12" : ""}`}>
              <div className="flex-1 overflow-hidden">
                <GlyphGrid
                  fontData={fontData}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  onDoubleClick={openTab}
                  glyphSize={glyphSize}
                  sortOption={sortOption}
                  filterCategory={filterCategory}
                  filterValue={filterValue}
                  onGlyphReorder={sortOption === 'index' ? handleGlyphReorder : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <DynamicGlyphCanvas 
                  key={`canvas-${activeTab}`} 
                  zoomAction={zoomAction} 
                  onZoomComplete={() => setZoomAction(null)} 
                  selectedTool={selectedTool}
                  onToolChange={setSelectedTool}
                />
              </div>
            </div>
          )}
          <PreviewPanel fontData={fontData} />
        </Panel>

        {/* Right Sidebar */}
        {!isRightCollapsed && (
          <Panel defaultSize={240} minSize={180} maxSize={360} className="relative bg-gray-50 dark:bg-zinc-900">
            <Topbar>
              <TopbarButton onClick={() => setIsRightCollapsed(true)}>
                <PanelRightClose size={18} strokeWidth={1.5} />
              </TopbarButton>
              <Spacer />
            </Topbar>
            <div className="pt-12 h-full flex flex-col">
              {/* Segmented Control */}
              <div className="p-1 flex bg-gray-100 dark:bg-zinc-800 rounded-full mx-1">
                <button
                  onClick={() => setRightPanel('font')}
                  className={`flex-1 px-2 py-1 rounded-full text-xs ${rightPanel === 'font' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
                >
                  폰트
                </button>
                <button
                  onClick={() => setRightPanel('glyph')}
                  className={`flex-1 px-2 py-1 rounded-full text-xs ${rightPanel === 'glyph' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
                >
                  글리프
                </button>
                <button
                  onClick={() => setRightPanel('collaborate')}
                  className={`flex-1 px-2 py-1 rounded-full text-xs ${rightPanel === 'collaborate' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
                >
                  협업
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanel === 'font' && (
                  <FontPropertiesPanel
                    fontData={fontData}
                    onFontDataChange={setFontData}
                  />
                )}
                {rightPanel === 'glyph' && (
                  <GlyphPropertiesPanel
                    glyphs={activeTab !== null
                      ? fontData.glyphs.filter(g => g.id === activeTab)
                      : Array.from(selectedIds).map(id => fontData.glyphs.find(g => g.id === id)).filter((g): g is GlyphData => g !== undefined)
                    }
                    fontData={fontData}
                    onGlyphsChange={(newGlyphs) => {
                      setFontData(prev => ({
                        ...prev,
                        glyphs: prev.glyphs.map(g => {
                          const updated = newGlyphs.find(ng => ng.id === g.id);
                          return updated || g;
                        }),
                      }));
                    }}
                  />
                )}
                {rightPanel === 'collaborate' && (
                  <CollaboratePanel />
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* OpenType Feature Modal */}
        {showFeatureModal && (
          <OpenTypeFeaturePanel
            fontData={fontData}
            onClose={() => setShowFeatureModal(false)}
            onFontDataChange={setFontData}
          />
        )}
      </Group>
    </div>
  );
}
