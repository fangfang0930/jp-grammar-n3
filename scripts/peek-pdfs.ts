import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { extractPdfFile } from "../src/lib/pdf/extract.ts"

const dir = join(process.cwd(), "content", "pdfs")
const files = await readdir(dir)
const targets = files.filter(
  (name) =>
    name.toLowerCase().endsWith(".pdf") &&
    (name.includes("高频") || name.includes("sample") || name.startsWith("n2-")),
)

for (const name of targets) {
  console.log("FILE", name)
  try {
    const result = await extractPdfFile(join(dir, name), name)
    console.log("pages", result.totalPages)
    result.pages.forEach((page, index) => {
      const text = page.trim()
      if (!text) return
      console.log(`--- page ${index + 1} len=${text.length} ---`)
      console.log(text.slice(0, 1500))
      console.log("")
    })
  } catch (error) {
    console.error("FAIL", name, error)
  }
}
