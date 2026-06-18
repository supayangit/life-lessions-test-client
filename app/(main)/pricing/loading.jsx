import { Skeleton } from '@/components/ui/skeleton'

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
        <Skeleton className="h-6 w-32 mx-auto rounded-full" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
