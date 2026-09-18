import { BottomNav } from "@/components/bottom-nav"
import { N2Home } from "@/components/n2-home"
import { SiteHeader } from "@/components/site-header"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const raw = params.q
  const initialQuery = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "")

  return (
    <>
      <SiteHeader title="N2 语法朗读" />
      <N2Home initialQuery={initialQuery} />
      <BottomNav />
    </>
  )
}
