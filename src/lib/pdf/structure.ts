import type { ReadingPassage } from "@/data/catalog"
import { WATERMARK_HINTS } from "@/lib/pdf/config"

function isNoise(text: string) {
  const compact = text.replace(/\s+/g, "")
  if (compact.length < 24) return true
  return WATERMARK_HINTS.some((hint) => compact.includes(hint) && compact.length < 80)
}

function firstLineTitle(body: string, fallback: string) {
  const line = body.split(/\n+/).map((part) => part.trim()).find(Boolean)
  if (!line) return fallback
  return line.length > 24 ? `${line.slice(0, 24)}…` : line
}

function slugPart(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9\u3040-\u30ff\u4e00-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

export function passagesFromExtract(fileName: string, pages: string[]): ReadingPassage[] {
  const usable = pages
    .map((text, index) => ({ text: text.trim(), page: index + 1 }))
    .filter((entry) => !isNoise(entry.text))

  if (usable.length === 0) {
    const joined = pages.join("").trim()
    return [
      {
        id: `pdf-${slugPart(fileName)}-empty`,
        title: fileName.replace(/\.pdf$/i, ""),
        body: joined,
        sourceFile: fileName,
        status: joined ? "scanned" : "empty",
        note: joined
          ? "这份 PDF 几乎没有可复制的文字层（多半是扫描件）。已保留文件名；请放入带文字层的 PDF，或把提取结果放到 content/generated/。"
          : "没有提取到文字。把带 UTF-8 文字层的 PDF 放进 content/pdfs/ 后刷新即可。",
      },
    ]
  }

  return usable.map((entry) => ({
    id: `pdf-${slugPart(fileName)}-p${entry.page}`,
    title: firstLineTitle(entry.text, `${fileName} p.${entry.page}`),
    body: entry.text,
    sourceFile: fileName,
    sourcePage: entry.page,
    status: "ready" as const,
  }))
}
