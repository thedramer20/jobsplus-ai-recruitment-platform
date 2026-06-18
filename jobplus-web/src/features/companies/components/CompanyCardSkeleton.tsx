import { Skeleton } from '@/components/ui/Skeleton'

export function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
      <Skeleton className="mb-3 h-12 w-12 rounded-xl" />
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="mt-1.5 h-3 w-1/3" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
