"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Panel, Group } from "react-resizable-panels";
import { SelectionArea, SelectionEvent } from "@viselect/react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, List, LayoutGrid, SquarePlus, Copy, Trash2, CircleUserRound, ArrowDownWideNarrow, Download } from "lucide-react";

import Topbar from "@/components/topbar";
import Spacer from "@/components/spacer";
import TopbarButton, { TopbarButtonGroup, TopbarDropdownButton, TopbarGroupedButton } from "@/components/topbarButton";
import NewProjectModal from "./newProjectModal";
import AccountModal from "@/components/AccountModal";

import { useUserStore } from "@/store/userStore";
import ExportProjectModal from "./exportProjectModal";
import DeleteProjectModal from "./deleteProjectModal";


export default function GlyphsView() {
  let user = useUserStore((s) => s.user);

  /* for test */
  if (user === null) {
    user = { id: 0, name: "Test User", email: "applemincho@example.com"};
  }

  const filters = [
    { name: 'all', text: '내 프로젝트', iconName: 'LayoutGrid' },
    { name: 'sharedToMe', text: '내게 공유된 프로젝트', iconName: 'Download' },
    { name: 'sharedFromMe', text: '내가 공유한 프로젝트', iconName: 'Upload' }
  ];
  const [ currentFilter, setCurrentFilter ] = useState('all');

  const [ currentSort, setCurrentSort ] = useState('recentlyEdited');
  const sortSelectRef = useRef<HTMLSelectElement>(null);

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isExportProjectModalOpen, setIsExportProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

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

  let [ projects, setProjects ] = useState<Array<any> | null>(null);
  const filteredFonts = useMemo(() => {
    if (currentFilter === 'all') {
      return projects?.filter(proj => proj.owner_id === user?.id) || [];
    } else if (currentFilter === 'sharedToMe') {
      return projects?.filter(proj => proj.owner_id !== user?.id) || [];
    } else if (currentFilter === 'sharedFromMe') {
      return projects?.filter(proj => proj.owner_id === user?.id && proj.shared && proj.shared.length > 0) || [];
    }
    return projects || [];
  }, [currentFilter, projects]);

  const handleDoubleClick = (id: number) => {
    router.push(`/editor/${id}`)
  }

  useEffect(() => {
    fetch(`http://10.249.16.96:444/api/projects/user/${user?.id || 0}`)
    .then(res => res.json())
    .then(data => {
      setProjects(data);
    })
    .catch(err => {
      console.error("Failed to fetch projects:", err);
      // setProjects([]);
      // alert("프로젝트를 불러오는 데 실패했습니다.");
      setProjects([
        { project_id: 1, owner_id: 0, title: "Sample Project 1", updated_at: "2024-06-01" },
        { project_id: 2, owner_id: 0, title: "Sample Project 2", updated_at: "2024-06-02" },
        { project_id: 3, owner_id: 1, title: "Sample Project 3", updated_at: "2024-06-03" },
        { project_id: 4, owner_id: 2, title: "Sample Project 4", updated_at: "2024-06-04" },
        { project_id: 5, owner_id: 0, title: "Sample Project 5", updated_at: "2024-06-05" },
      ]);
    });
  }, []);

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
              <div className="absolute mt-12 p-2 flex flex-col w-full overflow-y-auto">
                {filters.map((item) => (
                  <div
                    key={item.name}
                    className={`p-3 rounded-lg select-none ${currentFilter === item.name ? 'bg-gray-200 dark:bg-zinc-800 text-blue-500' : ''} text-sm`}
                    onClick={() => setCurrentFilter(item.name)}
                  >{item.text}</div>
                ))}
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

              {/* Sorting */}
              <TopbarDropdownButton onClick={() => {sortSelectRef.current?.showPicker()}}>
                <ArrowDownWideNarrow size={18} strokeWidth={1.5} />
                <select ref={sortSelectRef} className="text-sm outline-none appearance-none">
                  <option value="recentlyEdited">최근 수정일</option>
                  <option value="createdAt">생성일</option>
                  <option value="alphabetical">프로젝트 이름</option>
                </select>
              </TopbarDropdownButton>

              {/* File actions */}
              <TopbarButtonGroup>
                <TopbarGroupedButton onClick={() => {setIsNewProjectModalOpen(true)}}>
                  <SquarePlus size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton disabled={selectedIds.size < 1} >
                  <Copy size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton onClick={() => {setIsExportProjectModalOpen(true)}} disabled={selectedIds.size < 1}>
                  <Download size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
                <TopbarGroupedButton onClick={() => {setIsDeleteProjectModalOpen(true)}} disabled={selectedIds.size < 1}>
                  <Trash2 size={18} strokeWidth={1.5} />
                </TopbarGroupedButton>
              </TopbarButtonGroup>
              
              <TopbarButton
                onClick={() => {setIsAccountModalOpen(true)}}
              >
                <CircleUserRound size={18} strokeWidth={1.5} />
              </TopbarButton>

              {!isRightCollapsed || (
                <TopbarButton onClick={toggleRightSidebar}>
                  <PanelRightOpen size={18} strokeWidth={1.5} />
                </TopbarButton>
              )}
            </Topbar>

            {/* Project list */}
            <div className="mt-12 flex flex-grow">
              {projects === null && (
                <div className="flex-grow flex flex-col items-center justify-center select-none">
                  <p className="text-gray-500 dark:text-gray-400">프로젝트 로드 중...</p>
                </div>
              )}

              {projects !== null && filteredFonts.length === 0 && currentFilter !== "sharedToMe" && (
                <div className="flex-grow flex flex-col items-center justify-center select-none">
                  <p className="text-2xl">프로젝트가 없습니다.</p>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">새 프로젝트를 만들어 시작하세요!</p>
                </div>
              )}
              {projects !== null && filteredFonts.length === 0 && currentFilter === "sharedToMe" && (
                <div className="flex-grow flex flex-col items-center justify-center select-none">
                  <p className="text-2xl">나에게 공유된 프로젝트가 없습니다.</p>
                </div>
              )}

              {projects !== null && filteredFonts.length > 0 && (
                <SelectionArea
                  onMove={handleMove}
                  selectables=".selectable-item"
                  features={{ selectOnTap: false }}
                  className="flex-grow selection-container h-full overflow-y-auto"
                >
                  <div className={`p-2
                    ${viewType === "grid"
                      ? "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2"
                      : "flex flex-col"}
                  `}>
                    {viewType === "list" && (
                      <div className="sticky top-0 flex justify-between items-center p-2 pb-1 mb-1 border-b border-gray-300 dark:border-zinc-700 select-none font-semibold text-sm text-gray-400 dark:text-zinc-600">
                        <span className="basis-64 grow-[3]">프로젝트 이름</span>
                        <span className="basis-20 grow">소유자</span>
                        <span className="basis-20 grow">마지막 수정일</span>
                      </div>
                    )}
                    {filteredFonts.map((data, index) => (
                      <div
                        key={data.project_id}
                        data-id={data.project_id}
                        onDoubleClick={() => handleDoubleClick(data.project_id)}
                        className={`selectable-item rounded-lg
                          ${viewType === "list" ? `px-2 py-1 flex justify-between items-center ${(index & 1) ? "bg-gray-100 dark:bg-zinc-800" : ""}` : "px-4 py-2 flex flex-col items-center justify-center"}
                          ${selectedIds.has(data.project_id) ? "!bg-blue-500 text-white" : ""}
                          select-none`
                        }
                      >
                        {viewType === "grid" && (<>
                          <div className="pt-4 pb-2 mb-2 overflow-hidden">
                            <span className="text-4xl">Abg</span>
                          </div>
                          <span className="text-sm">{data.title}</span>
                        </>)}
                        {viewType === "list" && (<>
                          <span className="basis-64 grow-[3]">{data.title}</span>
                          <span className="basis-20 grow text-xs">{data.owner_id === user?.id ? "나" : `사용자 ${data.owner_id}`}</span>
                          <span className="basis-20 grow text-xs opacity-50">{data.updated_at}</span>
                        </>)}
                      </div>
                    ))}
                  </div>
                </SelectionArea>
              )}
            </div>
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

          {isAccountModalOpen && (
            <AccountModal onClose={() => {setIsAccountModalOpen(false)}} />
          )}
          {isDeleteProjectModalOpen && (
            <DeleteProjectModal ids={selectedIds} onClose={() => {setIsDeleteProjectModalOpen(false)}} />
          )}
        </Group>
      </div>

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => {setIsNewProjectModalOpen(false)}}></NewProjectModal>
      <ExportProjectModal isOpen={isExportProjectModalOpen} onClose={() => {setIsExportProjectModalOpen(false)}}></ExportProjectModal>
    </>
  );
}
