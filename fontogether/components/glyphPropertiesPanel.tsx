"use client";

import { GlyphData, FontData } from "@/types/font";
import { useState } from "react";

interface GlyphPropertiesPanelProps {
  glyphs: GlyphData[];
  fontData: FontData;
  onGlyphsChange: (glyphs: GlyphData[]) => void;
}

export default function GlyphPropertiesPanel({ glyphs, fontData, onGlyphsChange }: GlyphPropertiesPanelProps) {
  const isMultiple = glyphs.length > 1;
  const firstGlyph = glyphs[0];

  const updateGlyph = (field: string, value: any) => {
    onGlyphsChange(
      glyphs.map(g => ({
        ...g,
        [field]: value,
      }))
    );
  };

  const updateMetric = (field: string, value: number) => {
    onGlyphsChange(
      glyphs.map(g => ({
        ...g,
        [field]: value,
      }))
    );
  };

  if (!firstGlyph) {
    return (
      <div className="p-4 text-sm text-gray-500">
        글리프를 선택하세요.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 기본 메타데이터 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">기본 메타데이터</h3>
        <div>
          <label className="block text-sm font-medium mb-1">글리프 이름</label>
          <input
            type="text"
            value={firstGlyph.name}
            onChange={(e) => updateGlyph('name', e.target.value)}
            disabled={isMultiple}
            className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">유니코드 포인트</label>
          <input
            type="text"
            value={firstGlyph.unicode?.join(', ') || ''}
            onChange={(e) => {
              const codes = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              updateGlyph('unicode', codes.length > 0 ? codes : undefined);
            }}
            placeholder="예: 65, 66"
            className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
          />
          <button
            onClick={() => {
              if (firstGlyph.unicode?.[0]) {
                const char = String.fromCharCode(firstGlyph.unicode[0]);
                updateGlyph('name', char);
              }
            }}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            유니코드로부터 이름 자동 지정
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">OpenType Glyph class</label>
          <input
            type="text"
            value={firstGlyph.openTypeClass || ''}
            onChange={(e) => updateGlyph('openTypeClass', e.target.value || undefined)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
          />
        </div>
      </div>

      {/* 메트릭 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">메트릭</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">LSB</label>
            <input
              type="number"
              value={firstGlyph.lsb || 0}
              onChange={(e) => updateMetric('lsb', Math.round(Number(e.target.value)))}
              className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">RSB</label>
            <input
              type="number"
              value={firstGlyph.rsb || 0}
              onChange={(e) => updateMetric('rsb', Math.round(Number(e.target.value)))}
              className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">AW</label>
            <input
              type="number"
              value={firstGlyph.advanceWidth}
              onChange={(e) => updateMetric('advanceWidth', Math.round(Number(e.target.value)))}
              className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
            />
          </div>
        </div>
        {fontData.metadata.verticalWriting && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">TSB</label>
              <input
                type="number"
                value={firstGlyph.tsb || 0}
                onChange={(e) => updateMetric('tsb', Math.round(Number(e.target.value)))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">BSB</label>
              <input
                type="number"
                value={firstGlyph.bsb || 0}
                onChange={(e) => updateMetric('bsb', Math.round(Number(e.target.value)))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">AH</label>
              <input
                type="number"
                value={firstGlyph.advanceHeight || 0}
                onChange={(e) => updateMetric('advanceHeight', Math.round(Number(e.target.value)))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* 태그 및 그룹 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">태그 및 그룹</h3>
        <div>
          <label className="block text-xs font-medium mb-1">태그</label>
          <div className="flex flex-wrap gap-1">
            {['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'gray'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const currentTags = firstGlyph.tags || [];
                  const newTags = currentTags.includes(tag)
                    ? currentTags.filter(t => t !== tag)
                    : [tag]; // 하나만 선택 가능
                  updateGlyph('tags', newTags);
                }}
                className={`px-2 py-1 text-xs rounded ${
                  firstGlyph.tags?.includes(tag)
                    ? `bg-${tag}-500 text-white`
                    : 'bg-gray-200 dark:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">그룹</label>
          <div className="space-y-1">
            {Object.keys(fontData.groups || {}).map(group => (
              <label key={group} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={firstGlyph.groups?.includes(group) || false}
                  onChange={(e) => {
                    const currentGroups = firstGlyph.groups || [];
                    const newGroups = e.target.checked
                      ? [...currentGroups, group]
                      : currentGroups.filter(g => g !== group);
                    updateGlyph('groups', newGroups);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-xs">{group}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">메모</h3>
        <textarea
          value={firstGlyph.note || ''}
          onChange={(e) => updateGlyph('note', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm"
          rows={4}
        />
      </div>

      {isMultiple && (
        <div className="text-xs text-gray-500">
          {glyphs.length}개의 글리프가 선택되었습니다. 변경사항은 모두에 적용됩니다.
        </div>
      )}
    </div>
  );
}
