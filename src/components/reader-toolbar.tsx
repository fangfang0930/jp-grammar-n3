"use client"

import { Eye, EyeOff, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpeakButton } from "@/components/speak-button"
import type { FontScale } from "@/hooks/use-reader-prefs"

export function ReaderToolbar({
  speaking,
  onSpeak,
  onStop,
  hideCn,
  onToggleCn,
  fontScale,
  onCycleFont,
  speakLabel = "朗读日文",
}: {
  speaking: boolean
  onSpeak: () => void
  onStop: () => void
  hideCn: boolean
  onToggleCn: () => void
  fontScale: FontScale
  onCycleFont: () => void
  speakLabel?: string
}) {
  const fontLabel = fontScale === "md" ? "小" : fontScale === "xl" ? "大" : "中"
  return (
    <div className="flex flex-wrap gap-2">
      <SpeakButton
        speaking={speaking}
        onSpeak={onSpeak}
        onStop={onStop}
        label={speakLabel}
        className="min-h-11 flex-1"
      />
      <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={onToggleCn}>
        {hideCn ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
        {hideCn ? "显示中文" : "隐藏中文"}
      </Button>
      <Button type="button" variant="outline" className="min-h-11 px-3" onClick={onCycleFont}>
        <Type data-icon="inline-start" />
        字号 {fontLabel}
      </Button>
    </div>
  )
}
