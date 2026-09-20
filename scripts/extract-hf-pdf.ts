import { readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { extractPdfFile } from "../src/lib/pdf/extract.ts"

async function main() {
  const dir = join(process.cwd(), "content", "pdfs")
  const files = await readdir(dir)
  const target =
    files.find((n) => n.includes("高频") && n.endsWith(".pdf")) ||
    files.find((n) => n.includes("sample") && n.endsWith(".pdf"))

  if (!target) {
    console.error("no target pdf", files)
    process.exit(1)
  }

  console.log("extracting", target)
  const result = await extractPdfFile(join(dir, target), target)
  const out = join(process.cwd(), "content", "generated", "n2-hf-raw.txt")
  await writeFile(
    out,
    result.pages.map((p, i) => `===== PAGE ${i + 1} =====\n${p}`).join("\n\n"),
    "utf8",
  )
  console.log("wrote", out, "pages", result.totalPages, "chars", result.pages.join("").length)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
