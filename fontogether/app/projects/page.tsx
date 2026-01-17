"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, Group } from "react-resizable-panels";
import { SelectionArea, SelectionEvent } from "@viselect/react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, List, LayoutGrid, SquarePlus, Copy, Trash2, CircleUserRound } from "lucide-react";

import Topbar from "@/components/topbar";
import Spacer from "@/components/spacer";
import TopbarButton, { TopbarButtonGroup, TopbarGroupedButton } from "@/components/topbarButton";
import NewProjectModal from "./newProjectModal";

export default function GlyphsView() {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const toggleLeftSidebar = () => {
    setIsLeftCollapsed(!isLeftCollapsed)
  }
  const toggleRightSidebar = () => {
    setIsRightCollapsed(!isRightCollapsed)
  }

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const router = useRouter();
  const handleMove = ({ store: { changed: { added, removed } } }: SelectionEvent) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      added.forEach((el) => next.add(Number(el.getAttribute("data-id"))))
      removed.forEach((el) => next.delete(Number(el.getAttribute("data-id"))));
      return next;
    })
  }

  const handleDoubleClick = (id: number) => {
    router.push(`/editor/${id}`)
  }

  return (
    <>
      <div className="h-screen w-full flex item-stretch bg-background">
        <Group orientation="horizontal">
          {isLeftCollapsed || (
            <Panel
              id="left"
              defaultSize={240}
              minSize={180}
              maxSize={360}
              className="relative bg-gray-50 dark:bg-zinc-900"
            >
              <Topbar>
                <p className="p-1 font-light select-none">FONTOGETHER</p>
                <Spacer />
                <TopbarButton onClick={toggleLeftSidebar}>
                  <PanelLeftClose size={18} strokeWidth={1.5} />
                </TopbarButton>
              </Topbar>
              <div className="pt-12 overflow-y-auto">
                <div>filter</div>
                <div>sort</div>
              </div>
            </Panel>
          )}

          <Panel className="relative flex flex-col">
            <Topbar>
              {!isLeftCollapsed || (
                <TopbarButton onClick={toggleLeftSidebar}>
                  <PanelLeftOpen size={18} strokeWidth={1.5} />
                </TopbarButton>
              )}

              <p className="p-1 font-bold">Projects</p>
              <Spacer />

              {/* Change view mode */}
              <TopbarButtonGroup>
                <TopbarGroupedButton selected={viewType === "list"} onClick={() => setViewType("list")}>
                  <List size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton selected={viewType === "grid"} onClick={() => setViewType("grid")}>
                  <LayoutGrid size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
              </TopbarButtonGroup>

              {/* File actions */}
              <TopbarButtonGroup>
                <TopbarGroupedButton onClick={() => {setIsNewProjectModalOpen(true)}}>
                  <SquarePlus size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton disabled={selectedIds.size < 1} >
                  <Copy size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton disabled={selectedIds.size < 1}>
                  <Trash2 size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
              </TopbarButtonGroup>
              
              <TopbarButton>
                <CircleUserRound size={18} strokeWidth={1.5} />
              </TopbarButton>

              {!isRightCollapsed || (
                <TopbarButton onClick={toggleRightSidebar}>
                  <PanelRightOpen size={18} strokeWidth={1.5} />
                </TopbarButton>
              )}
            </Topbar>
            <SelectionArea
              onMove={handleMove}
              selectables=".selectable-item"
              features={{ selectOnTap: false }}
              className="selection-container h-full mt-12 overflow-y-auto"
            >
              <div className={`p-2
                ${viewType === "grid"
                  ? "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2"
                  : "flex flex-col"}
              `}>
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    data-id={i}
                    onDoubleClick={() => handleDoubleClick(i)}
                    className={`selectable-item p-2 rounded-lg transition-all
                      ${selectedIds.has(i) ? "bg-blue-500 text-white" : "bg-transparent"}
                      ${viewType === "list" ? "flex justify-between items-center" : "aspect-square flex flex-col items-center justify-center"}
                      select-none`
                    }
                  >
                    <span>Project {i}</span>
                    {viewType === "list" && <span className="text-xs opacity-50">2026-01-15 19:30</span>}
                  </div>
                ))}
              </div>
            </SelectionArea>
          </Panel>

          {isRightCollapsed || (
            <Panel
              id="right"
              defaultSize={240}
              minSize={180}
              maxSize={360}
              className="relative bg-gray-50 dark:bg-zinc-900"
            >
              <Topbar>
                <TopbarButton onClick={toggleRightSidebar}>
                  <PanelRightClose size={18} strokeWidth={1.5} />
                </TopbarButton>
                <Spacer />
              </Topbar>
              <div className="pt-12 overflow-y-auto">
                
              </div>
            </Panel>
          )}
        </Group>
      </div>

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => {setIsNewProjectModalOpen(false)}}></NewProjectModal>
    </>
  );
}
