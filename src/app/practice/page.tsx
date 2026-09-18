import { BottomNav } from "@/components/bottom-nav"
import { ExamplePractice } from "@/components/example-practice"
import { SiteHeader } from "@/components/site-header"
import { CATALOG_ALL } from "@/data/catalog"

export const metadata = {
  title: "例句练习 · JLPT-READ",
}

export default function PracticePage() {
  return (
    <>
      <SiteHeader title="例句练习" backHref="/n3" />
      <ExamplePractice items={CATALOG_ALL} />
      <BottomNav />
    </>
  )
}
