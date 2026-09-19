import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <SiteHeader title="未找到" backHref="/" />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-lg font-semibold">没有这条语法或篇章</p>
        <p className="text-sm text-muted-foreground">可能是编号写错了，回到目录重新选一条。</p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          返回目录
        </Link>
      </div>
      <BottomNav />
    </>
  )
}
