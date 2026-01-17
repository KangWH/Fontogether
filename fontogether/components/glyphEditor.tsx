"use client";

import { useEffect, useRef, useLayoutEffect, useCallback, act } from "react";
import paper from "paper";

interface GlyphEditorProps {
  key: string;
  zoomAction: {
    type: 'IN' | 'OUT' | 'RESET';
    timestamp: number;
  } | null;
  onZoomComplete: () => void;
  selectedTool: string;
}

export default function GlyphEditor({ key, zoomAction, onZoomComplete, selectedTool }: GlyphEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectRef = useRef<paper.Project | null>(null);

  // Tool references
  const pointerToolRef = useRef<paper.Tool | null>(null);
  const penToolRef = useRef<paper.Tool | null>(null);
  const curveToolRef = useRef<paper.Tool | null>(null);
  const handToolRef = useRef<paper.Tool | null>(null);

  const drawingPathRef = useRef<paper.Path | null>(null);
  const selectedSegmentsRef = useRef<paper.Segment[]>([]);
  const highlightItemsRef = useRef<paper.Path.Circle[]>([]);

  const clearHighlights = useCallback(() => {
    highlightItemsRef.current.forEach(item => item.remove());
    highlightItemsRef.current = [];
  }, []);

  const finishDrawing = useCallback(() => {
    if (drawingPathRef.current) {
      drawingPathRef.current.closed = true;
      drawingPathRef.current.fullySelected = true;
      drawingPathRef.current = null;
      selectedSegmentsRef.current = [];
      clearHighlights();
      // useLayoutEffect 내부에서 paper.view.draw()를 호출했으므로 여기서는 생략 가능
      if (paper.view) paper.view.draw();
    }
  }, [clearHighlights]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    let isSpacePressed = false;
    let isMiddleMouseDown = false;

    // Draws grid
    const drawGrid = () => {
      const existingGrid = paper.project.getItem({ name: 'grid-layer' });
      if (existingGrid) existingGrid.remove();

      const gridLayer = new paper.Layer();
      gridLayer.name = 'grid-layer';
      // 💡 메인 도형 레이어 아래에 배치
      gridLayer.sendToBack();
      gridLayer.activate();

      const gridSize = 100; // 대그리드
      const subGridSize = 10; // 소그리드
      const viewBounds = paper.view.bounds;

      // 그리드 범위 설정 (충분히 넓게)
      const startX = Math.floor(viewBounds.left / gridSize) * gridSize;
      const endX = Math.ceil(viewBounds.right / gridSize) * gridSize;
      const startY = Math.floor(viewBounds.top / gridSize) * gridSize;
      const endY = Math.ceil(viewBounds.bottom / gridSize) * gridSize;

      // 세로선 그리기
      for (let x = startX; x <= endX; x += subGridSize) {
        const line = new paper.Path.Line(
          new paper.Point(x, startY),
          new paper.Point(x, endY)
        );
        const isMajor = x % gridSize === 0;
        line.strokeColor = new paper.Color(isMajor ? '#e5e7eb' : '#f3f4f6');
        line.strokeWidth = isMajor ? 1 : 0.5;
        line.guide = true; // 💡 선택 및 충돌 감지 제외
      }

      // 가로선 그리기
      for (let y = startY; y <= endY; y += subGridSize) {
        const line = new paper.Path.Line(
          new paper.Point(startX, y),
          new paper.Point(endX, y)
        );
        const isMajor = y % gridSize === 0;
        line.strokeColor = new paper.Color(isMajor ? '#e5e7eb' : '#f3f4f6');
        line.strokeWidth = isMajor ? 1 : 0.5;
        line.guide = true;
      }

      // 💡 다시 메인 레이어로 활성 레이어 복구
      const mainLayer = paper.project.layers.find(l => l.name !== 'grid-layer');
      if (mainLayer) {
        mainLayer.activate();
      }
    }

    // Initialize canvas.
    if (projectRef.current) {
      paper.project.clear();
      projectRef.current.remove();
    }
    paper.setup(canvasRef.current);
    projectRef.current = paper.project;

    paper.settings.selectionColor = 'black';

    // Rerender canvas when it is resized.
    const updateCanvasSize = () => {
      const width = canvasRef.current!.clientWidth;
      const height = canvasRef.current!.clientHeight;
      paper.view.viewSize = new paper.Size(width, height);
    };
    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
      drawGrid();
      paper.view.draw(); 
    });
    resizeObserver.observe(canvasRef.current);

    // Screen panning
    const handlePanning = (delta: paper.Point) => {
      paper.view.center = paper.view.center.subtract(delta);
      paper.view.draw();
    };
    const panOnDrag = (event: paper.ToolEvent) => {
      // space가 눌려있거나 휠 버튼이 눌려있는 경우
      if (isSpacePressed || isMiddleMouseDown) {
        handlePanning(event.delta);
        return true;
      }
      return false;
    };

    // shows baseline
    const baseline = new paper.Path.Line(
      new paper.Point(0, 600),
      new paper.Point(1000, 600),
    );
    baseline.strokeColor = new paper.Color("#e5e7eb");
    baseline.guide = true;
    baseline.locked = true;

    // sample shape
    const path = new paper.Path({
      segments: [[200, 600], [500, 100], [800, 600]],
      strokeColor: "black",
      strokeWidth: 2,
      closed: true,
    });
    path.fullySelected = true

    const createHighlight = (point: paper.Point, isHandle: boolean = false) => {
      const circle = new paper.Path.Circle({
        center: point,
        radius: isHandle ? 4 : 6,
        fillColor: isHandle ? '#60a5fa' : '#3b82f6', // Tailwind blue-500
        strokeColor: 'white',
        strokeWidth: 1,
        guide: true,
        insert: true,
      });
      highlightItemsRef.current.push(circle);
    };

    const refreshHighlights = () => {
      clearHighlights();
      selectedSegmentsRef.current.forEach(seg => {
        // 1. 꼭짓점 하이라이트
        createHighlight(seg.point);
        // 2. 조절점(HandleIn) 하이라이트 - 0이 아닐 때만
        if (!seg.handleIn.isZero()) {
          createHighlight(seg.point.add(seg.handleIn), true);
        }
        // 3. 조절점(HandleOut) 하이라이트 - 0이 아닐 때만
        if (!seg.handleOut.isZero()) {
          createHighlight(seg.point.add(seg.handleOut), true);
        }
      });
    };

    // Pointer tool: moves existing points
    pointerToolRef.current = new paper.Tool();
    let hitHandle: paper.Point | null = null;
    let selectionRect: paper.Path.Rectangle | null = null;

    pointerToolRef.current.onMouseDown = (event: paper.ToolEvent) => {
      const hitResult = paper.project.hitTest(event.point, {
        segments: true,
        handles: true,
        tolerance: 8
      });

      hitHandle = null;
      const isModifier = event.modifiers.shift || event.modifiers.control || event.modifiers.meta;

      if (hitResult) {
        if (hitResult.type === 'segment') {
          let hitSegment = hitResult.segment as paper.Segment;

          if (isModifier) {
            const index = selectedSegmentsRef.current.indexOf(hitSegment);
            if (index > -1) {
              selectedSegmentsRef.current.splice(index, 1);
            } else {
              selectedSegmentsRef.current.push(hitSegment);
            }
          } else {
            if (!selectedSegmentsRef.current.includes(hitSegment)) {
              selectedSegmentsRef.current = [hitSegment];
            }
          }
        } else if (hitResult.type === 'handle-in') {
          // 💡 들어오는 핸들 선택
          hitHandle = hitResult.segment.handleIn;
          selectedSegmentsRef.current = [hitResult.segment];
        } else if (hitResult.type === 'handle-out') {
          // 💡 나가는 핸들 선택
          hitHandle = hitResult.segment.handleOut;
          selectedSegmentsRef.current = [hitResult.segment];
        }
        refreshHighlights();
      } else {
        if (!isModifier) {
          selectedSegmentsRef.current = [];
          refreshHighlights();
        }

        selectionRect = new paper.Path.Rectangle({
          from: event.point,
          to: event.point,
          strokeColor: '#606060',
          fillColor: new paper.Color(128/255, 128/255, 128/255, 0.1),
          strokeWidth: 1,
          guide: true
        });
      }
    };

    pointerToolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      if (panOnDrag(event)) return;

      if (selectionRect) {
        selectionRect.segments[1].point.x = event.point.x;
        selectionRect.segments[2].point = event.point;
        selectionRect.segments[3].point.y = event.point.y;
      } else if (hitHandle) {
        hitHandle.x += event.delta.x;
        hitHandle.y += event.delta.y;
      } else if (selectedSegmentsRef.current.length > 0) {
        selectedSegmentsRef.current.forEach((seg, index) => {
          seg.point = seg.point.add(event.delta);
        });
      }
      refreshHighlights();
      paper.view.draw();
    };

    pointerToolRef.current.onMouseUp = (event: paper.ToolEvent) => {
      if (selectionRect) {
        const bounds = selectionRect.bounds;

        // 점의 좌표가 사각형 영역 안에 포함되는지 확인
        paper.project.activeLayer.children.forEach((item: any) => {
        if (item instanceof paper.Path && !item.guide) {
          item.segments.forEach((seg: paper.Segment) => {
            if (bounds.contains(seg.point)) {
              if (!selectedSegmentsRef.current.includes(seg)) {
                selectedSegmentsRef.current.push(seg);
              }
            }
          });
        }
      });

        selectionRect.remove();
        selectionRect = null;
        refreshHighlights();
      }
      paper.view.draw();
    }

    // Pen tool: draw new shapes
    penToolRef.current = new paper.Tool();
    let lastSegment: paper.Segment | null = null;

    penToolRef.current.onMouseDown = (event: paper.ToolEvent) => {
      const currentPath = drawingPathRef.current;

      const hitResult = paper.project.hitTest(event.point, {
        stroke: true,
        tolerance: 8
      });

      // 이미 그려진 도형의 선 위를 찍은 경우 (그리는 중인 도형 제외)
      if (hitResult && hitResult.type === 'stroke' && hitResult.item !== currentPath) {
        const newSegment = (hitResult.item as paper.Path).divideAt(hitResult.location);
        
        // 추가된 점 선택 및 강조
        selectedSegmentsRef.current = [newSegment];
        refreshHighlights();
        paper.view.draw();
        return; // 1번 기능 수행 후 종료 (초기 상태 유지)
      }

      // --- 2. 다른 곳을 클릭하여 도형 그리기 시작 또는 이어 나가기 ---
      if (!currentPath) {
        // 새 경로 시작 (처음에는 닫지 않음)
        drawingPathRef.current = new paper.Path({
          strokeColor: "black",
          strokeWidth: 2,
          closed: false,
          fullySelected: true
        });
      }

      // 클릭 지점이 최초의 점인지 확인 (도형 닫기 판정)
      const hitFirst = drawingPathRef.current!.hitTest(event.point, { segments: true, tolerance: 10 });
      if (hitFirst && hitFirst.segment === drawingPathRef.current!.firstSegment) {
        // 3. 최초의 점 클릭 시 도형 완성 및 닫기
        drawingPathRef.current!.closed = true;
        drawingPathRef.current = null; // 초기 상태로 복귀
        selectedSegmentsRef.current = [];
        refreshHighlights();
      } else {
        // 점을 계속 이어 나감 (드래그 시 곡률 조정을 위해 lastSegment 저장)
        lastSegment = drawingPathRef.current!.add(event.point) as paper.Segment;
        selectedSegmentsRef.current = [lastSegment!];
        refreshHighlights();
      }
      paper.view.draw();
    };

    penToolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      if (panOnDrag(event)) return;

      // lastSegment가 있고 현재 그리기 모드일 때만 실행
      if (lastSegment && drawingPathRef.current) {
        // 대칭 핸들 생성하여 부드러운 곡선 구현
        const delta = event.downPoint.subtract(event.point);
        lastSegment.handleIn = delta;
        lastSegment.handleOut = delta.multiply(-1);
        
        refreshHighlights();
        paper.view.draw();
      }
    };

    penToolRef.current.onMouseUp = () => {
      lastSegment = null;
    };

    // Curve tool: change curvature
    curveToolRef.current = new paper.Tool();
    let hitSegment: paper.Segment | null = null;
    let activeHandle: 'in' | 'out' | null = null;
    let isDragging = false; // 드래그 여부 확인용

    curveToolRef.current.onMouseDown = (event: paper.ToolEvent) => {
      const hitResult = paper.project.hitTest(event.point, {
        segments: true,
        handles: true,
        tolerance: 12
      });

      isDragging = false; // 클릭 시작 시 초기화
      hitSegment = null;
      activeHandle = null;

      if (hitResult) {
        hitSegment = hitResult.segment as paper.Segment;
        selectedSegmentsRef.current = [hitSegment];

        if (hitResult.type === 'handle-in') {
          activeHandle = 'in';
        } else if (hitResult.type === 'handle-out') {
          activeHandle = 'out';
        }
        refreshHighlights();
      }
    };

    curveToolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      if (panOnDrag(event)) return;

      if (hitSegment) {
        isDragging = true;
        
        if (activeHandle) {
          const newHandlePos = event.point.subtract(hitSegment.point);
          if (activeHandle === 'in') {
            hitSegment.handleIn = newHandlePos;
            // hitSegment.handleOut = newHandlePos.multiply(-1);
          } else {
            hitSegment.handleOut = newHandlePos;
            // hitSegment.handleIn = newHandlePos.multiply(-1);
          }
        } else {
          const delta = event.point.subtract(hitSegment.point);
          hitSegment.handleOut = delta;
          hitSegment.handleIn = delta.multiply(-1);
        }
        
        refreshHighlights();
        paper.view.draw();
      }
    };

    curveToolRef.current.onMouseUp = (event: paper.ToolEvent) => {
      if (hitSegment && !isDragging) {
        // 드래그 없이 떼면 첨점(Corner)으로 변경
        if (activeHandle) {
          if (activeHandle === 'in') {
            hitSegment.handleIn = new paper.Point(0, 0);
          } else {
            hitSegment.handleOut = new paper.Point(0, 0);
          }
        } else {
          hitSegment.handleIn = new paper.Point(0, 0);
          hitSegment.handleOut = new paper.Point(0, 0);
        }
        
        refreshHighlights();
        paper.view.draw();
      }
      hitSegment = null;
    };

    // Hand tool --- move screen around
    handToolRef.current = new paper.Tool();
    handToolRef.current.onMouseDrag = (event: paper.ToolEvent) => {
      handlePanning(event.delta);
      canvasRef.current!.style.cursor = 'grabbing';
    };
    handToolRef.current.onMouseUp = () => {
      canvasRef.current!.style.cursor = 'grab';
    };
    handToolRef.current.onActivate = () => {
      canvasRef.current!.style.cursor = 'grab';
    };

    // Delete points
    paper.view.onKeyDown = (event: any) => {
      if (event.key === 'delete' || event.key === 'backspace') {
        if (selectedSegmentsRef.current.length > 0) {
          event.preventDefault();
          selectedSegmentsRef.current.forEach(seg => {
            const parentPath = seg.path;
            seg.remove();

            if (parentPath && parentPath.segments.length === 0) {
              parentPath.remove();
            }
          });

          selectedSegmentsRef.current = [];
          clearHighlights();

          paper.view.draw();
        }
      } else if (event.key === 'space') {
        // panning
        isSpacePressed = true;
        canvasRef.current!.style.cursor = 'grab';
      }
    };

    paper.view.onKeyUp = (event: any) => {
      if (event.key === 'space') {
        isSpacePressed = false;
        canvasRef.current!.style.cursor = 'default';
      }
    };

    canvasRef.current!.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 1) {
        isMiddleMouseDown = true;
        canvasRef.current!.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 1) {
        isMiddleMouseDown = false;
        canvasRef.current!.style.cursor = 'default';
      }
    });

    // Scroll to zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const view = paper.view;
      const oldZoom = view.zoom;
      const mousePosition = view.viewToProject(new paper.Point(e.offsetX, e.offsetY));

      const zoomFactor = 1.1;
      const newZoom = e.deltaY < 0 ? oldZoom * zoomFactor : oldZoom / zoomFactor;

      if (newZoom < 0.05 || newZoom > 50) return;

      view.zoom = newZoom;

      const diff = mousePosition.subtract(view.center);
      const offset = mousePosition.subtract(diff.multiply(oldZoom / newZoom)).subtract(view.center);
      view.center = view.center.add(offset);

      view.draw();
    }
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();

      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }

      projectRef.current = null;
    };
  }, [clearHighlights]);

  useEffect(() => {
    if (!paper.project) return;

    const view = paper.view;
    switch (zoomAction?.type) {
      case 'IN':
        view.zoom = view.zoom + 0.1;
        view.draw();
        break;
      case 'OUT': 
        view.zoom = view.zoom - 0.1;
        view.draw();
        break;
      case 'RESET':
        view.zoom = 1.0;
        view.center = new paper.Point(500, 500);
        view.draw();
        break;
    }

    if (selectedTool === 'pointer') {
      finishDrawing();
      pointerToolRef.current?.activate();
    } else if (selectedTool === 'pen') {
      penToolRef.current?.activate();
    } else if (selectedTool === 'curve') {
      finishDrawing();
      curveToolRef.current?.activate();
    } else if (selectedTool === 'hand') {
      finishDrawing();
      handToolRef.current?.activate();
    }

    onZoomComplete();
  }, [zoomAction, selectedTool, finishDrawing]);

  return (
    <div className="w-full h-full bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        data-paper-resize="true"
      />
    </div>
  )
}
