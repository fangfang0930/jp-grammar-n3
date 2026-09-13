import { readdir, stat } from "node:fs/promises"
import { join } from "node:path"
import type { ReadingPassage } from "@/data/catalog"
import { pdfDirExists, resolvePdfDir } from "@/lib/pdf/config"
import { extractPdfFile } from "@/lib/pdf/extract"
import { passagesFromExtract } from "@/lib/pdf/structure"

export type IngestReport = {
  pdfDir: string
  files: string[]
  passages: ReadingPassage[]
  errors: { fileName: string; message: string }[]
}

export async function ingestPdfs(cwd = process.cwd()): Promise<IngestReport> {
  const pdfDir = resolvePdfDir(cwd)
  if (!pdfDirExists(cwd)) {
    return {
      pdfDir,
      files: [],
      passages: [],
      errors: [
        {
          fileName: ".",
          message: `找不到 PDF 目录 ${pdfDir}。请创建 content/pdfs/ 或设置 CONTENT_PDF_DIR。`,
        },
      ],
    }
  }

  const names = (await readdir(pdfDir))
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"))

  const passages: ReadingPassage[] = []
  const errors: IngestReport["errors"] = []

  for (const fileName of names) {
    const filePath = join(pdfDir, fileName)
    const info = await stat(filePath)
    if (!info.isFile()) continue
    // Scanned image PDFs have no usable text layer; skip the heavy parse.
    if (info.size > 1_500_000) {
      passages.push({
        id: `pdf-scanned-${fileName.replace(/\.pdf$/i, "")}`,
        title: fileName.replace(/\.pdf$/i, ""),
        body: "",
        sourceFile: fileName,
        status: "scanned",
        note: "扫描版 PDF，没有可复制的文字层。123 条语条已从该文档表格录入，见下方句型列表。",
      })
      continue
    }
    try {
      const extracted = await extractPdfFile(filePath, fileName)
      passages.push(...passagesFromExtract(fileName, extracted.pages))
    } catch (error) {
      errors.push({
        fileName,
        message: error instanceof Error ? error.message : "无法读取该 PDF",
      })
    }
  }

  return { pdfDir, files: names, passages, errors }
}
