import { GlyphData_OLD, ColorTag } from "@/types/font";

interface GlyphPreviewProps {
  id: number;
  glyph?: GlyphData_OLD;
  onDoubleClick?: () => void;
  isSelected: boolean;
  size?: number;
}

export default function GlyphPreview({ id, glyph, onDoubleClick = () => {}, isSelected, size = 120 }: GlyphPreviewProps) {
  const tagColor = glyph?.tags?.[0] as ColorTag | undefined;

  const colorName = tagColor ? {
    red: 'red',
    orange: 'orange',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    purple: 'purple',
    gray: 'gray',
  }[tagColor] : null;
  const bgColorName = colorName ? `bg-${colorName}-500` : 'bg-transparent';

  return (
    <div
      data-id={id}
      onDoubleClick={onDoubleClick}
      className={`relative ${isSelected ? "bg-gray-200 dark:bg-zinc-700" : "bg-white dark:bg-black"} shadow-md dark:shadow-zinc-800 rounded-lg select-none overflow-hidden`}
      style={{ width: `${size}px` }}
    >
      {/* 태그 색상 표시 */}
      <div className={`h-2 ${bgColorName} opacity-50`} />
      
      {/* 글리프 미리보기 영역 */}
      <div className="flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px` }}>
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
      <p className="p-1 text-xs text-center text-black dark:text-white">
        {glyph?.name || `Glyph ${id}`}
      </p>
    </div>
  );
}