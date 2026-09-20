import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
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
  title: "JLPT-READ · N2 语法朗读",
  description: "TRY N2 语法课次阅读：点日文朗读，手机也能用。",
  applicationName: "N2语法朗读",
  appleWebApp: {
    capable: true,
    title: "N2语法朗读",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#e63946",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSans.variable} ${notoJp.variable} ${notoSc.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  )
}
