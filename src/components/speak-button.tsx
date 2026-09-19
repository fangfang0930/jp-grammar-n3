"use client"

import { Volume2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SpeakButtonProps = {
  speaking: boolean
  onSpeak: () => void
  onStop: () => void
  label?: string
  className?: string
}

export function SpeakButton({
  speaking,
  onSpeak,
  onStop,
  label = "朗读",
  className,
}: SpeakButtonProps) {
  return (
    <Button
      type="button"
      variant={speaking ? "secondary" : "outline"}
      size="lg"
      className={cn("min-h-11 gap-1.5", className)}
      onClick={speaking ? onStop : onSpeak}
    >
      {speaking ? <Square data-icon="inline-start" /> : <Volume2 data-icon="inline-start" />}
      {speaking ? "停止" : label}
    </Button>
  )
}
