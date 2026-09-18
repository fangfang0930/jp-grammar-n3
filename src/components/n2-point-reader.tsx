"use client"

import Link from "next/link"
import { SpeakableText } from "@/components/speakable-text"
import { ReaderToolbar } from "@/components/reader-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { N2Lesson, N2Point } from "@/data/n2"
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
  const allJp = [point.title, ...point.examples.map((item) => item.jp)].join("。")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-6 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-white/80">
                第 {lesson.index} 课 · {lesson.title}
              </p>
              <CardTitle className="mt-1 text-2xl font-bold text-white">{point.title}</CardTitle>
            </div>
            {reviewed ? <Badge variant="secondary">已读</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          {!prefs.hideCn ? (
            <>
              <section>
                <p className="mb-1 text-xs font-semibold text-primary">意思</p>
                <p className="text-base leading-7">{point.meaning}</p>
              </section>
              <section>
                <p className="mb-1 text-xs font-semibold text-primary">接续</p>
                <p className="text-sm leading-6 text-muted-foreground">{point.connection}</p>
              </section>
            </>
          ) : null}
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
            <section key={index} className="rounded-xl bg-muted/60 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">例文 {index + 1}</p>
              <SpeakableText text={example.jp} speech={speech} scaleClass={scale} />
              {!prefs.hideCn ? (
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
