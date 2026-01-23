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

import { fetchEmployees } from "@/lib/config"

import { CreateColumns } from "@/components/dashboard/employees/modal/CreateColumns"

export function useStateEmployee() {
    const [employees, setEmployees] = React.useState<EmployeeRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const loadEmployees = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchEmployees()
            setEmployees(result.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch employees")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadEmployees()
    }, [loadEmployees])

    const columns = React.useMemo(() => CreateColumns(loadEmployees), [loadEmployees])

    const table = useReactTable({
        data: employees,
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
        employees,
        isLoading,
        loadEmployees,
        table,
    }
}