export type SpeechLang = "ja" | "zh" | "en"

export type SpeechSegment = {
  lang: SpeechLang
  text: string
}

const JA_RANGES = [
  [0x3040, 0x309f],
  [0x30a0, 0x30ff],
  [0x31f0, 0x31ff],
  [0xff66, 0xff9f],
  [0x3000, 0x303f],
] as const

function isJaCode(code: number) {
  return JA_RANGES.some(([start, end]) => code >= start && code <= end)
}

function isZhCode(code: number) {
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)
}

export function detectLang(text: string): SpeechLang {
  if (!text) return "zh"
  let zhCount = 0
  let jaCount = 0
  const cleaned = text.replace(/\s+/g, "")
  if (!cleaned) return "zh"
  for (const ch of cleaned) {
    const code = ch.codePointAt(0)
    if (!code) continue
    if (isZhCode(code)) zhCount += 1
    if (isJaCode(code)) jaCount += 1
  }
  if (jaCount === 0 && zhCount === 0) {
    return /[A-Za-z]/.test(cleaned) ? "en" : "zh"
  }
  // Kana is decisive: shared kanji should stay Japanese when any kana is present.
  if (jaCount > 0) return "ja"
  return "zh"
}

export function splitByLang(text: string): SpeechSegment[] {
  if (!text) return []
  const tokens: SpeechSegment[] = []
  let buffer = ""
  let currentLang: SpeechLang | null = null

  for (const ch of text) {
    const code = ch.codePointAt(0)
    let lang: "ja" | "zh" | "punct" | "neutral" = "neutral"
    if (code != null) {
      const ja = isJaCode(code)
      const zh = isZhCode(code)
      const punct =
        code < 0x3000 ||
        (code >= 0xff00 && code <= 0xffef && !ja) ||
        /[・「」『』（）、。！？：；…—]/.test(ch)
      if (ja) lang = "ja"
      else if (zh) lang = "zh"
      else if (punct) lang = "punct"
    }

    if (currentLang === null) {
      currentLang = lang === "punct" || lang === "neutral" ? "zh" : lang
    }

    if (lang === "punct" || lang === "neutral" || lang === currentLang) {
      buffer += ch
    } else {
      if (buffer.trim()) tokens.push({ lang: currentLang, text: buffer })
      buffer = ch
      currentLang = lang
    }
  }

  if (buffer.trim()) tokens.push({ lang: currentLang || "zh", text: buffer })
  return mergeShortTokens(tokens)
}

function mergeShortTokens(tokens: SpeechSegment[]): SpeechSegment[] {
  if (tokens.length <= 1) return tokens
  const merged: SpeechSegment[] = []
  for (const token of tokens) {
    const last = merged[merged.length - 1]
    if (last && token.text.replace(/\s/g, "").length <= 2 && token.text.trim()) {
      last.text += token.text
    } else if (last && last.lang === token.lang) {
      last.text += token.text
    } else {
      merged.push({ ...token })
    }
  }
  return merged.filter((token) => token.text.trim())
}

/** Soften characters that browser TTS often misreads or pauses awkwardly on. */
export function prepareJapaneseText(text: string): string {
  return text
    .replace(/\u3000/g, " ")
    .replace(/[～〜]/g, "ー")
    .replace(/…+/g, "。")
    .replace(/・/g, "、")
    .replace(/[「」『』【】〔〕]/g, " ")
    .replace(/[（(]/g, "、")
    .replace(/[）)]/g, "。")
    .replace(/[/／]/g, "、")
    .replace(/\s*\n+\s*/g, "。")
    .replace(/\s{2,}/g, " ")
    .replace(/([。！？])\1+/g, "$1")
    .replace(/\s+([。、！？])/g, "$1")
    .trim()
}

/**
 * Split long Japanese into sentence-sized chunks so Chrome does not cut off
 * mid-utterance, while keeping chunks large enough to sound continuous.
 */
export function chunkJapaneseSpeech(text: string, maxLen = 90): string[] {
  const prepared = prepareJapaneseText(text)
  if (!prepared) return []

  const sentences = prepared
    .split(/(?<=[。！？!?])/)
    .map((part) => part.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let buffer = ""

  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim())
    buffer = ""
  }

  for (const sentence of sentences.length ? sentences : [prepared]) {
    if (!buffer) {
      buffer = sentence
    } else if (buffer.length + sentence.length <= maxLen) {
      buffer += sentence
    } else {
      flush()
      buffer = sentence
    }

    if (buffer.length >= maxLen) flush()
  }
  flush()

  return chunks.length ? chunks : [prepared]
}

function scoreJapaneseVoice(voice: SpeechSynthesisVoice): number {
  const label = `${voice.name} ${voice.lang}`
  let score = 0
  if (/ja(-JP)?/i.test(voice.lang)) score += 20
  if (/natural|neural|online|enhanced|premium|google/i.test(label)) score += 40
  if (/Nanami|Kyoko|Otoya|Haruka|Ichiro|Sayaka|Google 日本語|Microsoft Nanami/i.test(label)) {
    score += 30
  }
  if (/local/i.test(label) && !/natural|neural|online/i.test(label)) score -= 5
  if (voice.localService === false) score += 8
  return score
}

export function pickJapaneseVoice(voices: SpeechSynthesisVoice[]) {
  const ja = voices.filter(
    (voice) => /ja|JP|日本語/i.test(voice.lang) || /japan/i.test(voice.name),
  )
  if (ja.length === 0) return undefined
  return [...ja].sort((a, b) => scoreJapaneseVoice(b) - scoreJapaneseVoice(a))[0]
}

export function pickChineseVoice(voices: SpeechSynthesisVoice[]) {
  const zh = voices.filter((voice) =>
    /zh|CN|TW|HK|Chinese|普通话|中文|国语|Tingting|Sinji|Meijia/i.test(
      `${voice.lang}${voice.name}`,
    ),
  )
  return (
    zh.find((voice) => /Tingting|Sinji|Meijia|Xiaoxiao|Yaoyao|Natural|Neural/i.test(voice.name)) ??
    zh[0]
  )
}

export function voiceConfig(lang: SpeechLang) {
  // Slightly under 1.0 keeps Japanese mora timing clearer without sounding slow.
  if (lang === "ja") return { langCode: "ja-JP", rate: 0.92, pitch: 1.02 }
  if (lang === "en") return { langCode: "en-US", rate: 1, pitch: 1 }
  return { langCode: "zh-CN", rate: 1, pitch: 1 }
}

export function segmentsForSpeech(
  text: string,
  lang?: SpeechLang,
): SpeechSegment[] {
  const resolved = lang ?? detectLang(text)
  if (resolved === "ja") {
    return chunkJapaneseSpeech(text).map((chunk) => ({ lang: "ja" as const, text: chunk }))
  }
  if (lang) {
    return [{ lang: resolved, text }]
  }
  return splitByLang(text).flatMap((segment) => {
    if (segment.lang !== "ja") return [segment]
    return chunkJapaneseSpeech(segment.text).map((chunk) => ({
      lang: "ja" as const,
      text: chunk,
    }))
  })
}
