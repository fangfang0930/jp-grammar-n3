const STORAGE_KEY = "jlpt-read:reviewed"

export function readReviewedIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
  } catch {
    return []
  }
}

export function writeReviewedIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]))
}

export function toggleReviewedId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}
