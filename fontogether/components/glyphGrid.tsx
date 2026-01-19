"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import GlyphPreview from "./glyphPreview";
import { FontData, GlyphData_OLD, SortOption, FilterCategory, ColorTag } from "@/types/font";

interface GlyphGridProps {
  fontData: FontData;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  onDoubleClick: (id: number) => void;
  glyphSize: number;
  sortOption: SortOption;
  filterCategory: FilterCategory;
  filterValue?: string;
  onGlyphReorder?: (newOrder: number[]) => void;
}

export default function GlyphGrid({
  fontData,
  selectedIds,
  onSelectionChange,
  onDoubleClick,
  glyphSize,
  sortOption,
  filterCategory,
  filterValue,
  onGlyphReorder,
}: GlyphGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const lastSelectedIndexRef = useRef<number | null>(null);

  // 필터링된 글리프 목록
  const filteredGlyphs = useMemo(() => {
    let glyphs = [...fontData.glyphs];

    // 필터 적용
    if (filterCategory !== 'none' && filterValue) {
      glyphs = glyphs.filter(glyph => {
        switch (filterCategory) {
          case 'tag':
            return glyph.tags?.includes(filterValue);
          case 'group':
            return glyph.groups?.includes(filterValue);
          case 'language':
            // 언어 필터는 나중에 구현
            return true;
          case 'script':
            // 스크립트 필터는 나중에 구현
            return true;
          case 'opentype-class':
            return glyph.openTypeClass === filterValue;
          default:
            return true;
        }
      });
    }

    // 정렬
    switch (sortOption) {
      case 'index':
        // 인덱스 순서는 그대로
        break;
      case 'codepoint':
        glyphs.sort((a, b) => {
          const aCode = a.unicode?.[0] ?? 0;
          const bCode = b.unicode?.[0] ?? 0;
          return aCode - bCode;
        });
        break;
      case 'name':
        glyphs.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'user-friendly':
        // 사용자 친화적 순서 (알파벳 순서 등)
        glyphs.sort((a, b) => {
          const aCode = a.unicode?.[0] ?? 0;
          const bCode = b.unicode?.[0] ?? 0;
          if (aCode >= 65 && aCode <= 90 && bCode >= 65 && bCode <= 90) {
            return aCode - bCode;
          }
          if (aCode >= 97 && aCode <= 122 && bCode >= 97 && bCode <= 122) {
            return aCode - bCode;
          }
          return a.name.localeCompare(b.name);
        });
        break;
      case 'script-order':
        // 문자 체계 내 기본 알파벳 순서
        glyphs.sort((a, b) => {
          const aCode = a.unicode?.[0] ?? 0;
          const bCode = b.unicode?.[0] ?? 0;
          return aCode - bCode;
        });
        break;
    }

    return glyphs;
  }, [fontData.glyphs, sortOption, filterCategory, filterValue]);

  const handleClick = useCallback((e: React.MouseEvent, glyphId: number, index: number) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    const isShift = e.shiftKey;

    if (cmdOrCtrl) {
      // Cmd/Ctrl 클릭: 토글
      const next = new Set(selectedIds);
      if (next.has(glyphId)) {
        next.delete(glyphId);
      } else {
        next.add(glyphId);
      }
      onSelectionChange(next);
      lastSelectedIndexRef.current = index;
    } else if (isShift && lastSelectedIndexRef.current !== null) {
      // Shift 클릭: 범위 선택
      const start = Math.min(lastSelectedIndexRef.current, index);
      const end = Math.max(lastSelectedIndexRef.current, index);
      const next = new Set(selectedIds);
      for (let i = start; i <= end; i++) {
        next.add(filteredGlyphs[i].id);
      }
      onSelectionChange(next);
    } else {
      // 일반 클릭: 선택 초기화 후 해당 항목만 선택
      onSelectionChange(new Set([glyphId]));
      lastSelectedIndexRef.current = index;
    }
  }, [selectedIds, onSelectionChange, filteredGlyphs]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (sortOption === 'index') {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (sortOption === 'index' && draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && sortOption === 'index' && onGlyphReorder) {
      const newOrder = [...filteredGlyphs];
      const [dragged] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, dragged);
      onGlyphReorder(newOrder.map(g => g.id));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto select-none">
      <div
        className="p-2 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${glyphSize}px, 1fr))`,
        }}
      >
        {filteredGlyphs.map((glyph, index) => (
          <div
            key={glyph.id}
            draggable={sortOption === 'index'}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onClick={(e) => handleClick(e, glyph.id, index)}
            className={dragOverIndex === index ? "opacity-50" : ""}
          >
            <GlyphPreview
              id={glyph.id}
              glyph={glyph}
              isSelected={selectedIds.has(glyph.id)}
              onDoubleClick={() => onDoubleClick(glyph.id)}
              size={glyphSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
