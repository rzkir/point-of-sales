"use client"

import * as React from "react"

import { toast } from "sonner"

import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type SortingState,
} from "@tanstack/react-table"

import { fetchSuppliers } from "@/lib/config"

import { CreateColumns } from "@/components/dashboard/suppliers/modal/CreateColumnsSuppliers"

export function useStateSuppliers() {
    const [suppliers, setSuppliers] = React.useState<SupplierRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const loadSuppliers = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchSuppliers()
            setSuppliers(result.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch suppliers")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadSuppliers()
    }, [loadSuppliers])

    const columns = React.useMemo(() => CreateColumns(loadSuppliers), [loadSuppliers])

    const table = useReactTable({
        data: suppliers,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return {
        suppliers,
        isLoading,
        loadSuppliers,
        table,
    }
}

