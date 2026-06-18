import { Skeleton } from '@/components/ui/Skeleton'

export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-7 w-7 flex-shrink-0 rounded-lg" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
