import { HomeExplorer } from "@/components/home-explorer"
import { SiteHeader } from "@/components/site-header"
import { CATALOG_ITEMS } from "@/data/catalog"
import { ingestPdfs } from "@/lib/pdf/ingest"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const raw = params.q
  const initialQuery = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "")
  const report = await ingestPdfs()

  return (
    <>
      <SiteHeader title="N3 句型阅读" />
      <HomeExplorer
        catalog={CATALOG_ITEMS}
        passages={report.passages}
        pdfDir={report.pdfDir}
        pdfFiles={report.files}
        ingestErrors={report.errors}
        initialQuery={initialQuery}
      />
    </>
  )
}
