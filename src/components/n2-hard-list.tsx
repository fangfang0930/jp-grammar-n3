"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { N2_HARD_PASSAGES, N2_HARD_TITLE } from "@/data/n2"

export function N2HardList() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 pb-28">
      <p className="text-sm leading-6 text-muted-foreground">
        {N2_HARD_TITLE} · 点进去后点日文句子即可朗读，适合手机一屏阅读。
      </p>
      <ul className="grid gap-2">
        {N2_HARD_PASSAGES.map((item) => (
          <li key={item.id}>
            <Link href={`/n2/hard/${item.id}`} className="block">
              <Card size="sm" className="py-3 transition-colors hover:ring-primary/30">
                <CardContent className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                    {String(item.index).padStart(2, "0")}
                  </span>
                  <p className="line-clamp-3 text-sm leading-6">{item.jp}</p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
