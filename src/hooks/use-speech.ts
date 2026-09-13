"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  detectLang,
  pickChineseVoice,
  pickJapaneseVoice,
  splitByLang,
  voiceConfig,
  type SpeechLang,
  type SpeechSegment,
} from "@/lib/speech"

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const jaVoice = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const zhVoice = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const speakingRef = useRef(false)
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      jaVoice.current = pickJapaneseVoice(voices)
      zhVoice.current = pickChineseVoice(voices)
    }
    pick()
    window.speechSynthesis.addEventListener("voiceschanged", pick)
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pick)
      window.speechSynthesis.cancel()
    }
  }, [])

  const stop = useCallback(() => {
    speakingRef.current = false
    setIsSpeaking(false)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakSegments = useCallback(
    (segments: SpeechSegment[]) => {
      if (!supported) {
        setToast("当前浏览器不支持语音朗读")
        return
      }
      window.speechSynthesis.cancel()
      speakingRef.current = true
      setIsSpeaking(true)

      const speakNext = (index: number) => {
        if (!speakingRef.current || index >= segments.length) {
          speakingRef.current = false
          setIsSpeaking(false)
          return
        }
        const segment = segments[index]
        if (!segment.text.trim()) {
          speakNext(index + 1)
          return
        }
        const cfg = voiceConfig(segment.lang)
        const utter = new SpeechSynthesisUtterance(segment.text)
        utter.lang = cfg.langCode
        utter.rate = cfg.rate
        const voice = segment.lang === "ja" ? jaVoice.current : zhVoice.current
        if (voice) utter.voice = voice
        utter.onend = () => speakNext(index + 1)
        utter.onerror = () => speakNext(index + 1)
        window.speechSynthesis.speak(utter)
      }
      speakNext(0)
    },
    [supported],
  )

  const speakAuto = useCallback(
    (text: string) => speakSegments(splitByLang(text)),
    [speakSegments],
  )

  const speakLang = useCallback(
    (text: string, lang?: SpeechLang) => {
      speakSegments([{ lang: lang ?? detectLang(text), text }])
    },
    [speakSegments],
  )

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) stop()
    }
    document.addEventListener("visibilitychange", onHide)
    return () => document.removeEventListener("visibilitychange", onHide)
  }, [stop])

  return { isSpeaking, supported, toast, speakAuto, speakLang, stop }
}
