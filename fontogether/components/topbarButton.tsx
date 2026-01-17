interface TopbarButtonTrait {
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function TopbarButton({ disabled = false, selected = false, onClick = () => {}, children }: TopbarButtonTrait) {
  return (
    <button onClick={onClick} disabled={disabled} className="h-9 p-2 bg-white text-black hover:bg-gray-100 active:bg-gray-200 dark:bg-black dark:text-white dark:hover:bg-zinc-900 dark:active:bg-zinc-800 rounded-full shadow-md dark:shadow-zinc-800 leading-none disabled:opacity-25">
      {children}
    </button>
  )
}

export function TopbarButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-9 p-1 flex flex-row gap-1 bg-white text-black dark:bg-black dark:text-white rounded-full shadow-md dark:shadow-zinc-800 leading-none">
      {children}
    </div>
  )
}

export function TopbarGroupedButton({ disabled = false, selected = false, onClick = () => {}, children }: TopbarButtonTrait) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-7 p-1 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-zinc-900 dark:active:bg-zinc-800 rounded-full leading-none disabled:opacity-25 ${selected ? "bg-gray-100" : ""}`}
    >
      {children}
    </button>
  )
}
