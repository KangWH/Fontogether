"use client";

import { act, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { Panel, Group } from "react-resizable-panels";
import { SelectionArea, SelectionEvent } from "@viselect/react";
import { ChevronLeft, Circle, Fullscreen, Hand, MousePointer2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, PenTool, RectangleHorizontal, RulerDimensionLine, Search, SplinePointer, Users, ZoomIn, ZoomOut } from "lucide-react";

import Topbar from "@/components/topbar";
import Spacer from "@/components/spacer";
import TopbarButton, { TopbarButtonGroup, TopbarGroupedButton } from "@/components/topbarButton";
import GlyphPreview from "@/components/glyphPreview";
// import GlyphEditor from "@/components/glyphEditor";

const DynamicGlyphCanvas = dynamic(() => import('@/components/glyphEditor'), {
  ssr: false, // 이 설정이 핵심입니다.
  loading: () => <p>캔버스 로드 중...</p>, // 로딩 중에 보여줄 내용
});

export default function GlyphsView() {
  const router = useRouter();

  // --- Sidebar State ---
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // --- Zoom State ---
  const [zoomAction, setZoomAction] = useState<{ type: 'IN' | 'OUT' | 'RESET'; timestamp: number; } | null>(null);

  // --- Toolbar State ---
  const [selectedTool, setSelectedTool] = useState("pointer");

  // --- Selection Logic ---
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const handleMove = ({ store: { changed: { added, removed } } }: SelectionEvent) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      added.forEach((el) => next.add(Number(el.getAttribute("data-id"))));
      removed.forEach((el) => next.delete(Number(el.getAttribute("data-id"))));
      return next;
    });
  };

  // --- Opened tabs ---
  const [openedTabs, setOpenedTabs] = useState<(number | null)[]>([null]) // null for main window
  const [activeTab, setActiveTab] = useState<number | null>(null) // null for main window

  const openTab = (id: number, setActive: boolean = true) => {
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
            <div className="pt-12 overflow-y-auto h-full"></div>
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
            <p className="p-1 font-bold">Project name</p>

            <Spacer />

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

            {/* <TopbarButton>
              <Users size={18} strokeWidth={1.5} />
            </TopbarButton> */}

            {isRightCollapsed && (
              <TopbarButton onClick={() => setIsRightCollapsed(false)}>
                <PanelRightOpen size={18} strokeWidth={1.5} />
              </TopbarButton>
            )}
          </Topbar>

          {/* Tab bar */}
          {openedTabs.length > 1 ? (
            <div className="mt-13 mx-1 px-1 py-[2px] flex flex-row bg-gray-100 dark:bg-zinc-900 rounded-full text-xs select-none">
              {openedTabs.map((glyphId) => (
                <div key={glyphId} onMouseDown={() => switchTab(glyphId)} className={`relative px-4 py-2 flex flex-row flex-1 rounded-full justify-center ${glyphId === activeTab ? "bg-white dark:bg-zinc-700 shadow" : "hover:bg-gray-200 dark:hover:bg-zinc-800"}`}>
                  {glyphId !== null && glyphId === activeTab && (
                    <button onClick={() => closeTab(glyphId)} className="absolute left-3 w=1 h=1">×</button>
                  )}
                  <p>{glyphId === null ? "Glyphs" : `Glyph ${glyphId}`}</p>
                </div>
              ))}
            </div>
          ) : <></>}

          {/* Glyphs view / Glyph editor view */}
          {activeTab === null ? (
            <SelectionArea 
              onMove={handleMove} 
              selectables=".selectable-item" 
              features={{ selectOnTap: false }} 
              className="flex-1 overflow-y-auto"
            >
              <div className={`p-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 ${(openedTabs.length <= 1) ? "mt-12" : ""}`}>
                {[...Array(120)].map((_, i) => (
                  <GlyphPreview
                    key={i} 
                    id={i} 
                    isSelected={selectedIds.has(i)} 
                    onDoubleClick={() => openTab(i)}
                  />
                ))}
              </div>
            </SelectionArea>
          ) : (
            <>
              {/* <div key={activeTab}>{activeTab} {selectedTool}</div> */}
              <DynamicGlyphCanvas key={`canvas-${activeTab}`} zoomAction={zoomAction} onZoomComplete={() => setZoomAction(null)} selectedTool={selectedTool} />
            </>
          )}
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
            <div className="pt-12 h-full overflow-y-auto">
              {activeTab !== null ? (
                <div>
                  Glyph property
                  <p>글리프 이름</p>
                  <input />
                  <p>코드 포인트</p>
                  <input />
                </div>
              ) : (<></>)}
            </div>
          </Panel>
        )}
      </Group>
    </div>
  );
}
