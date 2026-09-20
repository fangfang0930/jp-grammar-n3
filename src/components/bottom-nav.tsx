"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, FileText, Library } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/", label: "N2语法", icon: BookOpenText, match: (path: string) => path === "/" || path.startsWith("/n2/lessons") || path.startsWith("/n2/points") },
  { href: "/n2/hard", label: "长难句", icon: FileText, match: (path: string) => path.startsWith("/n2/hard") },
  { href: "/n3", label: "N3句型", icon: Library, match: (path: string) => path.startsWith("/n3") || path.startsWith("/read") || path.startsWith("/practice") || path.startsWith("/passages") },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-3xl grid-cols-3">
        {ITEMS.map((item) => {
          const active = item.match(pathname)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs",
                  active ? "text-primary font-semibold" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
