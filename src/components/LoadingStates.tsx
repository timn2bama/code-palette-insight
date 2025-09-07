import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const WardrobeItemSkeleton = () => (
  <div className="rounded-lg overflow-hidden border border-border bg-card">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const OutfitCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden border border-border bg-card">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
);

export const NavigationSkeleton = () => (
  <div className="flex items-center space-x-6">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-4 w-16" />
    ))}
  </div>
);

export const GridSkeleton = ({ 
  count = 8, 
  className 
}: { 
  count?: number; 
  className?: string;
}) => (
  <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
    {[...Array(count)].map((_, i) => (
      <WardrobeItemSkeleton key={i} />
    ))}
  </div>
);

export const ListSkeleton = ({ 
  count = 5, 
  className 
}: { 
  count?: number; 
  className?: string;
}) => (
  <div className={cn("space-y-4", className)}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
        <Skeleton className="h-16 w-16 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ 
  rows = 5, 
  cols = 4,
  className 
}: { 
  rows?: number; 
  cols?: number;
  className?: string;
}) => (
  <div className={cn("w-full", className)}>
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {/* Header */}
      {[...Array(cols)].map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-4 w-full" />
      ))}
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        [...Array(cols)].map((_, colIndex) => (
          <Skeleton key={`row-${rowIndex}-col-${colIndex}`} className="h-8 w-full" />
        ))
      ))}
    </div>
  </div>
);