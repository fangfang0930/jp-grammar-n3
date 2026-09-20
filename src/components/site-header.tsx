import Link from "next/link"
import { BookOpenText } from "lucide-react"

export function SiteHeader({
  title,
  backHref,
}: {
  title: string
  backHref?: string
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-br from-primary to-[#ff6b6b] text-primary-foreground">
      <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center gap-2 px-3 py-2">
        {backHref ? (
          <Link
            href={backHref}
            className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm hover:bg-white/30"
          >
            ← 返回
          </Link>
        ) : (
          <BookOpenText className="size-5 shrink-0 opacity-90" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-center text-base font-semibold tracking-wide sm:text-lg">
          {title}
        </h1>
        <span className="w-14 shrink-0" aria-hidden />
      </div>
    </header>
  )
}
