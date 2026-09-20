"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

export type FontScale = "md" | "lg" | "xl"

const FONT_KEY = "jlpt-read:font-scale"
const HIDE_CN_KEY = "jlpt-read:hide-cn"
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener)
    }
  }
}

function readPrefs() {
  if (typeof window === "undefined") {
    return { fontScale: "lg" as FontScale, hideCn: false }
  }
  try {
    const font = window.localStorage.getItem(FONT_KEY)
    const fontScale: FontScale = font === "md" || font === "lg" || font === "xl" ? font : "lg"
    const hideCn = window.localStorage.getItem(HIDE_CN_KEY) === "1"
    return { fontScale, hideCn }
  } catch {
    return { fontScale: "lg" as FontScale, hideCn: false }
  }
}

function getSnapshot() {
  return JSON.stringify(readPrefs())
}

function getServerSnapshot() {
  return JSON.stringify({ fontScale: "lg", hideCn: false })
}

export function useReaderPrefs() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const prefs = useMemo(() => JSON.parse(raw) as { fontScale: FontScale; hideCn: boolean }, [raw])

  const setFontScale = useCallback((value: FontScale) => {
    window.localStorage.setItem(FONT_KEY, value)
    emit()
  }, [])

  const setHideCn = useCallback((value: boolean) => {
    window.localStorage.setItem(HIDE_CN_KEY, value ? "1" : "0")
    emit()
  }, [])

  const cycleFont = useCallback(() => {
    const order: FontScale[] = ["md", "lg", "xl"]
    const next = order[(order.indexOf(prefs.fontScale) + 1) % order.length]
    setFontScale(next)
  }, [prefs.fontScale, setFontScale])

  return { ...prefs, ready: true, setFontScale, setHideCn, cycleFont }
}

export function fontClass(scale: FontScale) {
  if (scale === "md") return "text-base leading-8"
  if (scale === "xl") return "text-2xl leading-10"
  return "text-xl leading-9"
}
