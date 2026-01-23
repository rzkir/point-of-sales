import * as React from "react"

import { toast } from "sonner"

import { fetchBranches } from "@/lib/config"

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

export function useStateBranches() {
    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const loadBranches = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchBranches()
            setBranches(
                result.data.map((branch) => ({
                    ...branch,
                    address: branch.address || "",
                })) || []
            )
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch branches")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        void loadBranches()
    }, [loadBranches])

    return {
        branches,
        isLoading,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        loadBranches,
    }
}

