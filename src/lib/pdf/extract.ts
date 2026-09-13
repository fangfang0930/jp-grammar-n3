import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { extractText, getDocumentProxy } from "unpdf"

export type ExtractedPdf = {
  fileName: string
  pages: string[]
  totalPages: number
  method: "text-layer"
}

class FsBinaryDataFactory {
  cMapUrl: string
  standardFontDataUrl: string
  wasmUrl: string

  constructor(urls: {
    cMapUrl: string
    standardFontDataUrl: string
    wasmUrl?: string
  }) {
    this.cMapUrl = urls.cMapUrl
    this.standardFontDataUrl = urls.standardFontDataUrl
    this.wasmUrl = urls.wasmUrl ?? ""
  }

  async fetch({ kind, filename }: { kind: string; filename: string }) {
    const base = this[kind as "cMapUrl" | "standardFontDataUrl" | "wasmUrl"]
    if (!base) {
      throw new Error(`Missing ${kind} for PDF font maps`)
    }
    const url = `${base}${filename}`
    const filePath = url.startsWith("file:") ? fileURLToPath(url) : url
    return new Uint8Array(await readFile(filePath))
  }
}

function pdfJsAssetUrls() {
  const require = createRequire(import.meta.url)
  const root = dirname(require.resolve("pdfjs-dist/package.json"))
  return {
    cMapUrl: `${pathToFileURL(join(root, "cmaps")).href}/`,
    standardFontDataUrl: `${pathToFileURL(join(root, "standard_fonts")).href}/`,
    wasmUrl: `${pathToFileURL(join(root, "wasm")).href}/`,
  }
}

export async function extractPdfFile(
  filePath: string,
  fileName: string,
): Promise<ExtractedPdf> {
  const bytes = new Uint8Array(await readFile(filePath))
  const urls = pdfJsAssetUrls()
  const pdf = await getDocumentProxy(bytes, {
    disableFontFace: true,
    useSystemFonts: true,
    cMapPacked: true,
    ...urls,
    BinaryDataFactory: FsBinaryDataFactory,
  })

  try {
    const { text, totalPages } = await extractText(pdf, { mergePages: false })
    const pages = (Array.isArray(text) ? text : [text]).map((page) =>
      (page ?? "").replace(/\u0000/g, "").trim(),
    )
    return { fileName, pages, totalPages, method: "text-layer" }
  } finally {
    await pdf.loadingTask.destroy().catch(() => undefined)
  }
}
