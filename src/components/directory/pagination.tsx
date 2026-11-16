"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const DIRECTORY_PAGE_SIZE = 20

export function slicePage<T>(
  items: T[],
  page: number,
  pageSize = DIRECTORY_PAGE_SIZE
) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  const from = items.length === 0 ? 0 : (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, items.length)
  return {
    page: current,
    pageCount,
    total: items.length,
    from,
    to,
    rows: items.slice((current - 1) * pageSize, current * pageSize),
  }
}

export function usePagedRows<T>(items: T[], resetKey: string) {
  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [resetKey])
  const paged = useMemo(() => slicePage(items, page), [items, page])
  useEffect(() => {
    if (paged.page !== page) {
      setPage(paged.page)
    }
  }, [page, paged.page])
  return { ...paged, setPage }
}

function pageWindow(current: number, count: number) {
  const start = Math.max(1, Math.min(current - 2, count - 4))
  const end = Math.min(count, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export function DirectoryPagination({
  page,
  pageCount,
  total,
  from,
  to,
  emptyLabel,
  onPage,
}: {
  page: number
  pageCount: number
  total: number
  from: number
  to: number
  emptyLabel: string
  onPage: (page: number) => void
}) {
  const pages = pageWindow(page, pageCount)
  return (
    <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? emptyLabel : `${from}–${to} sur ${total}`}
      </p>
      {pageCount > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Pages">
          <PageButton
            disabled={page <= 1}
            label="Page précédente"
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </PageButton>
          {pages.map((item) => (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPage(item)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm",
                item === page
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item}
            </button>
          ))}
          <PageButton
            disabled={page >= pageCount}
            label="Page suivante"
            onClick={() => onPage(page + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </PageButton>
        </nav>
      ) : null}
    </div>
  )
}

function PageButton({
  disabled,
  label,
  onClick,
  children,
}: {
  disabled: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}
