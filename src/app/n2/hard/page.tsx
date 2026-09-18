import { BottomNav } from "@/components/bottom-nav"
import { N2HardList } from "@/components/n2-hard-list"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "N2 长难句 · 朗读",
}

export default function HardIndexPage() {
  return (
    <>
      <SiteHeader title="N2 长难句" />
      <N2HardList />
      <BottomNav />
    </>
  )
}
