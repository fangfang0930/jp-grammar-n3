"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { BookOpenText, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { N2_HARD_PASSAGES, N2_LESSONS, N2_POINTS, searchN2 } from "@/data/n2"
import { useProgress } from "@/hooks/use-progress"

export function N2Home({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const { ids, ready } = useProgress()
  const result = useMemo(() => searchN2(query), [query])
  const reviewed = N2_POINTS.filter((point) => ids.includes(point.id)).length
  const empty = query.trim().length > 0 && result.points.length === 0 && result.passages.length === 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-5 pb-28">
      <section className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          按《TRY！新日语能力考试N2 语法必备》14 课课次阅读。点日文即可朗读，手机也能用。译文可隐藏。
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
            placeholder="搜索句型 / 中文 / 日文…"
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

      {!query.trim() ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">14 课目录</h2>
            <Badge variant="secondary">{N2_LESSONS.length} 课 · {N2_POINTS.length} 条</Badge>
          </div>
          <ul className="grid gap-2">
            {N2_LESSONS.map((lesson) => {
              const done = lesson.points.filter((point) => ids.includes(point.id)).length
              return (
                <li key={lesson.id}>
                  <Link href={`/n2/lessons/${lesson.id}`} className="block">
                    <Card size="sm" className="py-3 transition-colors hover:ring-primary/30">
                      <CardContent className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#ff6b6b] text-sm font-bold text-primary-foreground">
                          {String(lesson.index).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{lesson.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lesson.titleJa} · {lesson.points.length} 条 · 已读 {done}
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
      ) : (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">句型</h2>
          <ul className="grid gap-2">
            {result.points.map(({ point, lesson }) => (
              <li key={point.id}>
                <Link href={`/n2/points/${point.id}`} className="block">
                  <Card size="sm" className="py-3">
                    <CardContent>
                      <p className="font-semibold">{point.title}</p>
                      <p className="text-xs text-muted-foreground">
                        第{lesson.index}课 {lesson.title} · {point.meaning}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {result.passages.length > 0 ? (
            <>
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
            </>
          ) : null}
        </section>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        仓库里没有那份 Windows 路径上的 TRY PDF，所以按公开的 14 课课次做成可点选朗读的课文。长难句 {N2_HARD_PASSAGES.length} 条来自已上传的《N2长难句补弱》。
      </p>
    </div>
  )
}
