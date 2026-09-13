import type { Metadata } from "next"
import { Noto_Sans, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google"
import "./globals.css"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
})

const notoSc = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-sc",
})

export const metadata: Metadata = {
  title: "JLPT-READ · N3 句型阅读",
  description: "用 N3 句型语法 123 条做日语阅读练习：短篇、例句、朗读。",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSans.variable} ${notoJp.variable} ${notoSc.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
        <footer className="fixed inset-x-0 bottom-0 border-t bg-card/95 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">
          JLPT-READ · 内容来自《N3句型语法123条（极速版语条）》
        </footer>
      </body>
    </html>
  )
}
