import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple password hashing for demo purposes
// In production, use bcrypt or similar
export function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use proper password hashing
  return btoa(password + 'salt')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
