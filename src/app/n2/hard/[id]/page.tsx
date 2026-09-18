import { BottomNav } from "@/components/bottom-nav"
import { N2HardReader } from "@/components/n2-hard-reader"
import { SiteHeader } from "@/components/site-header"
import { getAdjacentHard, getHardPassage, N2_HARD_PASSAGES } from "@/data/n2"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return N2_HARD_PASSAGES.map((item) => ({ id: item.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getHardPassage(id)
  return {
    title: item ? `长难句 ${item.index} · N2 朗读` : "长难句 · N2 朗读",
  }
}

export default async function HardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getHardPassage(id)
  if (!item) notFound()
  const { prev, next } = getAdjacentHard(id)

  return (
    <>
      <SiteHeader title={`长难句 ${item.index}`} backHref="/n2/hard" />
      <N2HardReader item={item} prev={prev} next={next} />
      <BottomNav />
    </>
  )
}
