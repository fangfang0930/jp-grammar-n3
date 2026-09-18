/** Split Japanese or mixed text into speakable sentence units. */
export function splitSentences(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim()
  if (!normalized) return []

  const parts = normalized
    .split(/(?<=[。！？!?])\s*/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length > 1) return parts

  const byLine = normalized
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return byLine.length ? byLine : [normalized]
}

export function joinSentences(sentences: string[]): string {
  return sentences.join("")
}
