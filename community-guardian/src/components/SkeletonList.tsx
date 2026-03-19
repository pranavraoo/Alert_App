export default function SkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3" aria-label="Loading alerts" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200
                     dark:border-slate-700 p-4 space-y-3"
                >
                    {/* Title row */}
                    <div className="flex items-center gap-3">
                        {/* DNA thumbnail placeholder */}
                        <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
                        <div className="skeleton h-4 flex-1 max-w-xs" />
                        <div className="skeleton h-5 w-16 rounded-full ml-auto" />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <div className="skeleton h-3 w-full" />
                        <div className="skeleton h-3 w-3/4" />
                    </div>
                    {/* Badge row */}
                    <div className="flex gap-2">
                        <div className="skeleton h-5 w-16 rounded-full" />
                        <div className="skeleton h-5 w-14 rounded-full" />
                        <div className="skeleton h-5 w-12 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}