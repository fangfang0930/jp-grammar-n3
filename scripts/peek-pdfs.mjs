import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { extractPdfFile } from "../src/lib/pdf/extract.ts"

const dir = join(process.cwd(), "content", "pdfs")
const files = (await readdir(dir)).filter((n) => n.toLowerCase().endsWith(".pdf"))
for (const name of files) {
  if (name.includes("n3-123") || name.includes("长难句")) continue
  try {
    const result = await extractPdfFile(join(dir, name), name)
    const nonempty = result.pages.filter((p) => p.trim().length > 20)
    console.log("===", name, "pages", result.totalPages, "usable", nonempty.length)
    for (const [i, page] of result.pages.entries()) {
      if (!page.trim()) continue
      console.log(`--- page ${i + 1} ---`)
      console.log(page.slice(0, 1200))
      console.log("")
    }
  } catch (error) {
    console.log("FAIL", name, error instanceof Error ? error.message : error)
  }
}
