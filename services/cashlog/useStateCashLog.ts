import * as React from "react"

import { toast } from "sonner"

import { fetchCashLogs } from "@/lib/config"

export function useStateCashLog(branchName?: string) {
    const [cashLogs, setCashLogs] = React.useState<CashLogRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [total, setTotal] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState(0)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)

    const loadCashLogs = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchCashLogs(page, limit, branchName)
            setCashLogs(result.data || [])
            const pagination = result.pagination
            if (pagination) {
                setTotal(pagination.total)
                setTotalPages(pagination.totalPages)
                setHasNext(pagination.hasNext)
                setHasPrev(pagination.hasPrev)
            }
        } catch (error) {
            console.error("Fetch cash logs error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal memuat pembekuan kas")
            setCashLogs([])
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, branchName])

    React.useEffect(() => {
        void loadCashLogs()
    }, [loadCashLogs])

    const handlePageChange = React.useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
    }, [totalPages])

    const handleLimitChange = React.useCallback((newLimit: string) => {
        setLimit(parseInt(newLimit, 10) || 10)
        setPage(1)
    }, [])

    return {
        cashLogs,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadCashLogs,
        handlePageChange,
        handleLimitChange,
    }
}
