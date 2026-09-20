"use client"

import Link from "next/link"
import { SpeakableText } from "@/components/speakable-text"
import { ReaderToolbar } from "@/components/reader-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { N2Lesson, N2Point } from "@/data/n2"
import { starsLabel } from "@/data/n2"
import { fontClass, useReaderPrefs } from "@/hooks/use-reader-prefs"
import { useProgress } from "@/hooks/use-progress"
import { useSpeech } from "@/hooks/use-speech"

export function N2PointReader({
  point,
  lesson,
  prev,
  next,
}: {
  point: N2Point
  lesson: N2Lesson
  prev?: N2Point
  next?: N2Point
}) {
  const speech = useSpeech()
  const prefs = useReaderPrefs()
  const progress = useProgress()
  const reviewed = progress.has(point.id)
  const scale = fontClass(prefs.fontScale)
  const headline = point.headline || point.title
  const number = point.number
  const allJp = [headline, ...point.examples.map((item) => item.jp)].join("。")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <Card className="overflow-hidden py-0">
        <CardHeader className="space-y-3 border-b py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {number != null ? `${number}` : ""} · 第 {lesson.index} 课 · {lesson.title}
              </p>
              <CardTitle className="mt-1 text-2xl font-bold tracking-wide text-primary">
                {headline}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{point.title}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-amber-500">{starsLabel(point.stars)}</span>
              {reviewed ? <Badge variant="secondary">已读</Badge> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          <section className="rounded-xl bg-muted/60 p-4">
            <p className="mb-2 text-xs font-semibold text-primary">どう使う？</p>
            {!prefs.hideCn ? (
              <p className="text-base leading-7">{point.meaning}</p>
            ) : (
              <p className="text-sm text-muted-foreground">中文说明已隐藏</p>
            )}
            <p className="mt-3 rounded-lg bg-card px-3 py-2 font-mono text-sm text-primary">
              {point.connection}
            </p>
          </section>

          <ReaderToolbar
            speaking={speech.isSpeaking}
            onSpeak={() => speech.speakLang(allJp, "ja")}
            onStop={speech.stop}
            hideCn={prefs.hideCn}
            onToggleCn={() => prefs.setHideCn(!prefs.hideCn)}
            fontScale={prefs.fontScale}
            onCycleFont={prefs.cycleFont}
          />

          {point.examples.map((example, index) => (
            <section key={index} className="rounded-xl border border-border/70 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">例文 {index + 1}</p>
              <SpeakableText text={example.jp} speech={speech} scaleClass={scale} />
              {!prefs.hideCn && example.cn ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{example.cn}</p>
              ) : null}
            </section>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            variant={reviewed ? "secondary" : "default"}
            className="min-h-11 w-full"
            onClick={() => progress.toggle(point.id)}
          >
            {reviewed ? "标为未读" : "标为已读"}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/n2/points/${prev.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            上一条
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/n2/points/${next.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            下一条
          </Link>
        ) : null}
      </div>
      <Link href={`/n2/lessons/${lesson.id}`} className="text-center text-sm text-primary">
        返回本课
      </Link>
      {speech.toast ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2 text-sm text-background">
          {speech.toast}
        </div>
      ) : null}
    </div>
  )
}
