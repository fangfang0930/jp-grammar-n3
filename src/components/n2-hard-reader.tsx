"use client"

import Link from "next/link"
import { SpeakableText } from "@/components/speakable-text"
import { ReaderToolbar } from "@/components/reader-toolbar"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { N2HardPassage } from "@/data/n2"
import { fontClass, useReaderPrefs } from "@/hooks/use-reader-prefs"
import { useSpeech } from "@/hooks/use-speech"

export function N2HardReader({
  item,
  prev,
  next,
}: {
  item: N2HardPassage
  prev?: N2HardPassage
  next?: N2HardPassage
}) {
  const speech = useSpeech()
  const prefs = useReaderPrefs()
  const scale = fontClass(prefs.fontScale)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-6 text-primary-foreground">
          <p className="text-xs text-white/80">长难句 {String(item.index).padStart(2, "0")}</p>
          <CardTitle className="text-xl font-bold text-white">点句子就能朗读</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          <SpeakableText text={item.jp} speech={speech} scaleClass={scale} />
          {!prefs.hideCn ? (
            <p className="text-sm leading-6 text-muted-foreground">{item.cn}</p>
          ) : (
            <p className="text-sm text-muted-foreground">译文已隐藏。先自己读日文。</p>
          )}
          <ReaderToolbar
            speaking={speech.isSpeaking}
            onSpeak={() => speech.speakLang(item.jp, "ja")}
            onStop={speech.stop}
            hideCn={prefs.hideCn}
            onToggleCn={() => prefs.setHideCn(!prefs.hideCn)}
            fontScale={prefs.fontScale}
            onCycleFont={prefs.cycleFont}
            speakLabel="朗读整句"
          />
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/n2/hard/${prev.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            上一句
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/n2/hard/${next.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            下一句
          </Link>
        ) : null}
      </div>
      {speech.toast ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2 text-sm text-background">
          {speech.toast}
        </div>
      ) : null}
    </div>
  )
}
