// lib/auth.ts
const SYNTHETIC_DOMAIN = 'students.lms-internal.app'

export function studentCodeToEmail(studentCode: string): string {
  return `${studentCode.trim().toLowerCase()}@${SYNTHETIC_DOMAIN}`
}

export function isValidStudentCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code.trim())
}