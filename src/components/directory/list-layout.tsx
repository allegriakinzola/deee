import type { ReactNode } from "react"

export function DirectoryTableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="directory-table-scroll min-w-0 w-full overflow-x-auto overflow-y-hidden">
      {children}
    </div>
  )
}
