import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E1] overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-xl border-2 border-white" />
            ))}
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>
      <div className="border-t border-[#F3EFE9] px-5 py-3">
        <Skeleton className="h-3 w-24 ml-auto" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderSkeleton key={i} />
      ))}
    </div>
  );
}
