"use client"

import type { ReactNode } from "react"

type WinWindowProps = {
  title: string
  children: ReactNode
  className?: string
  alert?: boolean
  icon?: ReactNode
}

export function WinWindow({ title, children, className = "", alert = false, icon }: WinWindowProps) {
  return (
    <section
      className={`bevel-out hard-shadow-sm bg-[var(--win-gray)] no-select ${className}`}
      aria-label={title}
    >
      {/* Title bar */}
      <header
        className={`flex items-center justify-between gap-2 px-1.5 py-1 ${
          alert ? "blink-alert" : "bg-[var(--win-navy)] text-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {icon}
          <span className="font-ui truncate text-[13px] font-bold tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {["_", "□", "✕"].map((g, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="bevel-out font-ui flex h-4 w-4 items-center justify-center bg-[var(--win-gray)] text-[10px] leading-none text-black"
            >
              {g}
            </span>
          ))}
        </div>
      </header>
      <div className="p-2">{children}</div>
    </section>
  )
}
