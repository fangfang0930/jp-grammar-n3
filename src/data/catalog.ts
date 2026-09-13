import catalogJson from "../../content/generated/n3-123.json"

export type CatalogKind = "pattern" | "variant"

export type CatalogItem = {
  id: string
  index: number
  title: string
  usage: string
  jp: string
  cn: string
  sourceFile: string
  sourcePage: number
  kind: CatalogKind
}

export type ReadingPassage = {
  id: string
  title: string
  body: string
  sourceFile: string
  sourcePage?: number
  status: "ready" | "empty" | "scanned"
  note?: string
}

type CatalogFile = {
  title: string
  source: string
  items: CatalogItem[]
}

const file = catalogJson as CatalogFile

export const CATALOG_TITLE = file.title
export const CATALOG_ALL: CatalogItem[] = file.items
export const CATALOG_ITEMS: CatalogItem[] = file.items.filter((item) => item.kind === "pattern")
export const TARGET_PATTERN_COUNT = 123

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG_ALL.find((item) => item.id === id)
}

export function getAdjacentCatalog(id: string): {
  prev?: CatalogItem
  next?: CatalogItem
} {
  const index = CATALOG_ITEMS.findIndex((item) => item.id === id)
  if (index < 0) return {}
  return {
    prev: CATALOG_ITEMS[index - 1],
    next: CATALOG_ITEMS[index + 1],
  }
}

export function searchCatalog(
  query: string,
  items: CatalogItem[] = CATALOG_ITEMS,
): CatalogItem[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return items
  return items.filter((item) => {
    const hay = [item.title, item.usage, item.jp, item.cn].join(" ").toLowerCase()
    return hay.includes(keyword)
  })
}

export function searchPassages(
  passages: ReadingPassage[],
  query: string,
): ReadingPassage[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return passages
  return passages.filter((passage) => {
    const hay = [passage.title, passage.body, passage.sourceFile]
      .join(" ")
      .toLowerCase()
    return hay.includes(keyword)
  })
}
