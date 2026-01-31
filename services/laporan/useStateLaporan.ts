import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG, fetchLaporan } from "@/lib/config"

export function useStateLaporan(branchName?: string, statusFilter?: string) {
    const [expenses, setExpenses] = React.useState<StoreExpenseRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [total, setTotal] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState(0)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)

    /** Upload receipt file for receipt_url (laporan). Returns URL or throws. */
    const uploadReceipt = React.useCallback(async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(API_CONFIG.ENDPOINTS.laporan.upload, {
            method: "POST",
            body: formData,
            credentials: "include",
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Gagal mengunggah bukti")
        if (!data.url) throw new Error("URL bukti tidak diterima")
        return data.url
    }, [])

    const loadLaporan = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchLaporan(page, limit, branchName, statusFilter)
            setExpenses(result.data || [])
            const pagination = result.pagination
            if (pagination) {
                setTotal(pagination.total)
                setTotalPages(pagination.totalPages)
                setHasNext(pagination.hasNext)
                setHasPrev(pagination.hasPrev)
            }
        } catch (error) {
            console.error("Fetch laporan error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal memuat laporan pengeluaran")
            setExpenses([])
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, branchName, statusFilter])

    React.useEffect(() => {
        void loadLaporan()
    }, [loadLaporan])

    const handlePageChange = React.useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
    }, [totalPages])

    const handleLimitChange = React.useCallback((newLimit: string) => {
        setLimit(parseInt(newLimit, 10) || 10)
        setPage(1)
    }, [])

    return {
        expenses,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        uploadReceipt,
        loadLaporan,
        handlePageChange,
        handleLimitChange,
    }
}
