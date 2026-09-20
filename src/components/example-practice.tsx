"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import { SpeakButton } from "@/components/speak-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CatalogItem } from "@/data/catalog"
import { useProgress } from "@/hooks/use-progress"
import { useSpeech } from "@/hooks/use-speech"

export function ExamplePractice({ items }: { items: CatalogItem[] }) {
  const deck = useMemo(() => items.filter((item) => item.jp.trim()), [items])
  const [cursor, setCursor] = useState(0)
  const [showCn, setShowCn] = useState(false)
  const speech = useSpeech()
  const progress = useProgress()

  if (deck.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16 text-center text-muted-foreground">
        还没有可练习的例句。
      </div>
    )
  }

  const card = deck[Math.min(cursor, deck.length - 1)]
  const atStart = cursor === 0
  const atEnd = cursor === deck.length - 1

  const go = (next: number) => {
    speech.stop()
    setShowCn(false)
    setCursor(next)
    progress.mark(deck[next].id)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>例句练习</span>
          <span className="tabular-nums text-muted-foreground">
            {cursor + 1} / {deck.length}
          </span>
        </div>
        <Progress value={((cursor + 1) / deck.length) * 100} />
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-5 text-primary-foreground">
          <p className="text-xs text-white/80">{String(card.index).padStart(3, "0")}</p>
          <CardTitle className="text-xl text-white">{card.title}</CardTitle>
          <p className="text-sm text-white/85">{card.usage}</p>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <p className="text-xl leading-9">{card.jp}</p>
          {showCn ? (
            <p className="text-sm leading-6 text-muted-foreground">{card.cn}</p>
          ) : (
            <p className="text-sm text-muted-foreground">先读日文，再揭开译文。</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <SpeakButton
              speaking={speech.isSpeaking}
              onSpeak={() => speech.speakLang(card.jp, "ja")}
              onStop={speech.stop}
              className="flex-1"
            />
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCn((v) => !v)}>
              {showCn ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
              {showCn ? "隐藏" : "译文"}
            </Button>
          </div>
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={atStart}
              onClick={() => go(cursor - 1)}
            >
              <ChevronLeft data-icon="inline-start" />
              上一句
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={atEnd}
              onClick={() => go(cursor + 1)}
            >
              下一句
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
