"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { SpeakButton } from "@/components/speak-button"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { CatalogItem } from "@/data/catalog"
import { useProgress } from "@/hooks/use-progress"
import { useSpeech } from "@/hooks/use-speech"

export function PatternReader({
  item,
  prev,
  next,
}: {
  item: CatalogItem
  prev?: CatalogItem
  next?: CatalogItem
}) {
  const [showCn, setShowCn] = useState(false)
  const speech = useSpeech()
  const progress = useProgress()
  const reviewed = progress.has(item.id)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-24">
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-gradient-to-br from-primary to-[#ff6b6b] py-6 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/80">
                {String(item.index).padStart(3, "0")} · 第 {item.sourcePage} 页
              </p>
              <CardTitle className="mt-1 text-2xl font-bold text-white">{item.title}</CardTitle>
            </div>
            {reviewed ? <Badge variant="secondary">已读</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 py-5">
          <section>
            <p className="mb-2 text-xs font-semibold text-primary">用法</p>
            <p className="text-base leading-7">{item.usage}</p>
          </section>
          <section className="rounded-xl bg-muted/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-primary">例文</p>
              <SpeakButton
                speaking={speech.isSpeaking}
                onSpeak={() => speech.speakLang(item.jp, "ja")}
                onStop={speech.stop}
                label="朗读例句"
              />
            </div>
            <p className="text-lg leading-8">{item.jp}</p>
            {showCn ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.cn}</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">译文已隐藏，先自己读一遍。</p>
            )}
          </section>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1"
            onClick={() => setShowCn((value) => !value)}
          >
            {showCn ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
            {showCn ? "隐藏译文" : "显示译文"}
          </Button>
          <Button
            type="button"
            variant={reviewed ? "secondary" : "default"}
            className="w-full sm:flex-1"
            onClick={() => progress.toggle(item.id)}
          >
            {reviewed ? "标为未读" : "标为已读"}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex gap-2">
        {prev ? (
          <Link
            href={`/read/${prev.id}`}
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            上一条 {prev.title}
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/read/${next.id}`}
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            下一条 {next.title}
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
