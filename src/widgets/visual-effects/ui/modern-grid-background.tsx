"use client"

import dynamic from "next/dynamic"

const GridScan = dynamic(
  () => import("@/shared/ui/GridScan").then((module) => module.GridScan),
  { ssr: false },
)

export function ModernGridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-75" aria-hidden="true">
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#2F293A"
        gridScale={0.1}
        scanColor="#FF9FFC"
        scanOpacity={0.4}
        enablePost
        bloomIntensity={0.6}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
        lineJitter={0.1}
        scanGlow={0.5}
        scanSoftness={2}
        enableWebcam={false}
        showPreview={false}
      />
    </div>
  )
}
