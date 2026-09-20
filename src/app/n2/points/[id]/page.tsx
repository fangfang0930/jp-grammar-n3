import { BottomNav } from "@/components/bottom-nav"
import { N2PointReader } from "@/components/n2-point-reader"
import { SiteHeader } from "@/components/site-header"
import { getAdjacentPoint, getPoint, N2_POINTS } from "@/data/n2"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return N2_POINTS.map((point) => ({ id: point.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const found = getPoint(id)
  return {
    title: found ? `${found.point.title} · N2 语法朗读` : "句型 · N2 语法朗读",
  }
}

export default async function PointPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const found = getPoint(id)
  if (!found) notFound()
  const { prev, next } = getAdjacentPoint(id)

  return (
    <>
      <SiteHeader title="句型" backHref={`/n2/lessons/${found.lesson.id}`} />
      <N2PointReader point={found.point} lesson={found.lesson} prev={prev} next={next} />
      <BottomNav />
    </>
  )
}
