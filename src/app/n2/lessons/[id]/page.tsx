import { BottomNav } from "@/components/bottom-nav"
import { N2LessonReader } from "@/components/n2-lesson-reader"
import { SiteHeader } from "@/components/site-header"
import { getAdjacentLesson, getLesson, N2_LESSONS } from "@/data/n2"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return N2_LESSONS.map((lesson) => ({ id: lesson.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lesson = getLesson(id)
  return {
    title: lesson ? `${lesson.title} · N2 语法朗读` : "课次 · N2 语法朗读",
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lesson = getLesson(id)
  if (!lesson) notFound()
  const { prev, next } = getAdjacentLesson(id)

  return (
    <>
      <SiteHeader title={`第${lesson.index}课`} backHref="/" />
      <N2LessonReader lesson={lesson} prev={prev} next={next} />
      <BottomNav />
    </>
  )
}
