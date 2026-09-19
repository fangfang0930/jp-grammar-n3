"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { splitSentences } from "@/lib/sentences"
import type { SpeechLang } from "@/lib/speech"
import type { useSpeech } from "@/hooks/use-speech"

type SpeechApi = ReturnType<typeof useSpeech>

export function SpeakableText({
  text,
  lang = "ja",
  speech,
  className,
  scaleClass = "text-xl leading-9",
}: {
  text: string
  lang?: SpeechLang
  speech: SpeechApi
  className?: string
  scaleClass?: string
}) {
  const sentences = useMemo(() => splitSentences(text), [text])
  const [active, setActive] = useState<number | null>(null)
  const highlight = speech.isSpeaking ? active : null

  if (sentences.length === 0) return null

  return (
    <p className={cn("text-pretty", scaleClass, className)}>
      {sentences.map((sentence, index) => {
        const isActive = highlight === index
        return (
          <button
            key={`${index}-${sentence.slice(0, 12)}`}
            type="button"
            data-testid="speakable-sentence"
            aria-pressed={isActive}
            onClick={() => {
              if (isActive) {
                speech.stop()
                setActive(null)
                return
              }
              setActive(index)
              speech.speakLang(sentence, lang)
            }}
            className={cn(
              "rounded-md px-0.5 text-left transition-colors",
              "hover:bg-primary/10 active:bg-primary/20",
              isActive && "bg-primary/15 ring-1 ring-primary/30",
            )}
          >
            {sentence}
          </button>
        )
      })}
    </p>
  )
}
