"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  pickChineseVoice,
  pickJapaneseVoice,
  segmentsForSpeech,
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
  const keepAliveRef = useRef<number | null>(null)
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current != null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

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
      clearKeepAlive()
      window.speechSynthesis.cancel()
    }
  }, [clearKeepAlive])

  const stop = useCallback(() => {
    speakingRef.current = false
    setIsSpeaking(false)
    clearKeepAlive()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [clearKeepAlive])

  const speakSegments = useCallback(
    (segments: SpeechSegment[]) => {
      if (!supported) {
        setToast("当前浏览器不支持语音朗读")
        return
      }
      window.speechSynthesis.cancel()
      clearKeepAlive()
      speakingRef.current = true
      setIsSpeaking(true)

      // Chrome can silently pause long Japanese speech; resume without a hard restart.
      keepAliveRef.current = window.setInterval(() => {
        if (!speakingRef.current) return
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }
      }, 5000)

      const speakNext = (index: number) => {
        if (!speakingRef.current || index >= segments.length) {
          speakingRef.current = false
          setIsSpeaking(false)
          clearKeepAlive()
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
        utter.pitch = cfg.pitch
        const voice = segment.lang === "ja" ? jaVoice.current : zhVoice.current
        if (voice) {
          utter.voice = voice
          utter.lang = voice.lang || cfg.langCode
        }
        utter.onend = () => speakNext(index + 1)
        utter.onerror = () => speakNext(index + 1)
        window.speechSynthesis.speak(utter)
      }
      speakNext(0)
    },
    [clearKeepAlive, supported],
  )

  const speakAuto = useCallback(
    (text: string) => speakSegments(segmentsForSpeech(text)),
    [speakSegments],
  )

  const speakLang = useCallback(
    (text: string, lang?: SpeechLang) => {
      speakSegments(segmentsForSpeech(text, lang))
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
