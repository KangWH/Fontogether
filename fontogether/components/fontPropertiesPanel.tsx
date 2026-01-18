"use client";

import { FontData } from "@/types/font";
import { useState } from "react";
import Spacer from "./spacer";

interface FontPropertiesPanelProps {
  fontData: FontData;
  onFontDataChange: (data: FontData) => void;
}

export default function FontPropertiesPanel({ fontData, onFontDataChange }: FontPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'metrics' | 'language' | 'panose'>('metadata');

  const updateMetadata = (field: string, value: any) => {
    onFontDataChange({
      ...fontData,
      metadata: {
        ...fontData.metadata,
        [field]: value,
      },
    });
  };

  const updateMetrics = (field: string, value: number) => {
    onFontDataChange({
      ...fontData,
      metadata: {
        ...fontData.metadata,
        [field]: value,
      },
      metrics: {
        ...fontData.metrics,
        [field]: value,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Segmented Control */}
      <div className="p-1 flex bg-gray-100 dark:bg-zinc-800 rounded-full mx-1 mt-1">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'metadata' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          메타데이터
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'metrics' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          메트릭
        </button>
        <button
          onClick={() => setActiveTab('panose')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'panose' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          PANOSE
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">표시용 서체 이름</label>
              <input
                type="text"
                value={fontData.metadata.familyName}
                onChange={(e) => updateMetadata('familyName', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">표시용 글꼴 이름</label>
              <input
                type="text"
                value={fontData.metadata.fullName}
                onChange={(e) => updateMetadata('fullName', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">웨이트 이름</label>
              <input
                type="text"
                value={fontData.metadata.styleName}
                onChange={(e) => updateMetadata('styleName', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PostScript 이름</label>
              <input
                type="text"
                value={fontData.metadata.postscriptName}
                onChange={(e) => updateMetadata('postscriptName', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">저작권</label>
              <input
                type="text"
                value={fontData.metadata.copyright || ''}
                onChange={(e) => updateMetadata('copyright', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">글꼴 버전</label>
              <input
                type="text"
                value={fontData.metadata.version}
                onChange={(e) => updateMetadata('version', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                언어별 메타데이터 편집
              </button>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">1 em에 들어가는 unit 수</label>
              <input
                type="number"
                value={fontData.metrics.unitsPerEm}
                onChange={(e) => updateMetrics('unitsPerEm', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">높이 (Ascender)</label>
              <input
                type="number"
                value={fontData.metrics.ascender}
                onChange={(e) => updateMetrics('ascender', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">깊이 (Descender)</label>
              <input
                type="number"
                value={fontData.metrics.descender}
                onChange={(e) => updateMetrics('descender', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이탤릭체 기울기</label>
              <input
                type="number"
                value={fontData.metrics.italicAngle || 0}
                onChange={(e) => updateMetrics('italicAngle', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">세로쓰기 지원</label>
              <input
                type="checkbox"
                checked={fontData.metrics.verticalWriting || false}
                onChange={(e) => updateMetadata('verticalWriting', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">X-height</label>
              <input
                type="number"
                value={fontData.metrics.xHeight}
                onChange={(e) => updateMetrics('xHeight', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cap height</label>
              <input
                type="number"
                value={fontData.metrics.capHeight}
                onChange={(e) => updateMetrics('capHeight', Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
        )}

        {activeTab === 'panose' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">PANOSE 정보는 나중에 구현됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
