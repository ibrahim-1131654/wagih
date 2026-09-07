import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import type { Course } from "@/lib/courses"

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-950/50">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={`صورة كورس ${course.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-md">
          {course.price}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-balance text-xl font-bold text-gray-50">{course.title}</h3>
          <p className="text-pretty leading-relaxed text-gray-400">{course.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-700 bg-gray-950 px-3 py-1 text-sm text-indigo-400">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>{course.instructor}</span>
          </div>

          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <span>استكشف الكورس</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
