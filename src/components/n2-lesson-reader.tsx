"use client"

import Link from "next/link"
import { SpeakableText } from "@/components/speakable-text"
import { ReaderToolbar } from "@/components/reader-toolbar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { N2Lesson } from "@/data/n2"
import { fontClass, useReaderPrefs } from "@/hooks/use-reader-prefs"
import { useProgress } from "@/hooks/use-progress"
import { useSpeech } from "@/hooks/use-speech"

export function N2LessonReader({
  lesson,
  prev,
  next,
}: {
  lesson: N2Lesson
  prev?: N2Lesson
  next?: N2Lesson
}) {
  const speech = useSpeech()
  const prefs = useReaderPrefs()
  const progress = useProgress()
  const scale = fontClass(prefs.fontScale)

  const speakLesson = () => {
    const jp = lesson.points
      .flatMap((point) => [point.title, ...point.examples.map((ex) => ex.jp)])
      .join("。")
    speech.speakLang(jp, "ja")
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-6 text-primary-foreground">
          <p className="text-xs text-white/80">第 {lesson.index} 课</p>
          <CardTitle className="text-2xl font-bold text-white">{lesson.title}</CardTitle>
          <p className="text-sm text-white/90">{lesson.titleJa}</p>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          <p className="text-sm leading-6 text-muted-foreground">{lesson.canDo}</p>
          <ReaderToolbar
            speaking={speech.isSpeaking}
            onSpeak={speakLesson}
            onStop={speech.stop}
            hideCn={prefs.hideCn}
            onToggleCn={() => prefs.setHideCn(!prefs.hideCn)}
            fontScale={prefs.fontScale}
            onCycleFont={prefs.cycleFont}
            speakLabel="朗读本课日文"
          />
        </CardContent>
      </Card>

      {lesson.points.map((point) => {
        const done = progress.has(point.id)
        return (
          <Card key={point.id} className="overflow-hidden py-0">
            <CardHeader className="border-b py-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/n2/points/${point.id}`} className="min-w-0">
                  <CardTitle className="text-xl text-primary">{point.title}</CardTitle>
                </Link>
                {done ? <Badge variant="secondary">已读</Badge> : null}
              </div>
              {!prefs.hideCn ? (
                <>
                  <p className="text-sm leading-6">{point.meaning}</p>
                  <p className="text-xs text-muted-foreground">接续：{point.connection}</p>
                </>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              {point.examples.map((example, index) => (
                <div key={`${point.id}-${index}`} className="rounded-xl bg-muted/60 p-4">
                  <SpeakableText text={example.jp} speech={speech} scaleClass={scale} />
                  {!prefs.hideCn ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{example.cn}</p>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-primary"
                onClick={() => progress.mark(point.id)}
              >
                {done ? "已标记为读过" : "标为已读"}
              </button>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/n2/lessons/${prev.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            上一课
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/n2/lessons/${next.id}`}
            className={buttonVariants({ variant: "outline", className: "min-h-11 flex-1" })}
          >
            下一课
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
