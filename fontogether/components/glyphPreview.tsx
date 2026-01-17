import { GlyphData, ColorTag } from "@/types/font";

interface GlyphPreviewProps {
  id: number;
  glyph?: GlyphData;
  onDoubleClick?: () => void;
  isSelected: boolean;
  size?: number;
}

const colorTagMap: { [key in ColorTag]: string } = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};

export default function GlyphPreview({ id, glyph, onDoubleClick = () => {}, isSelected, size = 120 }: GlyphPreviewProps) {
  const tagColor = glyph?.tags?.[0] as ColorTag | undefined;
  const tagBg = tagColor ? colorTagMap[tagColor] : '';

  return (
    <div
      data-id={id}
      onDoubleClick={onDoubleClick}
      className={`relative ${isSelected ? "bg-gray-200 dark:bg-zinc-700" : "bg-white dark:bg-black"} shadow-md dark:shadow-zinc-800 rounded-lg transition-all select-none cursor-pointer`}
      style={{ width: `${size}px`, height: `${size + 30}px` }}
    >
      {/* 태그 색상 표시 */}
      {tagBg && (
        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full ${tagBg}`} />
      )}
      
      {/* 글리프 미리보기 영역 */}
      <div className="flex items-center justify-center" style={{ height: `${size}px` }}>
        {glyph?.unicode?.[0] ? (
          <div 
            className="font-light" 
            style={{ 
              fontFamily: 'system-ui',
              fontSize: `${size * 0.6}px`,
              lineHeight: 1,
            }}
          >
            {String.fromCharCode(glyph.unicode[0])}
          </div>
        ) : (
          <div className="text-xs text-gray-400">{glyph?.name || `Glyph ${id}`}</div>
        )}
      </div>
      
      {/* 글리프 이름 */}
      <p className="p-2 text-xs text-center text-black dark:text-white">
        {glyph?.name || `Glyph ${id}`}
      </p>
    </div>
  );
}