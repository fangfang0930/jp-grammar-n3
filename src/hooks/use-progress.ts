"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { readReviewedIds, toggleReviewedId, writeReviewedIds } from "@/lib/progress"

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

function getSnapshot() {
  return JSON.stringify(readReviewedIds())
}

function getServerSnapshot() {
  return "[]"
}

export function useProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ids = useMemo(() => JSON.parse(raw) as string[], [raw])

  const persist = useCallback((next: string[]) => {
    writeReviewedIds(next)
    emit()
  }, [])

  const toggle = useCallback(
    (id: string) => persist(toggleReviewedId(ids, id)),
    [ids, persist],
  )

  const mark = useCallback(
    (id: string) => {
      if (ids.includes(id)) return
      persist([...ids, id])
    },
    [ids, persist],
  )

  return { ids, ready: true, toggle, mark, has: (id: string) => ids.includes(id) }
}
