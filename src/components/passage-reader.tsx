"use client"

import Link from "next/link"
import { SpeakButton } from "@/components/speak-button"
import { SpeakableText } from "@/components/speakable-text"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReadingPassage } from "@/data/catalog"
import { useSpeech } from "@/hooks/use-speech"

export function PassageReader({
  passage,
  prev,
  next,
}: {
  passage: ReadingPassage
  prev?: ReadingPassage
  next?: ReadingPassage
}) {
  const speech = useSpeech()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-6 text-primary-foreground">
          <p className="text-xs text-white/80">
            {passage.sourceFile}
            {passage.sourcePage ? ` · 第 ${passage.sourcePage} 页` : ""}
          </p>
          <CardTitle className="text-2xl font-bold text-white">{passage.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          {passage.status !== "ready" ? (
            <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
              {passage.note || "这份 PDF 还没有可练习的文字。"}
            </p>
          ) : (
            <SpeakableText text={passage.body} speech={speech} />
          )}
        </CardContent>
        <CardFooter>
          <SpeakButton
            speaking={speech.isSpeaking}
            onSpeak={() => speech.speakLang(passage.body, "ja")}
            onStop={speech.stop}
            label="朗读全文"
            className="w-full"
          />
        </CardFooter>
      </Card>

      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/passages/${prev.id}`}
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            上一篇
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/passages/${next.id}`}
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            下一篇
          </Link>
        ) : null}
      </div>
    </div>
  )
}
