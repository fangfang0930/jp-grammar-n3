import { notFound } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { PassageReader } from "@/components/passage-reader"
import { SiteHeader } from "@/components/site-header"
import { ingestPdfs } from "@/lib/pdf/ingest"

export const dynamic = "force-dynamic"

export default async function PassagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await ingestPdfs()
  const ready = report.passages.filter((passage) => passage.status === "ready")
  const index = ready.findIndex((passage) => passage.id === id)
  const passage = ready[index]
  if (!passage) notFound()

  return (
    <>
      <SiteHeader title="阅读篇章" backHref="/n3" />
      <PassageReader
        passage={passage}
        prev={ready[index - 1]}
        next={ready[index + 1]}
      />
      <BottomNav />
    </>
  )
}
