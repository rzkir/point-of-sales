import * as React from "react"

import { toast } from "sonner"

import {
    fetchProducts,
    fetchSupplierById,
    fetchBranchById,
    fetchCategories,
} from "@/lib/config"

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

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
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)

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

    const loadProducts = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetchProducts(page, limit)

            // Sort products by created_at descending (newest first)
            const sortedProducts = (response.data || []).sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                return dateB - dateA // Descending order (newest first)
            })

            setProducts(sortedProducts)

            // Update pagination metadata
            if (response.pagination) {
                setTotal(response.pagination.total || 0)
                setTotalPages(response.pagination.totalPages || 0)
                setHasNext(response.pagination.hasNext || false)
                setHasPrev(response.pagination.hasPrev || false)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch products")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit])

    React.useEffect(() => {
        void loadProducts()
    }, [loadProducts])

    // Load human readable names for the selected product when details dialog is open
    React.useEffect(() => {
        if (!showDetailsDialog || !selectedProduct) {
            setSupplierName(null)
            setBranchName(null)
            setCategoryName(null)
            return
        }

        void (async () => {
            try {
                if (selectedProduct.supplier_id) {
                    const res = await fetchSupplierById(selectedProduct.supplier_id)
                    setSupplierName(res.data.name)
                } else {
                    setSupplierName(null)
                }

                if (selectedProduct.branch_id) {
                    const res = await fetchBranchById(selectedProduct.branch_id)
                    setBranchName(res.data.name)
                } else {
                    setBranchName(null)
                }

                if (selectedProduct.category_id) {
                    const res = await fetchCategories()
                    const found = res.data.find(
                        (c: { id: number | string; name?: string | null }) =>
                            String(c.id) === String(selectedProduct.category_id)
                    )
                    setCategoryName(found?.name ?? null)
                } else {
                    setCategoryName(null)
                }
            } catch {
                // Biarkan fallback ke value yang sudah ada di selectedProduct
            }
        })()
    }, [showDetailsDialog, selectedProduct])

    const activeCount = products.filter((p) => p.is_active).length

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
    }
}

