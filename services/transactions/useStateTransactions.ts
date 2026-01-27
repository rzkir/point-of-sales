import * as React from "react"

import { toast } from "sonner"

import { fetchTransactions } from "@/lib/config"

import {
    ColumnFiltersState, SortingState, getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { fetchBranches } from "@/lib/config"

import { createColumns } from "@/components/dashboard/transactions/modal/CreateColumnsTransactions"

export function useStateTransactions(
    onViewItems?: (transaction: TransactionRow) => void,
    initialPaymentStatusFilter?: string
) {
    const [transactions, setTransactions] = React.useState<TransactionRow[]>([])
    const [allFilteredTransactions, setAllFilteredTransactions] = React.useState<TransactionRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    // Pagination state
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [total, setTotal] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState(0)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)

    // Filter state
    const [statusFilter, setStatusFilter] = React.useState<string>("")
    const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>(initialPaymentStatusFilter || "")
    const [branchFilter, setBranchFilter] = React.useState<string>("")
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [searchInput, setSearchInput] = React.useState<string>("")

    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)

    React.useEffect(() => {
        const loadBranches = async () => {
            try {
                setIsLoadingBranches(true)
                const response = await fetchBranches()
                setBranches(response.data || [])
            } catch (error) {
                console.error("Failed to fetch branches:", error)
            } finally {
                setIsLoadingBranches(false)
            }
        }
        void loadBranches()
    }, [])


    const columns = React.useMemo(() => createColumns(onViewItems), [onViewItems])

    const table = useReactTable({
        data: transactions,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
    })

    // Calculate totals from all filtered transactions (not just paginated ones)
    const totalRevenue = React.useMemo(
        () => allFilteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0),
        [allFilteredTransactions]
    )
    const completedCount = React.useMemo(
        () => allFilteredTransactions.filter((t) => t.status === "completed").length,
        [allFilteredTransactions]
    )
    const pendingCount = React.useMemo(
        () => allFilteredTransactions.filter((t) => t.status === "pending").length,
        [allFilteredTransactions]
    )
    const totalDebt = React.useMemo(
        () => allFilteredTransactions.reduce((sum, t) => {
            // Calculate debt from due_amount if available, otherwise calculate from total - paid_amount
            const debt = t.due_amount !== undefined ? t.due_amount : Math.max(0, (t.total || 0) - (t.paid_amount || 0))
            return sum + debt
        }, 0),
        [allFilteredTransactions]
    )

    // Count unique users that still have debt
    const usersWithDebtCount = React.useMemo(() => {
        const users = new Set<string>()

        allFilteredTransactions.forEach((t) => {
            const debt = t.due_amount !== undefined
                ? t.due_amount
                : Math.max(0, (t.total || 0) - (t.paid_amount || 0))

            if (debt > 0) {
                const identifier = String((t as TransactionRow & { customer_id?: string | number }).customer_id ?? t.customer_name ?? "").trim()
                if (identifier) {
                    users.add(identifier)
                }
            }
        })

        return users.size
    }, [allFilteredTransactions])

    const loadTransactions = React.useCallback(async () => {
        try {
            setIsLoading(true)
            // Fetch all transactions (with high limit to get all data for filtering)
            const response = await fetchTransactions(1, 10000)

            const fetchedTransactions = response.data || []

            // Apply filters client-side
            let filtered = fetchedTransactions

            if (statusFilter) {
                filtered = filtered.filter(t => String(t.status || '').toLowerCase() === statusFilter.toLowerCase())
            }

            if (paymentStatusFilter) {
                filtered = filtered.filter(t => String(t.payment_status || '').toLowerCase() === paymentStatusFilter.toLowerCase())
            }

            if (branchFilter) {
                filtered = filtered.filter(t => String(t.branch_name || '').toLowerCase().includes(branchFilter.toLowerCase()))
            }

            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase()
                filtered = filtered.filter(t => {
                    const transactionNumber = String(t.transaction_number || '').toLowerCase()
                    const customerName = String(t.customer_name || '').toLowerCase()
                    return transactionNumber.includes(searchLower) || customerName.includes(searchLower)
                })
            }

            // Store all filtered transactions for statistics calculation
            setAllFilteredTransactions(filtered)

            // Apply pagination
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedTransactions = filtered.slice(startIndex, endIndex)

            setTransactions(paginatedTransactions)

            // Update pagination metadata based on filtered results
            const totalFiltered = filtered.length
            const totalPagesFiltered = Math.ceil(totalFiltered / limit)

            setTotal(totalFiltered)
            setTotalPages(totalPagesFiltered)
            setHasNext(page < totalPagesFiltered)
            setHasPrev(page > 1)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch transactions")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, statusFilter, paymentStatusFilter, branchFilter, searchQuery])

    React.useEffect(() => {
        void loadTransactions()
    }, [loadTransactions])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
        }
    }

    const handleLimitChange = (newLimit: string) => {
        const limitNum = parseInt(newLimit, 10)
        setLimit(limitNum)
        setPage(1) // Reset to first page when limit changes
    }

    const handleFilterChange = React.useCallback((filters: {
        status?: string
        payment_status?: string
        branch_name?: string
        search?: string
    }) => {
        if (filters.status !== undefined) setStatusFilter(filters.status)
        if (filters.payment_status !== undefined) setPaymentStatusFilter(filters.payment_status)
        if (filters.branch_name !== undefined) setBranchFilter(filters.branch_name)
        if (filters.search !== undefined) setSearchQuery(filters.search)
        setPage(1) // Reset to first page when filter changes
    }, [])

    const clearFilters = React.useCallback(() => {
        setStatusFilter("")
        setPaymentStatusFilter("")
        setBranchFilter("")
        setSearchQuery("")
        setSearchInput("")
        setPage(1)
    }, [])

    const handleApplySearch = React.useCallback(() => {
        setSearchQuery(searchInput)
        setPage(1) // Reset to first page when search is applied
    }, [searchInput])

    return {
        transactions,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadTransactions,
        handlePageChange,
        handleLimitChange,
        // Filters
        statusFilter,
        paymentStatusFilter,
        branchFilter,
        searchQuery,
        searchInput,
        setStatusFilter,
        setPaymentStatusFilter,
        setBranchFilter,
        setSearchQuery,
        setSearchInput,
        handleFilterChange,
        clearFilters,
        handleApplySearch,
        // Totals
        totalRevenue,
        completedCount,
        pendingCount,
        totalDebt,
        usersWithDebtCount,
        isLoadingBranches,
        branches,
        table,
    }
}
