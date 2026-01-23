import * as React from "react"

import { toast } from "sonner"

import { fetchCategories } from "@/lib/config"

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

export function useStateCategories() {
    const [categories, setCategories] = React.useState<CategoryRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const loadCategories = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchCategories()
            setCategories(result.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch categories")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        void loadCategories()
    }, [loadCategories])

    return {
        categories,
        isLoading,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        loadCategories,
    }
}

