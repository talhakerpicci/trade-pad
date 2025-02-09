import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
    return (
        <div className="container mx-auto space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[120px]" />
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {Array(2).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[300px]" />
                ))}
            </div>

            <Skeleton className="h-[400px]" />
        </div>
    );
} 