import { Clock } from 'lucide-react'

const WORDS_PER_MINUTE = 200

/**
 * Calculates and displays estimated reading time for given text content.
 * Strips HTML tags before counting words.
 */
export function ReadingTime({ content = '', className = '' }) {
  const plainText = content.replace(/<[^>]*>/g, ' ')
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}
      aria-label={`Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      {minutes} min read
    </span>
  )
}
