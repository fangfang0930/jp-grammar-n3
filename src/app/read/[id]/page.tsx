import { notFound } from "next/navigation"
import { PatternReader } from "@/components/pattern-reader"
import { SiteHeader } from "@/components/site-header"
import { CATALOG_ITEMS, getAdjacentCatalog, getCatalogItem } from "@/data/catalog"

export function generateStaticParams() {
  return CATALOG_ITEMS.map((item) => ({ id: item.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getCatalogItem(id)
  return {
    title: item ? `${item.title} · JLPT-READ` : "语法详情 · JLPT-READ",
  }
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getCatalogItem(id)
  if (!item) notFound()
  const { prev, next } = getAdjacentCatalog(id)

  return (
    <>
      <SiteHeader title="语法详情" backHref="/" />
      <PatternReader item={item} prev={prev} next={next} />
    </>
  )
}
