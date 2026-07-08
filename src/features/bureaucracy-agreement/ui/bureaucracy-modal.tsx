"use client"

import { useState } from "react"

export function BureaucracyModal({ onAccept }: { onAccept: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dodges, setDodges] = useState(0)

  const dodge = () => {
    // Let them win after enough chasing.
    if (dodges >= 6) {
      onAccept()
      return
    }
    setDodges((d) => d + 1)
    setPos({ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 90 })
  }

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 p-4">
      <div className="bevel-out hard-shadow w-full max-w-md bg-[var(--win-gray)] no-select">
        <header className="flex items-center justify-between bg-[var(--win-navy)] px-2 py-1 text-white">
          <span className="font-ui text-[13px] font-bold">⚠ USER AGREEMENT REQUIRED</span>
          <span aria-hidden="true" className="bevel-out flex h-4 w-4 items-center justify-center bg-[var(--win-gray)] text-[10px] text-black">
            ✕
          </span>
        </header>
        <div className="p-4">
          <div className="bevel-field max-h-40 overflow-y-auto bg-white p-2 font-serifold text-[11px] leading-snug text-black">
            <p className="font-bold">EGGCORP END-USER EGG LICENSE AGREEMENT (EUELA) — REV. 7,402</p>
            <p className="mt-1">
              By continuing to interact with the Egg, You (&quot;the Clicker&quot;) hereby relinquish all claims to
              productivity, dignity, and at least 14% of your remaining attention span. The Egg makes no warranty,
              express or implied, regarding its structural integrity, emotional availability, or willingness to be
              clicked.
            </p>
            <p className="mt-1">
              Clause 9.3: The Egg reserves the right to flee, invert reality, or revoke gravity at any time without
              notice. Clause 12.1: You agree that all yolk-related incidents are your sole responsibility. Clause
              88.8: This agreement is legally binding in 3 fictional jurisdictions.
            </p>
            <p className="mt-1 italic">Scroll bar provided for the illusion of choice.</p>
          </div>
          <p className="font-ui mt-3 text-center text-[12px] font-bold text-black">
            Do you accept these perfectly reasonable terms?
          </p>
          <div className="relative mt-3 flex h-16 items-center justify-center">
            <button
              type="button"
              onMouseEnter={dodge}
              onClick={dodge}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.15s ease" }}
              className="bevel-out font-ui absolute bg-[var(--win-gray)] px-6 py-1.5 text-[12px] font-bold text-black active:bevel-in"
            >
              Accept
            </button>
          </div>
          <p className="font-ui mt-1 text-center text-[10px] text-black/50">
            {dodges === 0 ? "(It's right there. Just click it.)" : `Agreement evaded ${dodges} time(s)...`}
          </p>
        </div>
      </div>
    </div>
  )
}
