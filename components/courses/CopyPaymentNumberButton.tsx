'use client'

import { useState } from 'react'

export default function CopyPaymentNumberButton({ number }: { number: string }) {
  const [copied, setCopied] = useState(false)

  async function copyNumber() {
    await navigator.clipboard.writeText(number)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={() => void copyNumber()} className="mt-2 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
      {copied ? 'تم نسخ الرقم ✓' : 'نسخ رقم InstaPay'}
    </button>
  )
}
