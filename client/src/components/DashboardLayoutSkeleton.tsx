import { Skeleton } from "./ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton - dark */}
      <div className="w-[260px] bg-[oklch(0.165_0.025_260)] p-3 space-y-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-2 w-16 bg-white/5" />
          </div>
        </div>

        <div className="space-y-1 px-1">
          <Skeleton className="h-9 w-full rounded-lg bg-white/10" />
          <div className="mt-3 space-y-0.5">
            <Skeleton className="h-8 w-full rounded-md bg-white/5" />
            <Skeleton className="h-7 w-[85%] rounded-md bg-white/5 ml-4" />
            <Skeleton className="h-7 w-[85%] rounded-md bg-white/5 ml-4" />
            <Skeleton className="h-7 w-[85%] rounded-md bg-white/5 ml-4" />
          </div>
          <div className="mt-3 space-y-0.5">
            <Skeleton className="h-8 w-full rounded-md bg-white/5" />
            <Skeleton className="h-7 w-[85%] rounded-md bg-white/5 ml-4" />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1">
        {/* Top bar skeleton */}
        <div className="h-14 border-b flex items-center px-4 gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-48 rounded-xl lg:col-span-2" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
