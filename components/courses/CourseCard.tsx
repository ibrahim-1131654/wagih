'use client'

import { useState } from 'react'
import Link from 'next/link'
import SubscribeModal from './SubscribeModal'

type Course = {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  cover_image_url: string | null
}

type Props = {
  course: Course
  subscriptionStatus?: string
}

export default function CourseCard({ course, subscriptionStatus }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="h-36 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
          {course.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            'بدون صورة غلاف'
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h2 className="font-semibold text-gray-900 mb-1">{course.title}</h2>
          <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">
              {course.price} {course.currency}
            </span>

            {subscriptionStatus === 'active' && (
              <Link
                href={`/quizzes?course=${course.id}`}
                className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
              >
                الاختبارات ←
              </Link>
            )}
            {subscriptionStatus === 'pending' && (
              <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg">
                بانتظار الموافقة
              </span>
            )}
            {!subscriptionStatus && (
              <button
                onClick={() => setShowModal(true)}
                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition"
              >
                اشتراك
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <SubscribeModal course={course} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
