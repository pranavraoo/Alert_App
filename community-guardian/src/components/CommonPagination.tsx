'use client'

interface PaginationProps {
    page: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    onPageChange: (page: number) => void
    total?: number
    limit?: number
}

export default function CommonPagination({
    page,
    pages,
    hasNext,
    hasPrev,
    onPageChange,
    total,
    limit = 10
}: PaginationProps) {
    // Hide if only one page exists
    if (pages <= 1) return null

    // Calculate current range
    const start = total !== undefined ? ((page - 1) * limit) + 1 : 0
    const end = total !== undefined ? Math.min(page * limit, total) : 0

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200/60 dark:border-slate-800/60 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 px-1">
            {/* Left side: Range information */}
            <div className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1 font-medium">
                {total !== undefined ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                        <span>Viewing</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{start}</span>
                        <span>to</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{end}</span>
                        <span>of</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{total}</span>
                        <span className="ml-0.5">results</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <span>Page</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{page}</span>
                        <span>of</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{pages}</span>
                    </div>
                )}
            </div>

            {/* Right side: Controls */}
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!hasPrev}
                    title="First page"
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Current / Total for mobile-friendly view */}
                <div className="px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums border border-transparent">
                    {page} <span className="text-slate-400 dark:text-slate-600 px-0.5">/</span> {pages}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(pages)}
                    disabled={!hasNext}
                    title="Last page"
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
