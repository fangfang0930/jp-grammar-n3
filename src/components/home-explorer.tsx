"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { BookOpenText, FileText, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { CatalogItem, ReadingPassage } from "@/data/catalog"
import { searchCatalog, searchPassages, TARGET_PATTERN_COUNT } from "@/data/catalog"
import { useProgress } from "@/hooks/use-progress"

function Highlight({ text, query }: { text: string; query: string }) {
  const keyword = query.trim()
  if (!keyword) return text
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded-sm bg-primary/15 px-0.5 text-primary">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function HomeExplorer({
  catalog,
  passages,
  pdfDir,
  pdfFiles,
  ingestErrors,
}: {
  catalog: CatalogItem[]
  passages: ReadingPassage[]
  pdfDir: string
  pdfFiles: string[]
  ingestErrors: { fileName: string; message: string }[]
}) {
  const [query, setQuery] = useState("")
  const { ids, ready } = useProgress()
  const readyPassages = passages.filter((item) => item.status === "ready")
  const blocked = passages.filter((item) => item.status !== "ready")

  const filteredCatalog = useMemo(() => searchCatalog(query), [query])
  const filteredPassages = useMemo(
    () => searchPassages(readyPassages, query),
    [query, readyPassages],
  )

  const reviewed = catalog.filter((item) => ids.includes(item.id)).length
  const emptySearch =
    query.trim().length > 0 && filteredCatalog.length === 0 && filteredPassages.length === 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-5 pb-24">
      <section className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          用 N3 句型 PDF 做阅读练习：先读短篇，再对照 123 条语条。译文默认收起。
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>已读句型</span>
            <span className="tabular-nums text-muted-foreground">
              {ready ? `${reviewed} / ${catalog.length}` : "…"}
            </span>
          </div>
          <Progress value={ready ? (reviewed / Math.max(catalog.length, 1)) * 100 : 0} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/practice" className={buttonVariants({ size: "lg", className: "sm:flex-1" })}>
            开始例句练习
          </Link>
          {readyPassages[0] ? (
            <Link
              href={`/passages/${readyPassages[0].id}`}
              className={buttonVariants({ variant: "outline", size: "lg", className: "sm:flex-1" })}
            >
              阅读第一篇
            </Link>
          ) : null}
        </div>
      </section>

      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索语法 / 中文 / 日文例句…"
        className="h-11 rounded-xl bg-card px-4 text-base"
      />

      {emptySearch ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <SearchX className="size-8" />
          <p>没有找到匹配的语法或篇章</p>
          <p className="text-sm">换个关键词，或清空搜索看全部内容。</p>
        </div>
      ) : null}

      {!emptySearch ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">阅读篇章</h2>
              <p className="text-xs text-muted-foreground">
                来自 {pdfDir} · {pdfFiles.length} 个 PDF
              </p>
            </div>
            <Badge variant="secondary">{filteredPassages.length} 篇</Badge>
          </div>
          {filteredPassages.length === 0 && readyPassages.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>还没有可阅读的文字层</CardTitle>
                <CardDescription>
                  把 PDF 放到 <code className="font-mono">content/pdfs/</code>，或设置环境变量
                  CONTENT_PDF_DIR。扫描件需要文字层；仓库已带一篇可提取的样例。
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          <ul className="grid gap-3">
            {filteredPassages.map((passage) => (
              <li key={passage.id}>
                <Link href={`/passages/${passage.id}`} className="block">
                  <Card className="transition-colors hover:ring-primary/30">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base">
                          <Highlight text={passage.title} query={query} />
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          <Highlight text={passage.body} query={query} />
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {blocked.length > 0 ? (
            <p className="text-xs leading-5 text-muted-foreground">
              {blocked.length} 个扫描版 PDF 没有提取到正文（例如《N3句型语法123条》原件）。语条已从该文档表格录入，可在下方练习。
            </p>
          ) : null}
          {ingestErrors.length > 0 ? (
            <p className="text-xs text-destructive">
              {ingestErrors.map((error) => `${error.fileName}: ${error.message}`).join(" · ")}
            </p>
          ) : null}
        </section>
      ) : null}

      {!emptySearch ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">N3 句型 {TARGET_PATTERN_COUNT} 条</h2>
              <p className="text-xs text-muted-foreground">极速版语条 · 点开后先读日文例句</p>
            </div>
            <Badge variant="secondary">{filteredCatalog.length} 条</Badge>
          </div>
          <ul className="grid gap-2">
            {filteredCatalog.map((item) => {
              const done = ids.includes(item.id)
              return (
                <li key={item.id}>
                  <Link href={`/read/${item.id}`} className="block">
                    <Card size="sm" className="py-3 transition-colors hover:ring-primary/30">
                      <CardContent className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#ff6b6b] text-xs font-bold text-primary-foreground">
                          {String(item.index).padStart(3, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">
                              <Highlight text={item.title} query={query} />
                            </p>
                            {done ? (
                              <Badge variant="outline" className="shrink-0">
                                已读
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            <Highlight text={item.usage} query={query} />
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
    </div>
  )
}
