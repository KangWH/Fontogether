export default function GlyphPreview({ id, onDoubleClick = () => {}, isSelected }: { id: number, onDoubleClick?: () => void, isSelected: Boolean }) {
  return (
    <div
      key={id}
      data-id={id}
      onDoubleClick={onDoubleClick}
      className={`selectable-item ${isSelected ? "bg-blue-500 color-white" : "bg-white dark:bg-black"} shadow-md dark:shadow-zinc-800 rounded-lg transition-all select-none`}
      style={{ width: "120px", height: "150px" }}
    >
      <img style={{ height: "120px" }} />
      <p className={isSelected ? "p-2 text-white transition-all" : "p-2 text-black dark:text-white transition-all"}>Glyph {id}</p>
    </div>
  )
}