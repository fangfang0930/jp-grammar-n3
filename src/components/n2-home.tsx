"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { BookOpenText, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { N2_HARD_PASSAGES, N2_LESSONS, N2_POINTS, searchN2, starsLabel } from "@/data/n2"
import { useProgress } from "@/hooks/use-progress"

export function N2Home({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const { ids, ready } = useProgress()
  const result = useMemo(() => searchN2(query), [query])
  const reviewed = N2_POINTS.filter((point) => ids.includes(point.id)).length
  const empty = query.trim().length > 0 && result.points.length === 0 && result.passages.length === 0
  const allPoints = useMemo(() => searchN2("").points, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-5 pb-28">
      <section className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          按书本格式阅读：编号、标题句、どう使う、接续、例句。点日文即可朗读。第 30 条「速度を速めつつ」已按原书截图录入。
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>已读句型</span>
            <span className="tabular-nums text-muted-foreground">
              {ready ? `${reviewed} / ${N2_POINTS.length}` : "…"}
            </span>
          </div>
          <Progress value={ready ? (reviewed / Math.max(N2_POINTS.length, 1)) * 100 : 0} />
        </div>
      </section>

      <form action="/" method="get" className="space-y-2" role="search">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="搜索编号 / 句型 / 例句…"
            aria-label="搜索 N2 语法"
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            搜索
          </button>
        </div>
        {query.trim() ? (
          <p className="text-xs text-muted-foreground">
            找到 {result.points.length} 条句型
            {result.passages.length ? ` · ${result.passages.length} 条长难句` : ""}
          </p>
        ) : null}
      </form>

      {empty ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <SearchX className="size-8" />
          <p>没有找到匹配内容</p>
        </div>
      ) : null}

      {!empty ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">语法条目</h2>
            <Badge variant="secondary">
              {(query.trim() ? result.points : allPoints).length} 条
            </Badge>
          </div>
          <ul className="grid gap-2">
            {(query.trim() ? result.points : allPoints).map(({ point, lesson }) => {
              const done = ids.includes(point.id)
              return (
                <li key={point.id}>
                  <Link href={`/n2/points/${point.id}`} className="block">
                    <Card size="sm" className="py-3 transition-colors hover:ring-primary/30">
                      <CardContent className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#ff6b6b] text-primary-foreground">
                          <span className="text-sm font-bold leading-none">
                            {String(point.number ?? "").padStart(2, "0") || "—"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{point.headline || point.title}</p>
                            <span className="shrink-0 text-xs text-amber-500">
                              {starsLabel(point.stars)}
                            </span>
                            {done ? (
                              <Badge variant="outline" className="shrink-0">
                                已读
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {point.title} · {point.meaning}
                          </p>
                        </div>
                        <BookOpenText className="size-4 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {!query.trim() ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">按课次浏览</h2>
            <Badge variant="secondary">{N2_LESSONS.length} 课</Badge>
          </div>
          <ul className="grid gap-2">
            {N2_LESSONS.map((lesson) => {
              const done = lesson.points.filter((point) => ids.includes(point.id)).length
              return (
                <li key={lesson.id}>
                  <Link href={`/n2/lessons/${lesson.id}`} className="block">
                    <Card size="sm" className="py-3">
                      <CardContent className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold">
                          {String(lesson.index).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{lesson.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lesson.titleJa} · {lesson.points.length} 条 · 已读 {done}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {query.trim() && result.passages.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">长难句</h2>
          <ul className="grid gap-2">
            {result.passages.map((item) => (
              <li key={item.id}>
                <Link href={`/n2/hard/${item.id}`}>
                  <Card size="sm" className="py-3">
                    <CardContent className="line-clamp-2 text-sm">{item.jp}</CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs leading-5 text-muted-foreground">
        TRY 原书 PDF 是扫描件。当前以精讲班例句为主做成可朗读条目；你截图的第 30 条已按原书格式录入。长难句 {N2_HARD_PASSAGES.length} 条仍可用。若要把整本 TRY 原文 OCR 入库，可以说一声。
      </p>
    </div>
  )
}
