import Link from 'next/link'
import { BookOpen, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] sm:text-[160px] font-serif font-bold leading-none text-primary/10 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-5">
              <BookOpen className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
          This page does not exist
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
          The lesson or page you are looking for may have been moved, deleted, or never existed. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/public-lessons">
              <ArrowLeft className="h-4 w-4" />
              Browse Lessons
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
