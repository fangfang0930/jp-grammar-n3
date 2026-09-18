import tryJson from "../../content/generated/n2-try.json"
import passageJson from "../../content/generated/n2-passages.json"

export type N2Example = {
  jp: string
  cn: string
}

export type N2Point = {
  id: string
  title: string
  meaning: string
  connection: string
  examples: N2Example[]
}

export type N2Lesson = {
  id: string
  index: number
  title: string
  titleJa: string
  canDo: string
  points: N2Point[]
}

export type N2HardPassage = {
  id: string
  index: number
  jp: string
  cn: string
}

type TryFile = {
  title: string
  source: string
  note: string
  lessons: N2Lesson[]
}

type PassageFile = {
  title: string
  source: string
  items: N2HardPassage[]
}

const book = tryJson as TryFile
const hard = passageJson as PassageFile

export const N2_BOOK_TITLE = book.title
export const N2_BOOK_SOURCE = book.source
export const N2_BOOK_NOTE = book.note
export const N2_LESSONS: N2Lesson[] = book.lessons
export const N2_POINTS: N2Point[] = N2_LESSONS.flatMap((lesson) => lesson.points)
export const N2_HARD_PASSAGES: N2HardPassage[] = hard.items
export const N2_HARD_TITLE = hard.title

export function getLesson(id: string): N2Lesson | undefined {
  return N2_LESSONS.find((lesson) => lesson.id === id)
}

export function getAdjacentLesson(id: string): { prev?: N2Lesson; next?: N2Lesson } {
  const index = N2_LESSONS.findIndex((lesson) => lesson.id === id)
  if (index < 0) return {}
  return { prev: N2_LESSONS[index - 1], next: N2_LESSONS[index + 1] }
}

export function getPoint(id: string): { point: N2Point; lesson: N2Lesson } | undefined {
  for (const lesson of N2_LESSONS) {
    const point = lesson.points.find((item) => item.id === id)
    if (point) return { point, lesson }
  }
  return undefined
}

export function getAdjacentPoint(id: string): { prev?: N2Point; next?: N2Point } {
  const index = N2_POINTS.findIndex((item) => item.id === id)
  if (index < 0) return {}
  return { prev: N2_POINTS[index - 1], next: N2_POINTS[index + 1] }
}

export function getHardPassage(id: string): N2HardPassage | undefined {
  return N2_HARD_PASSAGES.find((item) => item.id === id)
}

export function getAdjacentHard(id: string): {
  prev?: N2HardPassage
  next?: N2HardPassage
} {
  const index = N2_HARD_PASSAGES.findIndex((item) => item.id === id)
  if (index < 0) return {}
  return { prev: N2_HARD_PASSAGES[index - 1], next: N2_HARD_PASSAGES[index + 1] }
}

export function searchN2(query: string): {
  lessons: N2Lesson[]
  points: { point: N2Point; lesson: N2Lesson }[]
  passages: N2HardPassage[]
} {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    return {
      lessons: N2_LESSONS,
      points: N2_POINTS.map((point) => {
        const found = getPoint(point.id)
        return found!
      }),
      passages: N2_HARD_PASSAGES,
    }
  }

  const lessons = N2_LESSONS.filter((lesson) => {
    const hay = [lesson.title, lesson.titleJa, lesson.canDo].join(" ").toLowerCase()
    return hay.includes(keyword)
  })

  const points = N2_LESSONS.flatMap((lesson) =>
    lesson.points
      .filter((point) => {
        const hay = [
          point.title,
          point.meaning,
          point.connection,
          ...point.examples.flatMap((ex) => [ex.jp, ex.cn]),
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(keyword)
      })
      .map((point) => ({ point, lesson })),
  )

  const passages = N2_HARD_PASSAGES.filter((item) =>
    [item.jp, item.cn].join(" ").toLowerCase().includes(keyword),
  )

  return { lessons, points, passages }
}
