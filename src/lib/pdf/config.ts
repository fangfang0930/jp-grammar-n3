import { existsSync } from "node:fs"
import { resolve } from "node:path"

const DEFAULT_DIR = "content/pdfs"

export function resolvePdfDir(cwd = process.cwd()): string {
  const fromEnv = process.env.CONTENT_PDF_DIR?.trim()
  if (fromEnv) return resolve(cwd, fromEnv)
  return resolve(cwd, DEFAULT_DIR)
}

export function pdfDirExists(cwd = process.cwd()): boolean {
  return existsSync(resolvePdfDir(cwd))
}

export const WATERMARK_HINTS = [
  "欢迎关注公众号",
  "圆圆的日语教室",
  "跟着圆圆学日语",
]
