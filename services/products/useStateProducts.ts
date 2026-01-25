import * as React from "react"

import { toast } from "sonner"

import {
    fetchProducts,
    fetchSupplierById,
    fetchBranchById,
    fetchCategories,
    fetchBranches,
    fetchSuppliers,
} from "@/lib/config"

import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type ColumnFiltersState, type SortingState } from "@tanstack/react-table"

import { createColumns } from "@/components/dashboard/products/modal/CreateColumsProducts"

export function useStateProducts() {
    const [products, setProducts] = React.useState<ProductRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    // Pagination state
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [total, setTotal] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState(0)

    // Derived pagination values
    const hasNext = React.useMemo(() => page < totalPages, [page, totalPages])
    const hasPrev = React.useMemo(() => page > 1, [page])

    // Dialog & detail state
    const [selectedProduct, setSelectedProduct] = React.useState<ProductRow | null>(null)

    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

    const [showDetailsDialog, setShowDetailsDialog] = React.useState(false)

    const [showSupplierDialog, setShowSupplierDialog] = React.useState(false)
    const [supplier, setSupplier] = React.useState<SupplierRow | null>(null)
    const [isLoadingSupplier, setIsLoadingSupplier] = React.useState(false)

    const [showBranchDialog, setShowBranchDialog] = React.useState(false)
    const [branch, setBranch] = React.useState<BranchRow | null>(null)
    const [isLoadingBranch, setIsLoadingBranch] = React.useState(false)

    // Product details dialog derived names
    const [supplierName, setSupplierName] = React.useState<string | null>(null)
    const [branchName, setBranchName] = React.useState<string | null>(null)
    const [categoryName, setCategoryName] = React.useState<string | null>(null)

    // Filter options (branches, categories, suppliers) - fetched separately from all data
    const [branchOptions, setBranchOptions] = React.useState<string[]>([])
    const [categoryOptions, setCategoryOptions] = React.useState<string[]>([])
    const [supplierOptions, setSupplierOptions] = React.useState<string[]>([])

    // Filter sheet state
    const [filterSheetOpen, setFilterSheetOpen] = React.useState(false)

    // Local state for search input (not applied until "Terapkan" is clicked)
    const [searchInput, setSearchInput] = React.useState("")

    // Handler to apply search filter
    const handleApplySearch = () => {
        setColumnFilters((prev: ColumnFiltersState) => {
            const rest = prev.filter((f) => f.id !== "name")
            if (searchInput.trim() !== "") {
                return [...rest, { id: "name", value: searchInput.trim() }]
            }
            return rest
        })
    }

    // Handler for Enter key in search input
    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleApplySearch()
        }
    }


    // Helper function to extract filter value
    const getFilterValue = React.useCallback((filterId: string): string => {
        const filter = columnFilters.find((f) => f.id === filterId)
        return (filter?.value as string) || ""
    }, [columnFilters])

    // Get filters from columnFilters
    const branchFilter = React.useMemo(() => getFilterValue("branch_name"), [getFilterValue])
    const categoryFilter = React.useMemo(() => getFilterValue("category_name"), [getFilterValue])
    const supplierFilter = React.useMemo(() => getFilterValue("supplier_name"), [getFilterValue])
    const statusFilter = React.useMemo(() => getFilterValue("is_active"), [getFilterValue])
    const searchFilter = React.useMemo(() => getFilterValue("name"), [getFilterValue])

    // Memoize filter values to prevent unnecessary re-renders
    const filterParams = React.useMemo(() => ({
        branchFilter: branchFilter || undefined,
        categoryFilter: categoryFilter || undefined,
        supplierFilter: supplierFilter || undefined,
        searchFilter: searchFilter || undefined,
    }), [branchFilter, categoryFilter, supplierFilter, searchFilter])

    const loadProducts = React.useCallback(async () => {
        try {
            setIsLoading(true)

            const response = await fetchProducts(
                page,
                limit,
                filterParams.branchFilter,
                undefined,
                filterParams.categoryFilter,
                filterParams.supplierFilter,
                filterParams.searchFilter
            )

            setProducts(response.data || [])

            // Update pagination metadata
            if (response.pagination) {
                setTotal(response.pagination.total || 0)
                setTotalPages(response.pagination.totalPages || 0)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch products")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit, filterParams])

    // Load products when dependencies change
    React.useEffect(() => {
        void loadProducts()
    }, [loadProducts])

    // Reset to page 1 when any filter changes (but prevent double fetch)
    const prevFilters = React.useRef(filterParams)
    React.useEffect(() => {
        const filtersChanged =
            prevFilters.current.branchFilter !== filterParams.branchFilter ||
            prevFilters.current.categoryFilter !== filterParams.categoryFilter ||
            prevFilters.current.supplierFilter !== filterParams.supplierFilter ||
            prevFilters.current.searchFilter !== filterParams.searchFilter

        if (filtersChanged && page !== 1) {
            setPage(1)
        }
        prevFilters.current = filterParams
    }, [filterParams, page])

    // Fetch all branches, categories, and suppliers for filter options
    React.useEffect(() => {
        void (async () => {
            try {
                const [branchesRes, categoriesRes, suppliersRes] = await Promise.all([
                    fetchBranches(),
                    fetchCategories(),
                    fetchSuppliers(),
                ])

                setBranchOptions(
                    branchesRes.data.map((b) => b.name).filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
                setCategoryOptions(
                    categoriesRes.data.map((c) => c.name).filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
                setSupplierOptions(
                    suppliersRes.data.map((s) => s.name).filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to load filter options")
            }
        })()
    }, [])

    // Load human readable names for the selected product when details dialog is open
    React.useEffect(() => {
        if (!showDetailsDialog || !selectedProduct) {
            setSupplierName(null)
            setBranchName(null)
            setCategoryName(null)
            return
        }

        let cancelled = false

        void (async () => {
            try {
                if (selectedProduct.supplier_id) {
                    const res = await fetchSupplierById(selectedProduct.supplier_id)
                    if (!cancelled) setSupplierName(res.data.name)
                } else {
                    if (!cancelled) setSupplierName(null)
                }

                if (selectedProduct.branch_id) {
                    const res = await fetchBranchById(selectedProduct.branch_id)
                    if (!cancelled) setBranchName(res.data.name)
                } else {
                    if (!cancelled) setBranchName(null)
                }

                if (selectedProduct.category_id) {
                    const res = await fetchCategories()
                    const found = res.data.find(
                        (c: { id: number | string; name?: string | null }) =>
                            String(c.id) === String(selectedProduct.category_id)
                    )
                    if (!cancelled) setCategoryName(found?.name ?? null)
                } else {
                    if (!cancelled) setCategoryName(null)
                }
            } catch {
                // Biarkan fallback ke value yang sudah ada di selectedProduct
            }
        })()

        return () => {
            cancelled = true
        }
    }, [showDetailsDialog, selectedProduct])

    // Memoize activeCount to prevent recalculation on every render
    const activeCount = React.useMemo(
        () => products.filter((p) => p.is_active).length,
        [products]
    )

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

    const handleOpenDeleteDialog = React.useCallback((product: ProductRow) => {
        setSelectedProduct(product)
        setShowDeleteDialog(true)
    }, [])

    const handleViewDetails = React.useCallback((product: ProductRow) => {
        setSelectedProduct(product)
        setShowDetailsDialog(true)
    }, [])

    const handleViewSupplier = React.useCallback(
        async (product: ProductRow) => {
            // Gunakan supplier_id sebagai ID asli supplier
            if (!product.supplier_id) {
                toast.error("No supplier assigned to this product")
                return
            }

            setIsLoadingSupplier(true)
            setShowSupplierDialog(true)
            try {
                const response = await fetchSupplierById(product.supplier_id)
                setSupplier(response.data)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to fetch supplier")
                setShowSupplierDialog(false)
            } finally {
                setIsLoadingSupplier(false)
            }
        },
        []
    )

    const handleViewBranch = React.useCallback(
        async (product: ProductRow) => {
            if (!product.branch_id) {
                toast.error("No branch assigned to this product")
                return
            }

            setIsLoadingBranch(true)
            setShowBranchDialog(true)
            try {
                const response = await fetchBranchById(product.branch_id)
                setBranch(response.data)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to fetch branch")
                setShowBranchDialog(false)
            } finally {
                setIsLoadingBranch(false)
            }
        },
        []
    )

    const handleApplyProductFilters = React.useCallback(
        (branch: string, category: string, supplier: string, status: string) => {
            setColumnFilters((prev) => {
                const filterIds = ["branch_name", "category_name", "supplier_name", "is_active"]
                const rest = prev.filter((f) => !filterIds.includes(f.id))
                const next = [...rest]
                if (branch) next.push({ id: "branch_name", value: branch })
                if (category) next.push({ id: "category_name", value: category })
                if (supplier) next.push({ id: "supplier_name", value: supplier })
                if (status) next.push({ id: "is_active", value: status })
                return next
            })
        },
        []
    )

    const columns = React.useMemo(
        () =>
            createColumns({
                onDelete: (product) => handleOpenDeleteDialog(product),
                onViewSupplier: (product) => void handleViewSupplier(product),
                onViewBranch: (product) => void handleViewBranch(product),
                onViewDetails: (product) => handleViewDetails(product),
            }),
        [handleOpenDeleteDialog, handleViewSupplier, handleViewBranch, handleViewDetails]
    )


    const table = useReactTable({
        data: products,
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

    return {
        products,
        isLoading,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        table,
        loadProducts,
        activeCount,
        handlePageChange,
        handleLimitChange,
        // Dialog state & handlers
        selectedProduct,
        showDeleteDialog,
        setShowDeleteDialog,
        showDetailsDialog,
        setShowDetailsDialog,
        showSupplierDialog,
        setShowSupplierDialog,
        showBranchDialog,
        setShowBranchDialog,
        supplier,
        isLoadingSupplier,
        branch,
        isLoadingBranch,
        supplierName,
        branchName,
        categoryName,
        handleOpenDeleteDialog,
        handleViewDetails,
        handleViewSupplier,
        handleViewBranch,
        // Filter options
        branchOptions,
        categoryOptions,
        supplierOptions,
        // Filter state & handlers
        filterSheetOpen,
        setFilterSheetOpen,
        branchFilter,
        categoryFilter,
        supplierFilter,
        statusFilter,
        searchFilter,
        handleApplyProductFilters,
        searchInput,
        setSearchInput,
        handleApplySearch,
        handleSearchKeyDown,
    }
}